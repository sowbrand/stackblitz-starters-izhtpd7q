
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, PriceInfo, ColorCategory, Color, ColorPalette, PriceDatabaseEntry, ConsolidatedProduct, PriceUpdateData, BatchProduct } from '../types';

// This is a mock function. In a real application, you would handle file-to-base64 conversion.
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const SINGLE_FILE_PROMPT = `You are a specialized textile data extraction engine for the Sowbrand application. Your task is to analyze fabric technical datasheets (PDF, JPG, PNG) from "Urbano Têxtil" and other suppliers to extract technical specifications into a strict JSON format.

Extraction Rules:

Identity & Specs:
Extract the fabric name, code, and composition.
Extract Width ("Largura" in meters), Grammage ("Gramatura" in g/m²), Yield ("Rendimento" in m/kg), Shrinkage ("Encolhimento"), and Torque ("Torção").
Normalization: Convert all decimal commas to dots.

Visual Features:
Extract text from technology icons (e.g., "Proteção UV 50+", "Permite Serigrafia").
Include wash instructions if text/icons are present.

Usage & Complements:
Extract "Indicações" into a list.
Extract "Complemento" (Code + Name) into an object.

Urbano Têxtil Color Palettes (CRITICAL):
Detection: Specific to Urbano Têxtil, look for visual grids/tables labeled "Cores Liberadas Lumen" and "Cores Liberadas Arumã".
Extraction: You must extract the 5-digit numerical codes (e.g., "00005", "00884", "72148") found inside the cells of these grids.
Separation: Do NOT merge them into a single list. You must maintain the distinction between the "Lumen" palette and the "Arumã" palette.
Structure: Return a color_palettes array, where each object contains the palette_name (e.g., "Lumen") and the list of codes.

Price Table & Categories:
Look for price information associated with categories (e.g., "Cores Claras R$ 38,00").
Normalize categories to strict keys: "Claras", "Escuras/Fortes", "Especiais", "Extras", "Mescla".
If no price is found, return an empty list [].

Output: Return ONLY the raw JSON array. No markdown, no code blocks.`;

const SINGLE_FILE_RESPONSE_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            supplier: { type: Type.STRING, description: "The name of the supplier, e.g., Urbano Têxtil." },
            name: { type: Type.STRING },
            code: { type: Type.STRING },
            technical_specs: {
                type: Type.OBJECT,
                properties: {
                    width_m: { type: Type.NUMBER },
                    grammage_gsm: { type: Type.NUMBER },
                    yield_m_kg: { type: Type.NUMBER },
                    shrinkage_pct: { type: Type.STRING },
                    torque_pct: { type: Type.STRING }
                },
                required: ["width_m", "grammage_gsm", "yield_m_kg"]
            },
            composition: { type: Type.STRING },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            usage_indications: { type: Type.ARRAY, items: { type: Type.STRING } },
            complement: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING },
                    name: { type: Type.STRING }
                },
                nullable: true,
            },
            color_palettes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        palette_name: { type: Type.STRING },
                        codes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["palette_name", "codes"]
                }
            },
            price_table: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, enum: Object.values(ColorCategory) },
                        price: { type: Type.NUMBER, nullable: true }
                    },
                    required: ["category", "price"]
                }
            }
        },
        required: ["supplier", "name", "code", "technical_specs", "composition"]
    }
};


export const extractDataFromFile = async (file: File): Promise<ExtractedData> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not found. Using mock data.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: ExtractedData[] = [{
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
                    "features": ["PelUCIADO", "ANTIPILLING", "Permite Sublimação"],
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
                }];
                resolve(mockResponse[0]);
            }, 2500);
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
// Fix: Per Gemini API guidelines, `contents` should be an object with a `parts` array.
        contents: {
            parts: [
                { text: SINGLE_FILE_PROMPT },
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data
                    }
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: SINGLE_FILE_RESPONSE_SCHEMA
        }
    });

    // Fix: Use the `.text` property to get the string output, not the `text()` method.
    const text = response.text.trim();
    try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData) && jsonData.length > 0) {
            return jsonData[0] as ExtractedData;
        }
        throw new Error("A resposta da IA não contém um array de malhas válido.");
    } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("A resposta da IA não é um JSON válido.");
    }
};

