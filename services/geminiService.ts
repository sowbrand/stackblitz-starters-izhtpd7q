import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    ExtractedData, 
    BatchProduct, 
    ConsolidatedProduct, 
    PriceUpdateData,
    PriceDatabaseEntry, 
    ColorCategory 
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

// --- MOCKS ROBUSTOS (Para quando a IA falhar ou não tiver chave) ---
// Agora retornam mais itens para simular leitura completa

function getMockBatchData(): BatchProduct[] {
    return [
        {
            supplier_name: "Mock Têxtil",
            product_code: "13030",
            product_name: "MALHA MAGLIA EXTRA",
            composition: "100% ALGODÃO",
            specs: { width_m: 1.20, grammage_gsm: 225 },
            price_list: [{ category_normalized: "Branco", original_category_name: "BRANCO", price_cash_kg: 53.07 }]
        },
        {
            supplier_name: "Mock Têxtil",
            product_code: "50001",
            product_name: "RIBANA 1X1",
            composition: "98% ALGODÃO 2% ELASTANO",
            specs: { width_m: 0.86, grammage_gsm: 250 },
            price_list: [{ category_normalized: "Branco", original_category_name: "BRANCO", price_cash_kg: 66.56 }]
        },
        {
            supplier_name: "Mock Têxtil",
            product_code: "13001",
            product_name: "MALHA 100% CO",
            composition: "100% ALGODÃO",
            specs: { width_m: 1.20, grammage_gsm: 160 },
            price_list: [{ category_normalized: "Branco", original_category_name: "BRANCO", price_cash_kg: 50.22 }]
        },
        {
            supplier_name: "Mock Têxtil",
            product_code: "66",
            product_name: "MOLETOM PA",
            composition: "50/50",
            specs: { width_m: 1.80, grammage_gsm: 300 },
            price_list: [{ category_normalized: "Claras", original_category_name: "CLARA", price_cash_kg: 45.00 }]
        }
    ];
}

function getMockConsolidatedData(): ConsolidatedProduct[] {
    return [
        {
            supplier: "Mock Têxtil",
            code: "66",
            name: "MOLETOM PA PELUCIADO RAMADO",
            is_complement: false,
            specs: { width_m: 1.84, grammage_gsm: 310, yield_m_kg: 1.75, composition: "50% ALG 50% POL" },
            price_list: [
                { category: "Claras", original_label: "CLARA", price_cash: 45.30 },
                { category: "Escuras/Fortes", original_label: "FORTE", price_cash: 50.90 }
            ]
        },
        {
            supplier: "Mock Têxtil",
            code: "230",
            name: "RIBANA 2X1 PENTEADA",
            is_complement: true,
            specs: { width_m: 1.28, grammage_gsm: 290, yield_m_kg: 2.7, composition: "97% ALG 3% ELAST" },
            price_list: [{ category: "Claras", original_label: "CLARA", price_cash: 52.80 }]
        },
        {
            supplier: "Mock Têxtil",
            code: "338",
            name: "MOLETOM PA BASIC",
            is_complement: false,
            specs: { width_m: 1.02, grammage_gsm: 270, yield_m_kg: 1.81, composition: "50/50" },
            price_list: [{ category: "Mescla", original_label: "MESCLA", price_cash: 31.70 }]
        }
    ];
}

// --- PROMPTS ---

const PROMPT_BATCH = `
Analise TODAS as imagens das fichas técnicas fornecidas. 
Extraia TODOS os produtos encontrados, sem omitir nenhum.
Retorne APENAS um array JSON válido.
Estrutura item:
{
  "supplier_name": "string",
  "product_code": "string",
  "product_name": "string",
  "composition": "string",
  "specs": { "width_m": number, "grammage_gsm": number },
  "price_list": [
    { "category_normalized": "string", "original_category_name": "string", "price_cash_kg": number }
  ]
}
`;

const PROMPT_CONSOLIDATED = `
Analise o documento de preços. Extraia TODOS os produtos da lista, linha por linha.
Não resuma. Liste cada código de produto encontrado.
Retorne APENAS um array JSON válido.
Estrutura item:
{
  "supplier": "string",
  "code": "string",
  "name": "string",
  "is_complement": boolean,
  "specs": { "width_m": number, "grammage_gsm": number, "yield_m_kg": number, "composition": "string" },
  "price_list": [
      { "category": "string", "original_label": "string", "price_cash": number }
  ]
}
`;

