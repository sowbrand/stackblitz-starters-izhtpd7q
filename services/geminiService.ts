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
            const base64Content = result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = error => reject(error);
    });
};

const cleanJsonString = (text: string): string => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- PROMPT INDIVIDUAL (Mais preciso) ---
const PROMPT_SINGLE_FILE = `
Analise esta imagem de ficha técnica têxtil. Extraia os dados EXATAMENTE como estão escritos.
Não invente nada. Se não encontrar, deixe vazio ou 0.

Extraia:
1. "Artigo": Use APENAS os números (ex: "13030" ou "013030") para 'product_code'.
2. Descrição/Nome (ex: MALHA MAGLIA EXTRA).
3. Composição (ex: 100% ALGODÃO).
4. Largura (m) e Gramatura (g/m²).
5. TABELA DE PREÇOS ("Á Vista"):
   - Mapeie "Classificação" para:
     - "BRANCO" -> "Branco"
     - "CLARA" -> "Claras"
     - "MÉDIA" -> "Mescla"
     - "ESCURA" -> "EscurasFortes"
     - "EXTRA" / "ESPECIAL" -> "Especiais"
     - "PRETO" -> "Preto"
   - Pegue o valor da coluna "Á Vista".

Retorne APENAS um objeto JSON válido (sem array em volta):
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

// --- FUNÇÃO DE PROCESSAMENTO EM LOTE (UM POR UM) ---

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Chave API não configurada. Verifique o .env.local e REINICIE o servidor.");
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const results: BatchProduct[] = [];

    // Processa cada arquivo individualmente para garantir precisão máxima
    // Usamos Promise.all para ser rápido, mas tratamos erros individualmente
    await Promise.all(files.map(async (file) => {
        try {
            const base64 = await fileToBase64(file);
            
            const result = await model.generateContent([
                PROMPT_SINGLE_FILE, 
                { inlineData: { data: base64, mimeType: file.type } }
            ]);
            
            const text = result.response.text();
            console.log(`Leitura de ${file.name}:`, text); // Debug no Console

            try {
                const parsed = JSON.parse(cleanJsonString(text));
                // Validação básica para garantir que não veio lixo
                if (parsed.product_code || parsed.product_name) {
                    results.push(parsed);
                }
            } catch (jsonError) {
                console.warn(`Erro ao ler JSON de ${file.name}:`, text);
            }

        } catch (error) {
            console.error(`Falha ao processar arquivo ${file.name}:`, error);
            // Não quebra o loop, apenas ignora o arquivo com erro
        }
    }));

    if (results.length === 0) {
        throw new Error("Nenhum produto foi identificado nas imagens. Verifique se a chave API está correta ou se as imagens estão nítidas.");
    }

    return results;
}

// --- OUTRAS FUNÇÕES DE APOIO ---

export async function extractDataFromFile(file: File): Promise<ExtractedData> {
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
    throw new Error("Erro na leitura individual.");
}

export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    // Para listas longas, mantemos o prompt de lista, mas usamos a nova lógica de chave
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Chave API ausente.");

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64 = await fileToBase64(file);
        
        const prompt = `Analise a tabela de preços. Extraia TODOS os itens. JSON Array: { supplier, code, name, is_complement, specs: { width_m, grammage_gsm, yield_m_kg, composition }, price_list: [{ category, original_label, price_cash }] }`;
        
        const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: file.type } }]);
        const parsed = JSON.parse(cleanJsonString(result.response.text()));
        
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error(e);
        return [];
    }
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
    const data = await extractBatchDataFromFiles([file]);
    return {
        supplier_name: data[0]?.supplier_name || "Desconhecido",
        products: data
    };
}