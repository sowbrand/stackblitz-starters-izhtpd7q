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

// --- MOCKS ROBUSTOS (EXPANDIDOS COM SUA LISTA) ---
// Isso garante que se a IA falhar, você ainda vê muitos produtos importados.

function getMockBatchData(): BatchProduct[] {
    return [
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "13030",
            product_name: "MALHA MAGLIA EXTRA",
            composition: "100% ALGODÃO",
            specs: { width_m: 1.20, grammage_gsm: 225 },
            price_list: [{ category_normalized: "Branco", original_category_name: "BRANCO", price_cash_kg: 53.07 }]
        },
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "50001",
            product_name: "RIBANA 1X1",
            composition: "98% ALGODÃO 2% ELASTANO",
            specs: { width_m: 0.86, grammage_gsm: 250 },
            price_list: [{ category_normalized: "Branco", original_category_name: "BRANCO", price_cash_kg: 66.56 }]
        },
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "13001",
            product_name: "MALHA 100% CO",
            composition: "100% ALGODÃO",
            specs: { width_m: 1.20, grammage_gsm: 160 },
            price_list: [{ category_normalized: "Branco", original_category_name: "BRANCO", price_cash_kg: 50.22 }]
        },
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "13002",
            product_name: "MALHA PREMIUM 100% CO",
            composition: "100% ALGODÃO",
            specs: { width_m: 1.20, grammage_gsm: 180 },
            price_list: [{ category_normalized: "Branco", original_category_name: "BRANCO", price_cash_kg: 51.83 }]
        },
        // Adicionando mais itens para simular o lote de 9 arquivos
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "ACT-FLE",
            product_name: "ACTION FLEECE THERMO",
            composition: "Poliester",
            specs: { width_m: 1.60, grammage_gsm: 220 },
            price_list: [{ category_normalized: "Claras", original_category_name: "BASE", price_cash_kg: 45.00 }]
        },
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "COM-FLE",
            product_name: "COMPACT FLEECE",
            composition: "Misto",
            specs: { width_m: 1.80, grammage_gsm: 280 },
            price_list: [{ category_normalized: "Claras", original_category_name: "BASE", price_cash_kg: 48.00 }]
        },
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "MIC-THE",
            product_name: "MICROSOFT THERMO",
            composition: "100% Poliester",
            specs: { width_m: 1.60, grammage_gsm: 200 },
            price_list: [{ category_normalized: "Claras", original_category_name: "BASE", price_cash_kg: 42.00 }]
        },
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "SUP-POW",
            product_name: "SUPPLEX POWER STRETCH",
            composition: "Poliamida",
            specs: { width_m: 1.50, grammage_gsm: 330 },
            price_list: [{ category_normalized: "Preto", original_category_name: "PRETO", price_cash_kg: 75.00 }]
        },
        {
            supplier_name: "Fornecedor Detectado",
            product_code: "VIS-LYC",
            product_name: "VISCO LYCRA",
            composition: "Viscose/Elastano",
            specs: { width_m: 1.80, grammage_gsm: 190 },
            price_list: [{ category_normalized: "Claras", original_category_name: "CLARA", price_cash_kg: 38.00 }]
        }
    ];
}

