// services/geminiService.ts

// --- FUNÇÃO AUXILIAR: ARQUIVO PARA BASE64 ---
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// --- DESCOBERTA DE MODELO SEGURO ---
async function pickBestModel(apiKey: string): Promise<string> {
  return "gemini-1.5-flash"; 
}

// --- CHAMADA API ---
async function callGeminiAPI(prompt: string, base64Image: string, apiKey: string) {
  if (!apiKey) throw new Error("Chave de API não fornecida.");

  const modelName = await pickBestModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        throw new Error("Muitas requisições. Aguardando...");
      }
      if (response.status === 404) {
         // Fallback silencioso
         return callGeminiAPIFallback(prompt, base64Image, apiKey, "gemini-1.5-flash-latest");
      }
      throw new Error(`Erro Google (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("A IA não retornou texto.");

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error: any) {
    throw error;
  }
}

async function callGeminiAPIFallback(prompt: string, base64Image: string, apiKey: string, model: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64Image } }] }] };
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
}

// ============================================================================
// EXPORTS DO SISTEMA
// ============================================================================

// 1. Single Extraction
export async function extractDataFromFile(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Analise esta etiqueta técnica.
    Se houver tabela de preços por cor, pegue o valor da cor BRANCO (À Vista).
    Retorne JSON: { "name": "", "code": "", "price": 0, "width": 0, "grammage": 0, "yield": 0, "composition": "" }
  `;
  try {
    const result = await callGeminiAPI(prompt, base64, apiKey);
    return Array.isArray(result) ? result[0] : result;
  } catch (e) {
    throw e;
  }
}

// 2. Batch Extraction (Lote)
export async function extractBatchDataFromFiles(files: File[], apiKey: string) {
  // CORREÇÃO AQUI: Definindo o tipo do array para evitar o erro
  const results: any[] = [];

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file);
      
      const prompt = `
        Atue como um importador têxtil. Analise a imagem.
        
        1. DADOS GERAIS: Código (Ref), Nome, Largura, Gramatura, Rendimento, Composição.
        
        2. TABELA DE PREÇOS (Se houver):
           Procure por: BRANCO, CLARA, MÉDIA, ESCURA, EXTRA.
           Extraia o preço "À VISTA" de cada um.
        
        3. GERAÇÃO DE JSON:
           Gere uma lista. Se houver cores, crie um item para cada cor:
           Nome: "Nome do Artigo - COR"
           
           Se não houver cores, crie apenas um item.

        Exemplo JSON de saída:
        [
          { "name": "SUEDINE - BRANCO", "code": "76040", "price": 66.01, "width": 1.85, "grammage": 210, "yield": 2.57, "composition": "100% Algodão" },
          { "name": "SUEDINE - CLARA", "code": "76040", "price": 67.71, "width": 1.85, "grammage": 210, "yield": 2.57, "composition": "100% Algodão" }
        ]
      `;
      
      console.log(`Processando ${file.name}...`);
      
      const responseData = await callGeminiAPI(prompt, base64, apiKey);
      
      const items = Array.isArray(responseData) ? responseData : [responseData];

      items.forEach((item: any) => {
        results.push({ 
          ...item, 
          id: Math.random().toString(36).substr(2, 9), 
          originalFile: file.name 
        });
      });

      await new Promise(resolve => setTimeout(resolve, 4000));

    } catch (err) {
      console.error(`Erro ao processar ${file.name}`, err);
    }
  }

  return results;
}

// 3. Consolidated List
export async function extractConsolidatedPriceListData(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `Extraia tabela. Retorne JSON array "products": [{ "code": "...", "name": "...", "price": 0 }]`;
  try {
    const result = await callGeminiAPI(prompt, base64, apiKey);
    return Array.isArray(result) ? result : (result.products || [result]);
  } catch (e) {
    throw e;
  }
}

// 4. Price Update
export async function extractPriceUpdateData(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `Analise reajuste. Retorne JSON: { "effectiveDate": "YYYY-MM-DD", "items": [{ "code": "...", "newPrice": 0 }] }`;
  try {
    return await callGeminiAPI(prompt, base64, apiKey);
  } catch (e) {
    throw e;
  }
}

// 5. Alias
export async function extractPriceListData(file: File, apiKey: string) {
  return extractConsolidatedPriceListData(file, apiKey);
}

export async function identifyFabricFromImage(file: File) { return null; }