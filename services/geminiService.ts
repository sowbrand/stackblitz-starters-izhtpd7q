import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    ExtractedData, 
    BatchProduct, 
    ConsolidatedProduct, 
    PriceUpdateData,
    PriceDatabaseEntry
} from '@/types';

const getApiKey = () => process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Garante que pegamos apenas o base64 puro, sem o cabeçalho data:image...
            const base64Content = result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = error => reject(error);
    });
};

const cleanJsonString = (text: string): string => {
    // Remove aspas de markdown e espaços extras
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Tenta encontrar o início e fim do JSON real (seja objeto ou array)
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    
    // Se achar colchete antes de chave, é lista
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        const lastBracket = clean.lastIndexOf(']');
        if (lastBracket !== -1) return clean.substring(firstBracket, lastBracket + 1);
    }
    
    // Se achar chave, é objeto
    if (firstBrace !== -1) {
        const lastBrace = clean.lastIndexOf('}');
        if (lastBrace !== -1) return clean.substring(firstBrace, lastBrace + 1);
    }
    
    return clean;
};

// Prompt calibrado para suas tabelas da Urbano (colunas R$/M2, Á Vista, etc)
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

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    
    // Verificação explícita da chave
    if (!apiKey || apiKey.length < 10) {
        throw new Error("Chave API inválida ou não configurada. Verifique o arquivo .env.local e REINICIE o servidor.");
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const results: BatchProduct[] = [];
    const errors: string[] = [];

    // Processamento sequencial com atraso maior para evitar bloqueio
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            console.log(`[${i+1}/${files.length}] Enviando ${file.name} para IA...`);
            const base64 = await fileToBase64(file);
            
            const result = await model.generateContent([
                PROMPT_SINGLE_FILE, 
                { inlineData: { data: base64, mimeType: file.type } }
            ]);
            
            const text = result.response.text();
            const parsed = JSON.parse(cleanJsonString(text));

            // Normaliza resposta (aceita objeto único ou array de 1 item)
            let item: any = Array.isArray(parsed) ? parsed[0] : parsed;

            if (item && item.product_code) {
                // Sanitização final dos dados
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
            } else {
                errors.push(`${file.name}: JSON incompleto`);
            }

        } catch (error: any) {
            let msg = error.message || "Erro desconhecido";
            if (msg.includes("403") || msg.includes("API key not valid")) {
                throw new Error("ERRO DE PERMISSÃO: Sua chave API foi rejeitada pelo Google. Verifique se copiou corretamente.");
            }
            if (msg.includes("429") || msg.includes("Quota")) {
                console.warn(`Cota excedida no arquivo ${file.name}. Tentando continuar...`);
                // Se der erro de cota, espera mais 5 segundos antes do próximo
                await new Promise(r => setTimeout(r, 5000));
            }
            console.error(`Falha em ${file.name}:`, error);
            errors.push(`${file.name}: ${msg}`);
        }
        
        // PAUSA DE SEGURANÇA: 3.5 segundos entre requisições (Essencial para conta Free)
        if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3500));
        }
    }

    if (results.length === 0) {
        // Se falhou tudo, mostra o erro do primeiro arquivo para ajudar no debug
        const errorDetail = errors.length > 0 ? ` Detalhe: ${errors[0]}` : "";
        throw new Error(`Falha total. Nenhum dos ${files.length} arquivos foi processado.${errorDetail}`);
    }

    return results;
}

// --- MÉTODOS DE SUPORTE (Mantidos para compatibilidade) ---

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