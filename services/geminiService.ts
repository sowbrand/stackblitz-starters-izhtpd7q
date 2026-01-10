import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    ExtractedData, 
    BatchProduct, 
    ConsolidatedProduct, 
    PriceUpdateData,
    PriceDatabaseEntry
} from '@/types';

const getApiKey = () => process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Lista de modelos para tentar (do mais rápido para o mais robusto)
// Se um der 404, o código tenta o próximo automaticamente.
const MODEL_NAMES = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001"
];

const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Content = result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = error => reject(error);
    });
};

const cleanJsonString = (text: string): string => {
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        const lastBracket = clean.lastIndexOf(']');
        if (lastBracket !== -1) return clean.substring(firstBracket, lastBracket + 1);
    }
    
    if (firstBrace !== -1) {
        const lastBrace = clean.lastIndexOf('}');
        if (lastBrace !== -1) return clean.substring(firstBrace, lastBrace + 1);
    }
    return clean;
};

const PROMPT_SINGLE_FILE = `
Atue como um especialista em extração de dados de fichas técnicas têxteis.
Analise a imagem fornecida. Extraia os dados com precisão total.

1. **Cabeçalho:**
   - Encontre "Artigo:" -> O número ao lado é o 'product_code' (Ex: 13030, 50001). Mantenha zeros.
   - Texto ao lado do código -> 'product_name' (Ex: MALHA MAGLIA EXTRA...).
   - "Larg:" -> 'width_m' (formato numérico, ex: 1.20).
   - "Gram:" -> 'grammage_gsm' (formato numérico, ex: 225).
   - "Composição:" -> 'composition'.

2. **Tabela de Preços (ATENÇÃO):**
   - A tabela tem colunas como: Classificação | R$/M2 | Á Vista | 14 Dias...
   - Você DEVE extrair o valor da coluna **"Á Vista"** (ou "A Vista").
   - Ignore R$/M2. Ignore prazos (14 dias, 28 dias).
   - Mapeie a "Classificação" para 'category_normalized':
     - "BRANCO" -> "Branco"
     - "CLARA" -> "Claras"
     - "MÉDIA" -> "Mescla"
     - "ESCURA" -> "EscurasFortes"
     - "EXTRA" / "ESPECIAL" -> "Especiais"
     - "PRETO" -> "Preto"

Retorne APENAS um JSON válido com este formato (sem texto extra):
{
  "supplier_name": "Urbano Têxtil",
  "product_code": "string",
  "product_name": "string",
  "composition": "string",
  "specs": { "width_m": number, "grammage_gsm": number },
  "price_list": [
    { "category_normalized": "string", "original_category_name": "string", "price_cash_kg": number }
  ]
}
`;

