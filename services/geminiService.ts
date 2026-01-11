import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURAÇÃO E VALIDAÇÃO ---
const getGenAI = () => {
  // --- TESTE NUCLEAR: CHAVE DIRETA NO CÓDIGO ---
  const apiKey = "AIzaSyCi9nCsh-NiYG_Vzs_dom6LXjJjA647mhQ";
  
  // Verificação de segurança simples
  if (!apiKey) {
    throw new Error("Chave de API não configurada corretamente.");
  }
  
  // ESTA ERA A LINHA QUE ESTAVA FALTANDO OU COM ERRO:
  return new GoogleGenerativeAI(apiKey);
};
// Voltando para o modelo correto e rápido
const MODEL_NAME = "gemini-1.5-flash";
// --- FUNÇÃO AUXILIAR: ARQUIVO PARA BASE64 ---
async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- FUNÇÃO AUXILIAR: LIMPEZA DE JSON ---
function cleanJson(text: string): string {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

// ============================================================================
// 1. IDENTIFICAÇÃO ÚNICA
// ============================================================================
export async function identifyFabricFromImage(imageFile: File) {
  return extractDataFromFile(imageFile);
}

// ============================================================================
// 2. EXTRAÇÃO GENÉRICA DE DADOS
// ============================================================================
export async function extractDataFromFile(file: File) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Analise esta imagem técnica de tecido/malha ou etiqueta.
      Retorne APENAS um JSON válido com estes campos estimados:
      {
        "name": "Nome comercial (ex: Malha PV)",
        "code": "Código sugerido (ex: ML-PV)",
        "price": 0.00 (preço estimado ou 0 se não houver),
        "width": 0 (largura em cm),
        "grammage": 0 (gramatura em g/m²),
        "yield": 0 (rendimento m/kg),
        "composition": "Composição completa",
        "image": ""
      }
    `;

    const result = await model.generateContent([prompt, base64Data]);
    const response = await result.response;
    return JSON.parse(cleanJson(response.text()));

  } catch (error: any) {
    console.error("Erro na IA (Single):", error);
    throw new Error(`Falha na leitura: ${error.message}`);
  }
}

// ============================================================================
// 3. IMPORTAÇÃO EM LOTE (BATCH)
// ============================================================================
export async function extractBatchDataFromFiles(files: File[]) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const promises = files.map(async (file) => {
      const base64Data = await fileToGenerativePart(file);
      
      const prompt = `
        Analise esta imagem de tecido. Retorne APENAS um JSON:
        {
          "name": "Nome do produto",
          "code": "Código curto",
          "price": 0.00,
          "width": 0,
          "grammage": 0,
          "yield": 0,
          "composition": "Descrição da composição"
        }
      `;

      try {
        const result = await model.generateContent([prompt, base64Data]);
        const data = JSON.parse(cleanJson(result.response.text()));
        return { ...data, id: Math.random().toString(36).substr(2, 9), originalFile: file.name };
      } catch (err) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(item => item !== null);

  } catch (error: any) {
    console.error("Erro no Batch:", error);
    throw new Error("Erro ao processar lote de imagens.");
  }
}

// ============================================================================
// 4. LISTA DE PREÇOS (PRICE LIST)
// ============================================================================
export async function extractPriceListData(file: File) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Esta é uma tabela de preços de tecidos. 
      Extraia TODOS os produtos listados e retorne APENAS um Array de JSON:
      [
        {
          "code": "Código",
          "name": "Nome do tecido",
          "price": 0.00,
          "width": 0,
          "grammage": 0,
          "yield": 0,
          "composition": "Composição"
        }
      ]
    `;

    const result = await model.generateContent([prompt, base64Data]);
    const text = cleanJson(result.response.text());
    
    const json = JSON.parse(text);
    return Array.isArray(json) ? json : [json];

  } catch (error: any) {
    console.error("Erro Price List:", error);
    throw new Error("Não foi possível ler a tabela de preços.");
  }
}

// ============================================================================
// 5. ATUALIZAÇÃO DE PREÇOS (PRICE UPDATE)
// ============================================================================
export async function extractPriceUpdateData(file: File) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Analise este comunicado de reajuste de preços.
      Retorne APENAS um JSON com:
      {
        "effectiveDate": "YYYY-MM-DD",
        "percentage": 0.00 (se for aumento linear),
        "items": [
           { "code": "Código/Ref", "newPrice": 0.00 }
        ]
      }
    `;

    const result = await model.generateContent([prompt, base64Data]);
    return JSON.parse(cleanJson(result.response.text()));

  } catch (error: any) {
    console.error("Erro Update Price:", error);
    throw new Error("Erro ao ler atualização de preços.");
  }
}

// ============================================================================
// 6. LISTA CONSOLIDADA (CONSOLIDATED IMPORTER)
// ============================================================================
export async function extractConsolidatedPriceListData(file: File) {
  return extractPriceListData(file);
}