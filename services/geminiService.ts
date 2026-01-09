import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    ExtractedData, 
    BatchProduct, 
    ConsolidatedProduct, 
    PriceUpdateData,
    PriceDatabaseEntry, 
    ColorCategory 
} from '@/types';

// --- MOCK DATA ---
// Usamos 'any' aqui para evitar erros de TypeScript se a estrutura 
// do Mock não bater 100% com a interface do seu projeto atual.

const MOCK_PRODUCT_DATA: any = {
    "supplier": "Urbano Têxtil (Mock)",
    "name": "MOLETOM PELUCIADO PA",
    "code": "555.19",
    "technical_specs": {
        "width_m": 1.10,
        "grammage_gsm": 300,
        "yield_m_kg": 3.03,
        "shrinkage_pct": "8% / 8%",
        "torque_pct": "5%"
    },
    "composition": "50% Algodão 50% Poliéster",
    "features": ["PELUCIADO", "ANTIPILLING", "Permite Sublimação"],
    "usage_indications": ["Blusões", "Calças", "Uniformes"],
    "complement": { "code": "515.19", "name": "RIBANA PELUCIADA PA" },
    "color_palettes": [
        { "palette_name": "Lumen", "codes": ["00005", "00884", "72148"] },
        { "palette_name": "Arumã", "codes": ["00123", "00456", "00789"] }
    ],
    "price_table": [
        { "category": "Claras", "price": 38.0 },
        { "category": "Escuras/Fortes", "price": 42.0 }
    ]
};

const MOCK_PRICE_DB: any = {
    "supplier_name": "Urbano Têxtil (Mock Price List)",
    "products": [
        {
            "product_code": "1001",
            "product_name": "MEIA MALHA PENTEADA",
            "composition": "100% ALGODÃO",
            "specs": { "width_m": 1.20, "grammage_gsm": 160 },
            "price_list": [
                { "category_normalized": "Branco", "original_category_name": "BRANCO", "price_cash_kg": 45.90 },
                { "category_normalized": "Claras", "original_category_name": "CLARA", "price_cash_kg": 49.90 },
                { "category_normalized": "Escuras/Fortes", "original_category_name": "ESCURA", "price_cash_kg": 55.90 }
            ]
        }
    ]
};

const MOCK_CONSOLIDATED: any[] = [
    {
        "supplier": "FN Malhas",
        "code": "66",
        "name": "MOLETOM PA PELUCIADO RAMADO",
        "is_complement": false,
        "specs": { "width_m": 1.84, "grammage_gsm": 310, "yield_m_kg": 1.75, "composition": "50% ALG. 50% POL." },
        "price_list": [
            { "category": "Claras", "original_label": "CLARA", "price_cash": 45.3 },
            { "category": "Escuras/Fortes", "original_label": "FORTE", "price_cash": 50.9 }
        ]
    },
    {
        "supplier": "FN Malhas",
        "code": "230",
        "name": "RIBANA 2X1 PENTEADA",
        "is_complement": true,
        "specs": { "width_m": 1.28, "grammage_gsm": 290, "yield_m_kg": 2.7, "composition": "97% ALG. 3% ELAST." },
        "price_list": [
            { "category": "Claras", "original_label": "CLARA", "price_cash": 52.8 }
        ]
    }
];

const MOCK_UPDATES: any[] = [
    {
        "supplier_name": "FN Malhas",
        "product_code": "66",
        "product_name": "MOLETOM PA PELUCIADO RAMADO",
        "price_list": [
            { "category_normalized": "Claras", "price_cash_kg": 46.00 },
            { "category_normalized": "Escuras/Fortes", "price_cash_kg": 52.00 }
        ]
    }
];

const MOCK_BATCH: any[] = [
    {
        "supplier_name": "FN Malhas (Mock)",
        "product_code": "66",
        "product_name": "MOLETOM PA PELUCIADO",
        "composition": "50% ALG 50% POL",
        "specs": { "width_m": 1.1, "grammage_gsm": 300 },
        "price_list": [
            { "category_normalized": "Claras", "original_category_name": "Clara", "price_cash_kg": 40.50 },
            { "category_normalized": "Escuras/Fortes", "original_category_name": "Forte", "price_cash_kg": 43.20 }
        ]
    },
    {
        "supplier_name": "FN Malhas (Mock)",
        "product_code": "338",
        "product_name": "SUEDINE PENTEADO",
        "composition": "100% ALG",
        "specs": { "width_m": 0.92, "grammage_gsm": 210 },
        "price_list": [
            { "category_normalized": "Branco", "original_category_name": "Branco", "price_cash_kg": 50.22 }
        ]
    }
];

// --- Helpers ---

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

// --- Funções Exportadas ---

/**
 * 1. Usado em: MeshForm.tsx
 */
export async function extractDataFromFile(file: File): Promise<ExtractedData> {
    const apiKey = getApiKey();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Retorna MOCK forçado para teste
    if (apiKey) {
        console.log("Chave API detectada, mas retornando Mock temporariamente.");
        return MOCK_PRODUCT_DATA as ExtractedData; 
    }
    return MOCK_PRODUCT_DATA as ExtractedData;
}

/**
 * 2. Usado em: PriceListImporter.tsx
 */
export async function extractPriceListData(file: File): Promise<PriceDatabaseEntry> {
    const apiKey = getApiKey();
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (apiKey) {
        return MOCK_PRICE_DB as PriceDatabaseEntry;
    }
    return MOCK_PRICE_DB as PriceDatabaseEntry;
}

/**
 * 3. Usado em: ConsolidatedPriceImporter.tsx
 */
export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    const apiKey = getApiKey();
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (apiKey) {
        return MOCK_CONSOLIDATED as ConsolidatedProduct[]; 
    }
    return MOCK_CONSOLIDATED as ConsolidatedProduct[];
}

/**
 * 4. Usado em: PriceUpdateImporter.tsx
 */
export async function extractPriceUpdateData(file: File): Promise<PriceUpdateData[]> {
    const apiKey = getApiKey();
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (apiKey) {
        return MOCK_UPDATES as PriceUpdateData[];
    }
    return MOCK_UPDATES as PriceUpdateData[];
}

/**
 * 5. Usado em: BatchImporter.tsx
 */
export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    await new Promise(resolve => setTimeout(resolve, 2500)); 

    if (apiKey) {
        // Casting "as BatchProduct[]" resolve o conflito de tipo na saída
        return MOCK_BATCH as BatchProduct[];
    }
    return MOCK_BATCH as BatchProduct[];
}