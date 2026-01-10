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
    // Remove marcadores de código Markdown se a IA colocar
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- PROMPTS ESPECÍFICOS PARA SUAS IMAGENS ---

const PROMPT_BATCH = `
Você é um extrator de dados estrito. Analise as imagens de fichas técnicas fornecidas.
Extraia EXATAMENTE o que está na imagem. NÃO invente dados.

Para cada imagem, identifique:
1. "Artigo": Use o número (ex: 13030) como 'product_code'.
2. Descrição ao lado do artigo (ex: MALHA MAGLIA EXTRA) como 'product_name'.
3. "Comp" ou "Composição": (ex: 100% ALGODÃO).
4. "Larg" (Largura em m) e "Gram" (Gramatura em g/m²).
5. TABELA DE PREÇOS:
   - Extraia a coluna "Á Vista" (Preço à vista).
   - Mapeie as linhas "Classificação" para categorias:
     - "BRANCO" -> "Branco"
     - "CLARA" -> "Claras"
     - "MÉDIA" -> "Mescla"
     - "ESCURA" -> "EscurasFortes"
     - "EXTRA" / "ESPECIAL" -> "Especiais"
     - "PRETO" -> "Preto"

Retorne APENAS um Array JSON válido com os objetos encontrados.
Formato obrigatório:
[
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
]
`;

// --- FUNÇÕES DE EXTRAÇÃO REAIS ---

export async function extractBatchDataFromFiles(files: File[]): Promise<BatchProduct[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Chave de API do Gemini não encontrada. Configure o .env.local.");
    }

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        // Usamos o modelo Flash que é rápido e bom com imagens/tabelas
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Prepara os arquivos para envio
        const fileParts = await Promise.all(files.map(async (file) => ({
            inlineData: { data: await fileToBase64(file), mimeType: file.type }
        })));

        // Envia para a IA
        const result = await model.generateContent([PROMPT_BATCH, ...fileParts]);
        const text = result.response.text();
        
        console.log("Resposta da IA (Raw):", text); // Para debug no console do navegador

        const parsed = JSON.parse(cleanJsonString(text));
        
        if (!Array.isArray(parsed)) {
            return []; // Se não retornou array, algo deu errado, retorna vazio para não quebrar
        }
        
        return parsed as BatchProduct[];

    } catch (error) {
        console.error("Erro Fatal na IA:", error);
        throw new Error("Falha ao processar imagens. Verifique se são legíveis.");
    }
}

// Manter as outras funções compatíveis, mas focadas na realidade
export async function extractDataFromFile(file: File): Promise<ExtractedData> {
    // Implementação simplificada para arquivo único
    const result = await extractBatchDataFromFiles([file]);
    if (result.length > 0) {
        const p = result[0];
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
    throw new Error("Não foi possível ler o arquivo.");
}

export async function extractConsolidatedPriceListData(file: File): Promise<ConsolidatedProduct[]> {
    // Reutiliza a lógica de batch pois o prompt já é bom para tabelas
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
        supplier_name: batchData.length > 0 ? batchData[0].supplier_name : "Desconhecido",
        products: batchData
    };
}