const PRICE_LIST_PROMPT = `You are a specialized textile data extraction and database structuring engine for the Sowbrand application (future Supabase integration). Your task is to analyze price list files (PDFs, JPGs, Excel) from various suppliers (e.g., "FN Malhas", "Urbano Têxtil") and extract structured pricing data to populate a centralized Price Database.

Extraction & Structuring Rules:

Supplier Identification:
Identify the supplier from the file content (e.g., "FN Malhas", "Urbano").

Product Identification (The Key):
Extract the fabric/product name (e.g., "Moletom PA Peluciado", "Suedine Pima", "Malha 100% CO").
Extract the Reference/Code if available (e.g., "Ref 66", "Artigo 013001").
Extract Composition (e.g., "50% Alg 50% Pol").
Extract Dimensions: Width ("Largura") and Grammage ("Gramatura").

Price Categorization (Normalization is Critical):
You must map the supplier's specific color names/categories to the application's Strict Keys:
"Claras": Maps from "Clara", "Branco", "Marfim", "White", "Light".
"Escuras/Fortes": Maps from "Forte", "Escura", "Dark", "Preto" (if listed as a standard dark price), "Média".
"Especiais": Maps from "Especial", "Special", "Neon" (if grouped).
"Extras": Maps from "Extra", "Premium", "Neon" (if highest price).
"Mescla": Maps from "Mescla", "Banana", "P.A.", "Rajado".
"Branco": If explicitly priced differently from "Claras", keep as "Branco" but prefer merging into "Claras" if the price is identical.

Condition: Extract the "À Vista" (Cash) price as the base price_value. If only payment terms are available, use the lowest value.

Database Relation Logic:
Create a structured object where the product_id (or combined Name+Code) is the key.
The prices field must be an array of category objects.

Handling Specific Formats:
FN Malhas Style: Tables with columns "Cor", "A Vista", "30DD". Extract the "Cor" as the category and "A Vista" as the price. Note codes like "66" or "338".
Urbano Style: Header contains product info (Artigo 013001). The table lists "Classificação" (Branco, Clara, Média...) and "R$/M2" or "R$/Kg". Convert R$/M² to R$/Kg if "R$/Kg" is not explicit, using the formula: Price_Kg = Price_M2 / (Grammage_kg_m2 * Width_m). Wait, usually textile tables give Price/kg directly or Price/m. If the table says "R$/M2", keep it as is but flag unit. If it lists "R$/Kg" (standard), use that. (Note on the provided image: The header has Gram 160g/m2. The columns show "R$/M2" but the values are "50,22", which is too high for M2. It is likely Price/KG. Assumption: Treat values ~30-100 as R$/kg. Treat values ~5-15 as R$/m or R$/m2. The provided image shows "R$/M2" column with values "8.04" and "Á Vista" column with values "50.22". Logic: The "Á Vista" column is the Price/Kg. The "R$/M2" is a calculated reference. Extract "Á Vista" as the main Price/Kg).

Output: Return ONLY the raw JSON array representing the Database Entries.`;

const PRICE_LIST_RESPONSE_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            supplier_name: { type: Type.STRING },
            products: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        product_code: { type: Type.STRING },
                        product_name: { type: Type.STRING },
                        composition: { type: Type.STRING },
                        specs: {
                            type: Type.OBJECT,
                            properties: {
                                width_m: { type: Type.NUMBER },
                                grammage_gsm: { type: Type.NUMBER }
                            }
                        },
                        price_list: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category_normalized: { type: Type.STRING, enum: Object.values(ColorCategory) },
                                    original_category_name: { type: Type.STRING },
                                    price_cash_kg: { type: Type.NUMBER },
                                    payment_terms_price: { type: Type.NUMBER }
                                },
                                required: ["category_normalized", "original_category_name", "price_cash_kg"]
                            }
                        }
                    },
                    required: ["product_code", "product_name", "price_list"]
                }
            }
        },
        required: ["supplier_name", "products"]
    }
};

