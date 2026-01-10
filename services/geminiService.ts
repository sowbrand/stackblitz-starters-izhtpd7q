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

// CORREÇÃO: Limpeza Robusta de JSON
// A IA as vezes coloca texto antes ou depois. Isso pega só o objeto JSON.
const cleanJsonString = (text: string): string => {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        return text.substring(firstBrace, lastBrace + 1);
    }
    
    // Fallback: tenta limpar markdown
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- PROMPT INDIVIDUAL (Fidelidade 100%) ---
// Pedimos um OBJETO simples {}, não um Array []
const PROMPT_SINGLE_FILE = `
Analise esta ficha técnica. Extraia dados EXATAMENTE como escritos.
Retorne APENAS um JSON válido.

Campos Obrigatórios:
1. supplier_name: Sempre "Urbano Têxtil" (baseado no layout).
2. product_code: O número em "Artigo". (Ex: "13030", "026105"). Mantenha zeros à esquerda se houver.
3. product_name: O texto após o código do artigo (Ex: "MALHA MAGLIA EXTRA...").
4. composition: O que estiver em "Composição" ou "Comp".
5. specs: 
   - width_m: Valor de "Larg" (Converta para número float, ex: 1,80 -> 1.80).
   - grammage_gsm: Valor de "Gram" (Número inteiro).
6. price_list:
   - Extraia a tabela de preços.
   - Use a coluna "Á Vista" como preço base (price_cash_kg).
   - Mapeie "Classificação" para "category_normalized":
     - "BRANCO" -> "Branco"
     - "CLARA" -> "Claras"
     - "MÉDIA" -> "Mescla"
     - "ESCURA" -> "EscurasFortes"
     - "EXTRA" / "ESPECIAL" -> "Especiais"
     - "PRETO" -> "Preto"
   - "original_category_name": O nome exato que está na tabela (Ex: "BRANCO", "MÉDIA").

Exemplo de formato de retorno (SEM ARRAY EM VOLTA):
{
  "supplier_name": "Urbano Têxtil",
  "product_code": "13030",
  "product_name": "MALHA MAGLIA EXTRA",
  "composition": "100% ALGODÃO",
  "specs": { "width_m": 1.20, "grammage_gsm": 225 },
  "price_list": [
    { "category_normalized": "Branco", "original_category_name": "BRANCO", "price_cash_kg": 53.07 }
  ]
}
`;

// --- FUNÇÃO DE PROCESSAMENTO ---

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Chave API não configurada. Verifique .env.local");
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const results: BatchProduct[] = [];

    // Processa um por um para garantir que não misture dados
    await Promise.all(files.map(async (file) => {
        try {
            const base64 = await fileToBase64(file);
            
            const result = await model.generateContent([
                PROMPT_SINGLE_FILE, 
                { inlineData: { data: base64, mimeType: file.type } }
            ]);
            
            const text = result.response.text();
            // console.log(`Raw AI Response for ${file.name}:`, text); // Descomente para debug

            const cleanedJson = cleanJsonString(text);
            const parsed = JSON.parse(cleanedJson);

            // Validação para garantir que é um objeto válido e não lixo
            if (parsed.product_code && Array.isArray(parsed.price_list)) {
                results.push(parsed);
            } else {
                console.warn(`Arquivo ${file.name} ignorado: JSON incompleto`, parsed);
            }

        } catch (error) {
            console.error(`Erro ao ler arquivo ${file.name}:`, error);
            // Não paramos o loop, apenas este arquivo falha
        }
    }));

    if (results.length === 0) {
        throw new Error("Nenhum produto identificado. Verifique se a chave API é válida e se as imagens são fichas técnicas legíveis.");
    }

    return results;
}

// --- OUTRAS FUNÇÕES (Mantidas para compatibilidade) ---

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
    // Reutiliza a lógica robusta de batch
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