// --- FUNÇÃO PRINCIPAL ---

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey || apiKey.length < 10) {
        throw new Error("Chave API inválida. Verifique .env.local e reinicie.");
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const results: BatchProduct[] = [];
    const errors: string[] = [];

    // Loop pelos arquivos
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let success = false;

        // Loop pelos modelos (Tentativa em Cascata)
        for (const modelName of MODEL_NAMES) {
            if (success) break; // Se já funcionou com um modelo, para de tentar outros

            try {
                // Só loga a tentativa do primeiro modelo para não poluir, ou se for retentativa
                if (modelName === MODEL_NAMES[0]) {
                    console.log(`[${i+1}/${files.length}] Enviando ${file.name} (Tentando ${modelName})...`);
                }

                const model = ai.getGenerativeModel({ model: modelName });
                const base64 = await fileToBase64(file);
                
                const result = await model.generateContent([
                    PROMPT_SINGLE_FILE, 
                    { inlineData: { data: base64, mimeType: file.type } }
                ]);
                
                const text = result.response.text();
                const parsed = JSON.parse(cleanJsonString(text));
                
                // Normaliza resposta
                let item: any = Array.isArray(parsed) ? parsed[0] : parsed;

                if (item && item.product_code) {
                    results.push({
                        supplier_name: item.supplier_name || "Fornecedor Detectado",
                        product_code: String(item.product_code).trim(),
                        product_name: String(item.product_name).trim(),
                        composition: String(item.composition).trim(),
                        specs: {
                            width_m: Number(item.specs?.width_m || 0),
                            grammage_gsm: Number(item.specs?.grammage_gsm || 0)
                        },
                        price_list: Array.isArray(item.price_list) ? item.price_list : []
                    });
                    success = true; // Marcar como sucesso para sair do loop de modelos
                } 

            } catch (error: any) {
                const msg = String(error);
                // Se for erro 404 (Modelo não encontrado), tenta o próximo silenciosamente
                if (msg.includes("404") || msg.includes("not found")) {
                    console.warn(`Modelo ${modelName} falhou (404). Tentando próximo...`);
                    continue; 
                }
                
                // Se for erro de Cota (429), espera e tenta o mesmo modelo de novo? 
                // Não, melhor abortar esse arquivo e esperar para o próximo.
                if (msg.includes("429")) {
                    console.warn("Limite de taxa (429). Aguardando 10s...");
                    await new Promise(r => setTimeout(r, 10000));
                    errors.push(`${file.name}: Limite de API excedido.`);
                    break; // Sai do loop de modelos, vai para o proximo arquivo
                }

                // Outros erros
                console.error(`Erro com ${modelName}:`, error);
            }
        }

        if (!success) {
            errors.push(`${file.name}: Falha em todos os modelos.`);
        }
        
        // Pausa de segurança entre arquivos (4s)
        if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }

    if (results.length === 0) {
        const errorDetail = errors.length > 0 ? ` Detalhe: ${errors[0]}` : "";
        throw new Error(`Falha total. Nenhum arquivo processado.${errorDetail}`);
    }

    return results;
}

// --- MÉTODOS DE SUPORTE ---

export async function extractDataFromFile(file: File): Promise<ExtractedData> {
    try {
        const batch = await extractBatchDataFromFiles([file]);
        if (batch.length > 0) {
            const p = batch[0];
            return {
                supplier: p.supplier_name,
                name: p.product_name,
                code: p.product_code,
                composition: p.composition,
                technical_specs: { 
                    width_m: p.specs.width_m, 
                    grammage_gsm: p.specs.grammage_gsm, 
                    yield_m_kg: 0, shrinkage_pct: '', torque_pct: '' 
                },
                features: [], usage_indications: [], color_palettes: [],
                price_table: p.price_list.map(pl => ({ category: String(pl.category_normalized), price: pl.price_cash_kg })),
                complement: p.complement ? { code: '', name: p.complement.info } : undefined
            };
        }
    } catch (e) { console.error(e); }
    throw new Error("Não foi possível ler o arquivo.");
}

export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) return [];
    try {
        const ai = new GoogleGenerativeAI(apiKey);
        // Usa o flash padrão aqui
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64 = await fileToBase64(file);
        const prompt = `Analise tabela preços. JSON Array: { supplier, code, name, is_complement, specs: { width_m, grammage_gsm, yield_m_kg, composition }, price_list: [{ category, original_label, price_cash }] }`;
        const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: file.type } }]);
        const parsed = JSON.parse(cleanJsonString(result.response.text()));
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

export async function extractPriceUpdateData(file: File): Promise<PriceUpdateData[]> {
    const data = await extractConsolidatedPriceListData(file);
    return data.map(d => ({
        supplier_name: d.supplier,
        product_code: d.code,
        product_name: d.name,
        price_list: d.price_list.map(p => ({ category_normalized: p.category, price_cash_kg: p.price_cash }))
    }));
}

export async function extractPriceListData(file: File): Promise<PriceDatabaseEntry> {
    try {
        const data = await extractBatchDataFromFiles([file]);
        return { supplier_name: data[0]?.supplier_name || "Desconhecido", products: data };
    } catch {
        return { supplier_name: "Erro", products: [] };
    }
}