export const extractPriceListData = async (file: File): Promise<PriceDatabaseEntry> => {
     if (!process.env.API_KEY) {
        console.warn("API_KEY not found. Using mock data for price list.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: PriceDatabaseEntry[] = [{
                  "supplier_name": "FN Malhas (Mock)",
                  "products": [
                    {
                      "product_code": "66",
                      "product_name": "MOLETOM PA PELUCIADO",
                      "composition": "50% ALG 50% POL",
                      "specs": { "width_m": 1.1, "grammage_gsm": 300 },
                      "price_list": [
                        { "category_normalized": ColorCategory.Claras, "original_category_name": "Clara", "price_cash_kg": 40.50 },
                        { "category_normalized": ColorCategory.EscurasFortes, "original_category_name": "Forte", "price_cash_kg": 43.20 },
                        { "category_normalized": ColorCategory.Mescla, "original_category_name": "Mescla Banana", "price_cash_kg": 41.80 }
                      ]
                    },
                    {
                      "product_code": "338",
                      "product_name": "SUEDINE PENTEADO",
                      "composition": "100% ALGODÃO",
                      "specs": { "width_m": 0.92, "grammage_gsm": 210 },
                       "price_list": [
                        { "category_normalized": ColorCategory.Branco, "original_category_name": "Branco", "price_cash_kg": 50.22 },
                        { "category_normalized": ColorCategory.Claras, "original_category_name": "Clara", "price_cash_kg": 51.30 }
                      ]
                    }
                  ]
                }];
                resolve(mockResponse[0]);
            }, 2500);
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToBase64(file);

     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
// Fix: Per Gemini API guidelines, `contents` should be an object with a `parts` array.
        contents: {
            parts: [
                { text: PRICE_LIST_PROMPT },
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data
                    }
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: PRICE_LIST_RESPONSE_SCHEMA
        }
    });

    // Fix: Use the `.text` property to get the string output, not the `text()` method.
    const text = response.text.trim();
    try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData) && jsonData.length > 0) {
            return jsonData[0] as PriceDatabaseEntry;
        }
        throw new Error("A resposta da IA não contém uma tabela de preços válida.");
    } catch (e) {
        console.error("Failed to parse Gemini response for price list:", text);
        throw new Error("A resposta da IA para a tabela de preços não é um JSON válido.");
    }
}

const CONSOLIDATED_PRICE_LIST_PROMPT = `You are a specialized Data Extraction Engine for "Sowbrand".Your task is to parse complex Price List PDFs (specifically from supplier "FN Malhas") and extract a clean, consolidated Product Database in JSON.File Structure Analysis (FN Malhas):The file lists products by COD (Code).CRITICAL: The same COD and Description appear multiple times, one for each color category (e.g., "Clara", "Forte", "Especial").GOAL: You must GROUP these rows. Do not create 4 separate products for Code 66. Create 1 Product (Code 66) and add all found price categories into its price_list.Extraction Rules:Identification (The Anchor):Scan for lines starting with a numeric COD (e.g., "66", "338", "230").Ignore page headers like "COD. DESCRIÇÃO...".If a line starts with a code found previously, MERGE the new category/price into the existing product.Product Metadata:Name: Extract the full description (e.g., "MOLETOM PA PELUCIADO RAMADO").Code: The number in the first column.Specs: Extract Width ("1,84 M"), Grammage ("310"), and Yield ("1,75 m/kg") from the columns "LARG.", "GMT2", "REND.".Composition: Extract percentages (e.g., "50% ALG. 50% POL.").Price & Category Parsing (Complex Logic):Categories: Look for the column "COR". Map terms to standard keys:"CLARA", "BRANCO", "MARFIM" -> "Claras""FORTE", "PRETO", "MARINHO" -> "Escuras/Fortes""ESPECIAL", "NEON" -> "Especiais""EXTRA", "PREMIUM" -> "Extras""MESCLA" -> "Mescla"Prices: Extract the value from column "A VISTA" (Cash Price).Handling Merged Lines: If a extracted text line contains multiple prices or categories (e.g., "MESCLA R$47,30 FORTE R$50,90"), split them intelligently.Ribana/Complement Detection:If the Name contains "RIBANA", "GOLA", "or "PUNHO", set a flag "is_complement": true. This helps the user distinguish the 27 main fabrics from the 10 accessories.Output: Return a JSON array of Unique Products.`;

