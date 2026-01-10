import { 
    GoogleGenerativeAI, 
    HarmCategory, 
    HarmBlockThreshold 
} from "@google/generative-ai";
import { 
    ExtractedData, 
    BatchProduct, 
    ConsolidatedProduct, 
    PriceUpdateData,
    PriceDatabaseEntry
} from '@/types';

const getApiKey = () => process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Lista de modelos atualizada para as versões mais estáveis
const MODEL_NAMES = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
];

// Configuração para IGNORAR bloqueios de segurança (essencial para ler dados técnicos sem falsos positivos)
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
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
Analise esta imagem técnica. Extraia os dados EXATAMENTE como estão escritos.
Identifique:
1. Código ("Artigo"): apenas números.
2. Nome/Descrição.
3. Composição.
4. Largura (m) e Gramatura (g/m²).
5. Tabela de Preços (Coluna "Á Vista"):
   - Mapeie a "Classificação" (BRANCO, CLARA, MÉDIA, etc) para a chave normalizada.
   - Use os valores da coluna Á Vista.

Retorne JSON puro:
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
    if (!apiKey || apiKey.length < 10) {
        throw new Error("Chave API ausente ou inválida no .env.local.");
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const results: BatchProduct[] = [];
    const globalErrors: string[] = [];

    // Loop pelos arquivos
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileError = "";
        let success = false;

        // Loop pelos modelos (Tentativa em Cascata)
        for (const modelName of MODEL_NAMES) {
            if (success) break;

            try {
                if (modelName === MODEL_NAMES[0]) {
                    console.log(`Processando ${file.name} com ${modelName}...`);
                }

                const model = ai.getGenerativeModel({ 
                    model: modelName,
                    safetySettings: SAFETY_SETTINGS // Aplica a configuração sem filtros
                });
                
                const base64 = await fileToBase64(file);
                
                const result = await model.generateContent([
                    PROMPT_SINGLE_FILE, 
                    { inlineData: { data: base64, mimeType: file.type } }
                ]);
                
                const text = result.response.text();
                // console.log("Resposta IA:", text); // Descomente para ver o retorno bruto no console

                const parsed = JSON.parse(cleanJsonString(text));
                let item: any = Array.isArray(parsed) ? parsed[0] : parsed;

                if (item && (item.product_code || item.product_name)) {
                    results.push({
                        supplier_name: item.supplier_name || "Fornecedor Detectado",
                        product_code: String(item.product_code || "").trim(),
                        product_name: String(item.product_name || "").trim(),
                        composition: String(item.composition || "").trim(),
                        specs: {
                            width_m: Number(item.specs?.width_m || 0),
                            grammage_gsm: Number(item.specs?.grammage_gsm || 0)
                        },
                        price_list: Array.isArray(item.price_list) ? item.price_list : []
                    });
                    success = true;
                } 

            } catch (error: any) {
                const msg = error.message || String(error);
                
                // Se for 404, tenta o próximo modelo silenciosamente
                if (msg.includes("404") || msg.includes("not found")) continue;

                // Se for 429 (Cota), espera e tenta outro modelo
                if (msg.includes("429")) {
                    console.warn("Cota excedida (429). Aguardando 5s...");
                    await new Promise(r => setTimeout(r, 5000));
                    continue; 
                }

                // Captura o erro real para mostrar ao usuário
                fileError = `Erro (${modelName}): ${msg}`;
                console.error(fileError);
            }
        }

        if (!success) {
            // Se chegou aqui, falhou em todos os modelos
            globalErrors.push(`${file.name}: ${fileError || "Falha desconhecida na extração"}`);
        }
        
        // Pausa entre arquivos
        if (i < files.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    if (results.length === 0) {
        // Mostra o erro exato do primeiro arquivo que falhou
        const errorDetail = globalErrors.length > 0 ? globalErrors[0] : "Erro desconhecido";
        throw new Error(`FALHA CRÍTICA: ${errorDetail}`);
    }

    return results;
}

// --- SUPORTE ---

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
    throw new Error("Erro na leitura.");
}

export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    // Reutiliza a lógica de batch
    try {
        const batch = await extractBatchDataFromFiles([file]);
        return batch.map(b => ({
            supplier: b.supplier_name,
            code: b.product_code,
            name: b.product_name,
            is_complement: false,
            specs: { width_m: b.specs.width_m, grammage_gsm: b.specs.grammage_gsm, yield_m_kg: 0, composition: b.composition },
            price_list: b.price_list.map(pl => ({ category: pl.category_normalized, original_label: pl.original_category_name, price_cash: pl.price_cash_kg }))
        }));
    } catch { return []; }
}

export async function extractPriceUpdateData(file: File): Promise<PriceUpdateData[]> {
    try {
        const batch = await extractBatchDataFromFiles([file]);
        return batch.map(b => ({
            supplier_name: b.supplier_name,
            product_code: b.product_code,
            product_name: b.product_name,
            price_list: b.price_list.map(pl => ({ category_normalized: pl.category_normalized, price_cash_kg: pl.price_cash_kg }))
        }));
    } catch { return []; }
}

export async function extractPriceListData(file: File): Promise<PriceDatabaseEntry> {
    try {
        const data = await extractBatchDataFromFiles([file]);
        return { supplier_name: data[0]?.supplier_name || "Desconhecido", products: data };
    } catch {
        return { supplier_name: "Erro", products: [] };
    }
}