import { GoogleGenerativeAI } from "@google/generative-ai";

// Importa os tipos definidos no seu projeto
import { 
    ExtractedData, 
    BatchProduct, 
    ConsolidatedProduct, 
    PriceUpdateData,
    PriceDatabaseEntry, // <--- Adicionado este tipo
    ColorCategory 
} from '@/types';

// --- Helpers ---

const getApiKey = () => process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove o prefixo data url para o Gemini
            const base64Content = result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = error => reject(error);
    });
};

// --- Funções Exportadas ---

/**
 * 1. Usado em: MeshForm.tsx
 * Extrai dados de um único produto (imagem técnica + infos).
 */
export async function extractDataFromFile(file: File): Promise<ExtractedData> {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("API_KEY not found. Using mock data for MeshForm.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: any = {
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
                resolve(mockResponse as ExtractedData);
            }, 2000);
        });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const base64Data = await fileToBase64(file);
    // TODO: Implementar prompt real
    throw new Error("Implementação real do Gemini pendente.");
}

/**
 * 2. Usado em: PriceListImporter.tsx (ESTA ERA A FUNÇÃO FALTANTE)
 * Lê uma tabela de preços simples e converte para PriceDatabaseEntry.
 */
export async function extractPriceListData(file: File): Promise<PriceDatabaseEntry> {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("API_KEY not found. Using mock data for PriceListImporter.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: any = {
                    "supplier_name": "Urbano Têxtil (Mock Price List)",
                    "products": [
                        {
                            "product_code": "1001",
                            "product_name": "MEIA MALHA PENTEADA",
                            "composition": "100% ALGODÃO",
                            "specs": { "width_m": 1.20, "grammage_gsm": 160 },
                            "price_list": [
                                { "category_normalized": ColorCategory.Branco, "original_category_name": "BRANCO", "price_cash_kg": 45.90 },
                                { "category_normalized": ColorCategory.Claras, "original_category_name": "CLARA", "price_cash_kg": 49.90 },
                                { "category_normalized": ColorCategory.EscurasFortes, "original_category_name": "ESCURA", "price_cash_kg": 55.90 }
                            ]
                        }
                    ]
                };
                resolve(mockResponse as PriceDatabaseEntry);
            }, 2000);
        });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    // TODO: Lógica real
    return {} as PriceDatabaseEntry;
}

/**
 * 3. Usado em: ConsolidatedPriceImporter.tsx
 * Lê tabelas complexas/consolidadas.
 */
export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("API_KEY not found. Using mock data for Consolidated Importer.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: any[] = [
                    {
                        "supplier": "FN Malhas",
                        "code": "66",
                        "name": "MOLETOM PA PELUCIADO RAMADO",
                        "is_complement": false,
                        "specs": { "width_m": 1.84, "grammage_gsm": 310, "yield_m_kg": 1.75, "composition": "50% ALG. 50% POL." },
                        "price_list": [
                            { "category": ColorCategory.Claras, "original_label": "CLARA", "price_cash": 45.3 },
                            { "category": ColorCategory.EscurasFortes, "original_label": "FORTE", "price_cash": 50.9 }
                        ]
                    },
                    {
                        "supplier": "FN Malhas",
                        "code": "230",
                        "name": "RIBANA 2X1 PENTEADA",
                        "is_complement": true,
                        "specs": { "width_m": 1.28, "grammage_gsm": 290, "yield_m_kg": 2.7, "composition": "97% ALG. 3% ELAST." },
                        "price_list": [
                            { "category": ColorCategory.Claras, "original_label": "CLARA", "price_cash": 52.8 }
                        ]
                    }
                ];
                resolve(mockResponse as ConsolidatedProduct[]);
            }, 2000);
        });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    return [];
}

/**
 * 4. Usado em: PriceUpdateImporter.tsx
 * Extrai apenas atualizações de preço.
 */
export async function extractPriceUpdateData(file: File): Promise<PriceUpdateData[]> {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("API_KEY not found. Using mock data for Price Updates.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: any[] = [
                    {
                        "supplier_name": "FN Malhas",
                        "product_code": "66",
                        "product_name": "MOLETOM PA PELUCIADO RAMADO",
                        "price_list": [
                            { "category_normalized": ColorCategory.Claras, "price_cash_kg": 46.00 },
                            { "category_normalized": ColorCategory.EscurasFortes, "price_cash_kg": 52.00 }
                        ]
                    }
                ];
                resolve(mockResponse as PriceUpdateData[]);
            }, 2000);
        });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    return [];
}

/**
 * 5. Usado em: BatchImporter.tsx
 * Processa múltiplos arquivos.
 */
export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.warn("API_KEY not found. Using mock data for Batch Import.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: any[] = [
                    {
                        "supplier_name": "FN Malhas (Mock)",
                        "product_code": "66",
                        "product_name": "MOLETOM PA PELUCIADO",
                        "composition": "50% ALG 50% POL",
                        "specs": { "width_m": 1.1, "grammage_gsm": 300 },
                        "price_list": [
                            { "category_normalized": ColorCategory.Claras, "original_category_name": "Clara", "price_cash_kg": 40.50 },
                            { "category_normalized": ColorCategory.EscurasFortes, "original_category_name": "Forte", "price_cash_kg": 43.20 }
                        ]
                    },
                    {
                        "supplier_name": "FN Malhas (Mock)",
                        "product_code": "338",
                        "product_name": "SUEDINE PENTEADO",
                        "composition": "100% ALG",
                        "specs": { "width_m": 0.92, "grammage_gsm": 210 },
                        "price_list": [
                            { "category_normalized": ColorCategory.Branco, "original_category_name": "Branco", "price_cash_kg": 50.22 }
                        ]
                    }
                ];
                resolve(mockResponse as BatchProduct[]);
            }, 2500);
        });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    // Lógica real...
    return [];
}