const CONSOLIDATED_PRICE_LIST_RESPONSE_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            supplier: { type: Type.STRING, description: "Should be 'FN Malhas'" },
            code: { type: Type.STRING },
            name: { type: Type.STRING },
            is_complement: { type: Type.BOOLEAN },
            specs: {
                type: Type.OBJECT,
                properties: {
                    width_m: { type: Type.NUMBER },
                    grammage_gsm: { type: Type.NUMBER },
                    yield_m_kg: { type: Type.NUMBER },
                    composition: { type: Type.STRING }
                },
                required: ["width_m", "grammage_gsm", "yield_m_kg", "composition"]
            },
            price_list: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, enum: Object.values(ColorCategory) },
                        original_label: { type: Type.STRING },
                        price_cash: { type: Type.NUMBER }
                    },
                    required: ["category", "original_label", "price_cash"]
                }
            }
        },
        required: ["supplier", "code", "name", "is_complement", "specs", "price_list"]
    }
};

export const extractConsolidatedPriceListData = async (file: File): Promise<ConsolidatedProduct[]> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not found. Using mock data for consolidated price list.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: ConsolidatedProduct[] = [
                  {
                    "supplier": "FN Malhas",
                    "code": "66",
                    "name": "MOLETOM PA PELUCIADO RAMADO",
                    "is_complement": false,
                    "specs": { "width_m": 1.84, "grammage_gsm": 310, "yield_m_kg": 1.75, "composition": "50% ALG. 50% POL." },
                    "price_list": [
                      { "category": ColorCategory.Claras, "original_label": "CLARA", "price_cash": 45.3 },
                      { "category": ColorCategory.EscurasFortes, "original_label": "FORTE", "price_cash": 50.9 },
                      { "category": ColorCategory.Especiais, "original_label": "ESPECIAL", "price_cash": 54.5 },
                      { "category": ColorCategory.Mescla, "original_label": "MESCLA", "price_cash": 47.3 }
                    ]
                  },
                  {
                    "supplier": "FN Malhas",
                    "code": "230",
                    "name": "RIBANA 2X1 PENTEADA",
                    "is_complement": true,
                    "specs": { "width_m": 1.28, "grammage_gsm": 290, "yield_m_kg": 2.7, "composition": "97% ALG. 3% ELAST." },
                    "price_list": [
                      { "category": ColorCategory.Claras, "original_label": "CLARA", "price_cash": 52.8 },
                      { "category": ColorCategory.EscurasFortes, "original_label": "FORTE", "price_cash": 58.7 }
                    ]
                  }
                ];
                resolve(mockResponse);
            }, 2500);
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToBase64(file);

     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
// Fix: Per Gemini API guidelines, `contents` should be an object with a `parts` array.
        contents: {
            parts: [
                { text: CONSOLIDATED_PRICE_LIST_PROMPT },
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data
                    }
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: CONSOLIDATED_PRICE_LIST_RESPONSE_SCHEMA
        }
    });

    // Fix: Use the `.text` property to get the string output, not the `text()` method.
    const text = response.text.trim();
    try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
            return jsonData as ConsolidatedProduct[];
        }
        throw new Error("A resposta da IA não contém um array de produtos consolidado válido.");
    } catch (e) {
        console.error("Failed to parse Gemini response for consolidated price list:", text);
        throw new Error("A resposta da IA para a tabela de preços consolidada não é um JSON válido.");
    }
}

const PRICE_UPDATE_PROMPT = `You are a specialized Data Extraction Engine for the "Sowbrand" application. Your task is to process a "Price Update File" (PDF, Image, Excel) from an existing supplier and extract data specifically to UPDATE the product database.

Update Logic & Extraction Rules:

Identity Matching (Crucial):
The database uses Supplier Name + Product Code as the unique identifier.
You must extract the Product Code exactly as it appears (e.g., "66", "178").
Extract the Product Name to confirm identity if the code is ambiguous.

Price Overwrite Mode:
Focus intensely on the Price Table.
Extract the new values.
Normalization: You MUST use the exact same category keys as the previous extraction ("Claras", "Escuras/Fortes", "Mescla", "Especiais", "Extras", "Branco").

Missing Data Handling:
If the update file only contains a list of prices (Code + Price) but lacks full technical specs (width, grammage), return null for the missing specs fields. The application will merge this: if specs are null in your output, the database keeps the old specs. If price_list is present, the database overwrites the old prices.

Output: Return a JSON array designed for an UPSERT (Update/Insert) operation.`;