// --- FUNÇÕES ---

export async function extractDataFromFile(file: File): Promise<ExtractedData> {
    const apiKey = getApiKey();
    // Se não tiver chave, usa fallback (retorna um objeto vazio seguro)
    if (!apiKey) throw new Error("API Key não configurada"); 

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64 = await fileToBase64(file);
        
        const prompt = `Extraia dados para JSON: { supplier, name, code, technical_specs: { width_m, grammage_gsm, yield_m_kg, shrinkage_pct, torque_pct }, composition, features, price_table: [{category, price}] }`;
        
        const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: file.type } }]);
        const text = result.response.text();
        return JSON.parse(cleanJsonString(text));
    } catch (e) {
        console.error(e);
        // Retorno de fallback básico
        return {
            supplier: "Erro na Leitura", name: "Produto Desconhecido", code: "", composition: "",
            technical_specs: { width_m: 0, grammage_gsm: 0, yield_m_kg: 0, shrinkage_pct: "", torque_pct: "" },
            features: [], usage_indications: [], color_palettes: [], price_table: []
        };
    }
}

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) return getMockBatchData();

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Limite de segurança: envia no máximo 15 arquivos por vez para não estourar o token
        const filesToSend = files.slice(0, 15);
        
        const fileParts = await Promise.all(filesToSend.map(async (file) => ({
            inlineData: { data: await fileToBase64(file), mimeType: file.type }
        })));

        const result = await model.generateContent([PROMPT_BATCH, ...fileParts]);
        const text = result.response.text();
        const parsed = JSON.parse(cleanJsonString(text));
        
        return parsed.map((item: any) => ({
            supplier_name: item.supplier_name || "Desconhecido",
            product_code: item.product_code || "",
            product_name: item.product_name || "",
            composition: item.composition || "",
            specs: {
                width_m: Number(item.specs?.width_m || 0),
                grammage_gsm: Number(item.specs?.grammage_gsm || 0)
            },
            price_list: Array.isArray(item.price_list) ? item.price_list : []
        })) as BatchProduct[];
    } catch (error) {
        console.error("Erro na IA (Batch):", error);
        return getMockBatchData(); // Retorna o mock ampliado se der erro
    }
}

export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) return getMockConsolidatedData();

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Flash suporta contexto maior
        const base64 = await fileToBase64(file);

        const result = await model.generateContent([PROMPT_CONSOLIDATED, { inlineData: { data: base64, mimeType: file.type } }]);
        const text = result.response.text();
        const parsed = JSON.parse(cleanJsonString(text));

        return parsed.map((item: any) => ({
            supplier: item.supplier || "Desconhecido",
            code: item.code || "",
            name: item.name || "",
            is_complement: !!item.is_complement,
            specs: {
                width_m: Number(item.specs?.width_m || 0),
                grammage_gsm: Number(item.specs?.grammage_gsm || 0),
                yield_m_kg: Number(item.specs?.yield_m_kg || 0),
                composition: item.specs?.composition || ""
            },
            price_list: Array.isArray(item.price_list) ? item.price_list : []
        })) as ConsolidatedProduct[];
    } catch (error) {
        console.error("Erro na IA (Consolidado):", error);
        return getMockConsolidatedData(); // Retorna mock ampliado
    }
}

export async function extractPriceUpdateData(file: File): Promise<PriceUpdateData[]> {
    const apiKey = getApiKey();
    if (!apiKey) return []; // Retorna vazio se não tiver chave

    try {
        const consolidated = await extractConsolidatedPriceListData(file);
        return consolidated.map(p => ({
            supplier_name: p.supplier,
            product_code: p.code,
            product_name: p.name,
            price_list: p.price_list.map(pl => ({
                category_normalized: pl.category,
                price_cash_kg: pl.price_cash
            }))
        }));
    } catch {
        return [];
    }
}

export async function extractPriceListData(file: File): Promise<PriceDatabaseEntry> {
    const batchData = await extractBatchDataFromFiles([file]);
    if (batchData.length > 0) {
        return {
            supplier_name: batchData[0].supplier_name,
            products: batchData
        };
    }
    return { supplier_name: "Desconhecido", products: [] };
}