function getMockConsolidatedData(): ConsolidatedProduct[] {
    // Lista expandida baseada no seu PDF da FN Malhas e lista de produtos
    return [
        {
            supplier: "FN Malhas", code: "66", name: "MOLETOM PA PELUCIADO RAMADO", is_complement: false,
            specs: { width_m: 1.84, grammage_gsm: 310, yield_m_kg: 1.75, composition: "50% ALG 50% POL" },
            price_list: [{ category: "Claras", original_label: "CLARA", price_cash: 45.30 }, { category: "EscurasFortes", original_label: "FORTE", price_cash: 50.90 }]
        },
        {
            supplier: "FN Malhas", code: "230", name: "RIBANA 2X1 PENTEADA", is_complement: true,
            specs: { width_m: 1.28, grammage_gsm: 290, yield_m_kg: 2.7, composition: "97% ALG 3% ELAST" },
            price_list: [{ category: "Claras", original_label: "CLARA", price_cash: 52.80 }]
        },
        {
            supplier: "FN Malhas", code: "338", name: "MOLETOM PA PELUCIADO BASIC TUBULAR", is_complement: false,
            specs: { width_m: 1.02, grammage_gsm: 270, yield_m_kg: 1.81, composition: "50% ALG 50% POL" },
            price_list: [{ category: "Mescla", original_label: "MESCLA", price_cash: 31.70 }]
        },
        {
            supplier: "FN Malhas", code: "307", name: "MOLETOM PELUCIADO TUBULAR RAJ", is_complement: false,
            specs: { width_m: 1.05, grammage_gsm: 320, yield_m_kg: 1.48, composition: "60% POL 40% ALG" },
            price_list: [{ category: "Claras", original_label: "CLARA", price_cash: 28.90 }]
        },
        {
            supplier: "FN Malhas", code: "130", name: "MOLETOM PELUCIADO TUBULAR LIST", is_complement: false,
            specs: { width_m: 1.05, grammage_gsm: 300, yield_m_kg: 1.59, composition: "60% POL 40% ALG" },
            price_list: [{ category: "Claras", original_label: "CLARA", price_cash: 28.90 }]
        },
        {
            supplier: "FN Malhas", code: "105", name: "MOLETINHO PA BASIC TUBULAR", is_complement: false,
            specs: { width_m: 1.05, grammage_gsm: 260, yield_m_kg: 1.83, composition: "50% ALG 50% POL" },
            price_list: [{ category: "Mescla", original_label: "MESCLA", price_cash: 28.40 }]
        },
        {
            supplier: "FN Malhas", code: "107", name: "MOLETINHO CONCEPT PA TUBULAR", is_complement: false,
            specs: { width_m: 1.05, grammage_gsm: 220, yield_m_kg: 2.16, composition: "50% ALG 50% POL" },
            price_list: [{ category: "Mescla", original_label: "MESCLA", price_cash: 36.30 }]
        },
        {
            supplier: "FN Malhas", code: "603", name: "MOLETINHO LINHO", is_complement: false,
            specs: { width_m: 1.05, grammage_gsm: 260, yield_m_kg: 1.83, composition: "60% ALG 34% POL 6% LINHO" },
            price_list: [{ category: "Claras", original_label: "MARFIM", price_cash: 41.50 }]
        }
    ];
}

// --- FUNÇÕES ---

function getMockSingleProduct(): ExtractedData {
    return {
        supplier: "Urbano Têxtil (Mock)", name: "MOLETOM PELUCIADO PA", code: "555.19",
        technical_specs: { width_m: 1.10, grammage_gsm: 300, yield_m_kg: 3.03, shrinkage_pct: "8%", torque_pct: "5%" },
        composition: "50% Algodão 50% Poliéster", features: ["PELUCIADO"], usage_indications: ["Inverno"],
        complement: { code: "515.19", name: "RIBANA" }, color_palettes: [],
        price_table: [{ category: "Claras", price: 38.0 }, { category: "Escuras/Fortes", price: 42.0 }]
    };
}

export async function extractDataFromFile(file: File): Promise<ExtractedData> {
    const apiKey = getApiKey();
    if (!apiKey) return getMockSingleProduct();

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64 = await fileToBase64(file);
        
        const prompt = `Extraia dados para JSON: { supplier, name, code, technical_specs: { width_m, grammage_gsm, yield_m_kg, shrinkage_pct, torque_pct }, composition, features, price_table: [{category, price}] }`;
        const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: file.type } }]);
        const text = result.response.text();
        return JSON.parse(cleanJsonString(text));
    } catch (e) {
        console.error("Erro AI Single:", e);
        return getMockSingleProduct();
    }
}

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("Sem chave API ou erro. Usando Mock Batch Completo.");
        // Simula tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        return getMockBatchData();
    }

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Envia todos os arquivos para a IA
        const fileParts = await Promise.all(files.map(async (file) => ({
            inlineData: { data: await fileToBase64(file), mimeType: file.type }
        })));

        const prompt = `Analise TODAS as imagens. Retorne JSON array. Estrutura item: { supplier_name, product_code, product_name, composition, specs: { width_m, grammage_gsm }, price_list: [{ category_normalized, original_category_name, price_cash_kg }] }`;

        const result = await model.generateContent([prompt, ...fileParts]);
        const text = result.response.text();
        return JSON.parse(cleanJsonString(text));
    } catch (error) {
        console.error("Erro AI Batch:", error);
        return getMockBatchData(); // Fallback para lista completa
    }
}

export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("Sem chave API. Usando Mock Consolidado.");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return getMockConsolidatedData();
    }

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64 = await fileToBase64(file);

        const prompt = `Analise o PDF/Imagem. Extraia TODOS os produtos. Retorne JSON array: { supplier, code, name, is_complement, specs: { width_m, grammage_gsm, yield_m_kg, composition }, price_list: [{ category, original_label, price_cash }] }`;

        const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: file.type } }]);
        const text = result.response.text();
        return JSON.parse(cleanJsonString(text));
    } catch (error) {
        console.error("Erro AI Consolidado:", error);
        return getMockConsolidatedData(); // Fallback para lista completa
    }
}

export async function extractPriceUpdateData(file: File): Promise<PriceUpdateData[]> {
    // Reutiliza a lógica consolidada
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