const PRICE_UPDATE_RESPONSE_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            supplier_name: { type: Type.STRING },
            product_code: { type: Type.STRING },
            product_name: { type: Type.STRING },
            price_list: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category_normalized: { type: Type.STRING, enum: Object.values(ColorCategory) },
                        price_cash_kg: { type: Type.NUMBER },
                        payment_terms_price: { type: Type.NUMBER }
                    },
                    required: ["category_normalized", "price_cash_kg"]
                }
            }
        },
        required: ["supplier_name", "product_code", "product_name", "price_list"]
    }
};

export const extractPriceUpdateData = async (file: File): Promise<PriceUpdateData[]> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not found. Using mock data for price update.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: PriceUpdateData[] = [
                    {
                        "supplier_name": "FN Malhas",
                        "product_code": "66",
                        "product_name": "MOLETOM PA PELUCIADO RAMADO",
                        "price_list": [
                            { "category_normalized": ColorCategory.Claras, "price_cash_kg": 46.00 },
                            { "category_normalized": ColorCategory.EscurasFortes, "price_cash_kg": 52.00 }
                        ]
                    },
                    {
                        "supplier_name": "FN Malhas",
                        "product_code": "999",
                        "product_name": "PRODUTO INEXISTENTE",
                        "price_list": [
                            { "category_normalized": ColorCategory.Claras, "price_cash_kg": 99.00 }
                        ]
                    }
                ];
                resolve(mockResponse);
            }, 2500);
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToBase64(file);

     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
// Fix: Per Gemini API guidelines, `contents` should be an object with a `parts` array.
        contents: {
            parts: [
                { text: PRICE_UPDATE_PROMPT },
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data
                    }
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: PRICE_UPDATE_RESPONSE_SCHEMA
        }
    });

    // Fix: Use the `.text` property to get the string output, not the `text()` method.
    const text = response.text.trim();
    try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
            return jsonData as PriceUpdateData[];
        }
        throw new Error("A resposta da IA não contém um array de atualização de preços válido.");
    } catch (e) {
        console.error("Failed to parse Gemini response for price update:", text);
        throw new Error("A resposta da IA para a atualização de preços não é um JSON válido.");
    }
}

// NEW FUNCTION FOR BATCH IMAGE IMPORT
const BATCH_IMPORT_PROMPT = `You are a specialized Data Extraction Engine for the "Sowbrand" application. Your task is to analyze a batch of uploaded images (Price Tables) from the supplier "Urbano Têxtil". Each image represents a distinct fabric article. You must iterate through all provided files and extract a consolidated JSON list of products.

Extraction Rules:

Product Identification (Header Analysis):
Code: Extract the numeric code after "Artigo:" (e.g., "013001", "13030"). Remove leading zeros (e.g., "013001" -> "13001").
Name: Extract text inside parentheses after the code (e.g., "MALHA 100%CO...", "SUEDINE 100%CO...").
Composition: Extract from "Composição:".
Technical Specifications:
Width: Extract "Larg:" (e.g., "1,20 m"). Convert to meters (float).
Grammage: Extract "Gram:" (e.g., "160 g/m²"). Convert to number.
Yield: Extract "Rend:" (e.g., "2,60 m/kg"). Convert to float.
Complement: If "Compl:" is present, extract its full text content.

Price Table Extraction (Table Analysis):
Columns: Identify "Classificação" (Category) and "Á Vista" (Price in R$/kg). CRITICAL: IGNORE the "R$/M2" column entirely.
Category Normalization (Strict Mapping):
"BRANCO" -> "Branco"
"CLARA" -> "Claras"
"MÉDIA" -> "Escuras/Fortes"
"ESCURA" -> "Escuras/Fortes"
"EXTRA" -> "Extras"
"NEON", "ESPECIAL" -> "Especiais"
Price: Extract the numeric value from the "Á Vista" column.

Batch Processing:
Process each image as a separate product object in the final array.
Set "supplier_name" to "Urbano Têxtil" for all items.

Output: Return ONLY the raw JSON array.`;

