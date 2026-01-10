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
            // Remove o prefixo "data:image/jpeg;base64," para enviar apenas os bytes
            const base64Content = result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = error => reject(error);
    });
};

// Limpeza de JSON universal (Aceita Objeto ou Array)
const cleanJsonString = (text: string): string => {
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    
    // Se começar com [, é lista. Se começar com {, é objeto.
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        const lastBracket = clean.lastIndexOf(']');
        return clean.substring(firstBracket, lastBracket + 1);
    }
    
    if (firstBrace !== -1) {
        const lastBrace = clean.lastIndexOf('}');
        return clean.substring(firstBrace, lastBrace + 1);
    }
    
    return clean;
};

// Prompt focado na estrutura das suas imagens
const PROMPT_SINGLE_FILE = `
Analise esta imagem técnica (tabela de preços de tecidos).
Extraia os dados EXATAMENTE como estão escritos. NÃO invente dados.

Identifique:
1. Código/Artigo: (Ex: "13030", "026105").
2. Nome/Descrição: (Ex: "MALHA MAGLIA EXTRA").
3. Composição.
4. Especificações: Largura (m) e Gramatura (g/m²).
5. Tabela de Preços (Coluna "Á Vista"):
   - Associe a classificação (BRANCO, CLARA, MÉDIA, etc) ao preço.
   - Normalize as chaves para: "Branco", "Claras", "Mescla", "EscurasFortes", "Especiais", "Preto".

Retorne JSON puro. Formato Obrigatório:
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

// --- PROCESSAMENTO SEQUENCIAL (Mais seguro para API Gratuita) ---

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Chave API não configurada. Verifique .env.local");
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const results: BatchProduct[] = [];

    // Loop Sequencial (um por um) para não estourar limite da API
    for (const file of files) {
        try {
            console.log(`Processando arquivo: ${file.name}...`);
            const base64 = await fileToBase64(file);
            
            const result = await model.generateContent([
                PROMPT_SINGLE_FILE, 
                { inlineData: { data: base64, mimeType: file.type } }
            ]);
            
            const text = result.response.text();
            const cleanedJson = cleanJsonString(text);
            
            let parsed;
            try {
                parsed = JSON.parse(cleanedJson);
            } catch (e) {
                console.warn(`Erro de JSON no arquivo ${file.name}. Texto recebido:`, text);
                continue; // Pula para o próximo arquivo se falhar
            }

            // Normalização: Se a IA devolveu Array, pega o primeiro item. Se devolveu Objeto, usa ele.
            let item: any = null;
            if (Array.isArray(parsed)) {
                item = parsed[0];
            } else if (parsed && typeof parsed === 'object') {
                item = parsed;
            }

            // Validação final
            if (item && item.product_code) {
                // Força conversoes de tipo para evitar bugs
                const safeItem: BatchProduct = {
                    supplier_name: item.supplier_name || "Desconhecido",
                    product_code: String(item.product_code),
                    product_name: String(item.product_name),
                    composition: String(item.composition),
                    specs: {
                        width_m: Number(item.specs?.width_m || 0),
                        grammage_gsm: Number(item.specs?.grammage_gsm || 0)
                    },
                    price_list: Array.isArray(item.price_list) ? item.price_list : []
                };
                results.push(safeItem);
            } 

        } catch (error) {
            console.error(`Erro ao processar ${file.name}:`, error);
            // Continua o loop mesmo se um falhar
        }
        
        // Pequena pausa de 1 segundo entre requisições para respeitar o rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (results.length === 0) {
        throw new Error("Nenhum produto identificado. Verifique se a Chave API é válida e se você tem cota disponível.");
    }

    return results;
}

// --- MÉTODOS DE SUPORTE (Mantidos) ---

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
    throw new Error("Erro na leitura.");
}

export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    const batchData = await extractBatchDataFromFiles([file]);
    return batchData.map(b => ({
        supplier: b.supplier_name,
        code: b.product_code,
        name: b.product_name,
        is_complement: false,
        specs: { width_m: b.specs.width_m, grammage_gsm: b.specs.grammage_gsm, yield_m_kg: 0, composition: b.composition },
        price_list: b.price_list.map(pl => ({ 
            category: pl.category_normalized, 
            original_label: pl.original_category_name, 
            price_cash: pl.price_cash_kg 
        }))
    }));
}

export async function extractPriceUpdateData(file: File): Promise<PriceUpdateData[]> {
    const batchData = await extractBatchDataFromFiles([file]);
    return batchData.map(b => ({
        supplier_name: b.supplier_name,
        product_code: b.product_code,
        product_name: b.product_name,
        price_list: b.price_list.map(pl => ({
            category_normalized: pl.category_normalized,
            price_cash_kg: pl.price_cash_kg
        }))
    }));
}

export async function extractPriceListData(file: File): Promise<PriceDatabaseEntry> {
    const batchData = await extractBatchDataFromFiles([file]);
    return {
        supplier_name: batchData[0]?.supplier_name || "Desconhecido",
        products: batchData
    };
}