const BATCH_IMPORT_RESPONSE_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            supplier_name: { type: Type.STRING, description: "Should always be 'Urbano Têxtil'" },
            product_code: { type: Type.STRING },
            product_name: { type: Type.STRING },
            technical_specs: {
                type: Type.OBJECT,
                properties: {
                    width_m: { type: Type.NUMBER },
                    grammage_gsm: { type: Type.NUMBER },
                    yield_m_kg: { type: Type.NUMBER },
                    composition: { type: Type.STRING }
                },
                required: ["width_m", "grammage_gsm", "yield_m_kg", "composition"]
            },
            complement: {
                type: Type.OBJECT,
                properties: {
                    info: { type: Type.STRING }
                },
                nullable: true
            },
            price_list: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category_normalized: { type: Type.STRING, enum: Object.values(ColorCategory) },
                        original_category_name: { type: Type.STRING },
                        price_cash_kg: { type: Type.NUMBER }
                    },
                    required: ["category_normalized", "original_category_name", "price_cash_kg"]
                }
            }
        },
        required: ["supplier_name", "product_code", "product_name", "technical_specs", "price_list"]
    }
};

export const extractBatchDataFromFiles = async (files: File[]): Promise<BatchProduct[]> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not found. Using mock data for batch import.");
        return new Promise(resolve => {
            setTimeout(() => {
                const mockResponse: BatchProduct[] = [
                    {
                        "supplier_name": "Urbano Têxtil",
                        "product_code": "13030",
                        "product_name": "MALHA MAGLIA EXTRA 100%CO",
                        "technical_specs": {
                            "width_m": 1.20,
                            "grammage_gsm": 225,
                            "yield_m_kg": 1.85,
                            "composition": "100% ALGODÃO"
                        },
                        "complement": { "info": "050101(RIBANA 2X1 97%CO 3%PUE LARG 0,55M GRAM 230G/M2)" },
                        "price_list": [
                            { "category_normalized": ColorCategory.Branco, "original_category_name": "BRANCO", "price_cash_kg": 53.07 },
                            { "category_normalized": ColorCategory.Claras, "original_category_name": "CLARA", "price_cash_kg": 55.39 }
                        ]
                    },
                    {
                        "supplier_name": "Urbano Têxtil",
                        "product_code": "50001",
                        "product_name": "RIBANA 1X1 98%CO 2%PUE",
                        "technical_specs": {
                            "width_m": 0.86,
                            "grammage_gsm": 250,
                            "yield_m_kg": 2.33,
                            "composition": "2% ELASTANO + 98% ALGODÃO"
                        },
                        "price_list": [
                            { "category_normalized": ColorCategory.Branco, "original_category_name": "BRANCO", "price_cash_kg": 66.56 },
                            { "category_normalized": ColorCategory.Claras, "original_category_name": "CLARA", "price_cash_kg": 71.86 },
                            { "category_normalized": ColorCategory.EscurasFortes, "original_category_name": "ESCURA", "price_cash_kg": 75.49 }
                        ]
                    }
                ];
                resolve(mockResponse);
            }, 2500);
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imageParts = await Promise.all(
        [...files].map(async (file) => {
            const base64Data = await fileToBase64(file);
            return {
                inlineData: {
                    mimeType: file.type,
                    data: base64Data,
                },
            };
        })
    );

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
// Fix: Per Gemini API guidelines, `contents` should be an object with a `parts` array.
        contents: {
            parts: [
                { text: BATCH_IMPORT_PROMPT },
                ...imageParts
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: BATCH_IMPORT_RESPONSE_SCHEMA
        }
    });
    
    // Fix: Use the `.text` property to get the string output, not the `text()` method.
    const text = response.text.trim();
    try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
            return jsonData as BatchProduct[];
        }
        throw new Error("A resposta da IA não contém um array de produtos válido para o lote.");
    } catch (e) {
        console.error("Failed to parse Gemini response for batch import:", text);
        throw new Error("A resposta da IA para o lote de importação não é um JSON válido.");
    }
};