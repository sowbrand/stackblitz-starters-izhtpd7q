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
  // Com base na sua lista, o 'gemini-flash-latest' é o mais seguro para conta gratuita.
  // Evitamos os 'exp' (experimentais) pois eles têm cota zero ou instável.
  return "gemini-flash-latest";
}

// --- CHAMADA API COM TRATAMENTO DE ERRO ROBUSTO ---
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

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    // Se der erro 429 (Muitas requisições), lançamos erro específico
    if (response.status === 429) {
      throw new Error("Limite de velocidade do Google atingido. Aguardando...");
    }
    throw new Error(`Erro Google (${modelName} - ${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error("A IA não retornou texto.");

  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanText);
}

// ============================================================================
// EXPORTS DO SISTEMA
// ============================================================================

// 1. Single Extraction
export async function extractDataFromFile(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `Analise a imagem. JSON: { "name": "Nome", "code": "Cod", "price": 0, "width": 0, "grammage": 0, "yield": 0, "composition": "Comp" }`;
  try {
    return await callGeminiAPI(prompt, base64, apiKey);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// 2. Batch Extraction - REESCRITA PARA SER SEQUENCIAL (EVITA ERRO 429)
export async function extractBatchDataFromFiles(files: File[], apiKey: string) {
  const results = [];

  // Loop FOR...OF garante que processamos UM arquivo de cada vez
  // O Promise.all anterior tentava todos ao mesmo tempo e o Google bloqueava
  for (const file of files) {
    try {
      const base64 = await fileToBase64(file);
      const prompt = `Analise o tecido. JSON: { "name": "Nome", "code": "Ref", "price": 0, "composition": "Desc" }`;
      
      console.log(`Processando ${file.name}...`);
      
      // Chama a API
      const data = await callGeminiAPI(prompt, base64, apiKey);
      
      results.push({ 
        ...data, 
        id: Math.random().toString(36).substr(2, 9), 
        originalFile: file.name 
      });

      // PAUSA OBRIGATÓRIA DE 4 SEGUNDOS ENTRE ARQUIVOS
      // A conta gratuita permite ~15 requisições/minuto. 4s de pausa garante segurança.
      await new Promise(resolve => setTimeout(resolve, 4000));

    } catch (err) {
      console.error(`Erro ao processar ${file.name}`, err);
      // Se um falhar, não para os outros, apenas loga e continua
    }
  }

  return results;
}

// 3. Consolidated List
export async function extractConsolidatedPriceListData(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `Extraia tabela. JSON array "products": [{ "code": "...", "name": "...", "price": 0 }]`;
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
  const prompt = `Analise reajuste. JSON: { "effectiveDate": "YYYY-MM-DD", "items": [{ "code": "...", "newPrice": 0 }] }`;
  try {
    return await callGeminiAPI(prompt, base64, apiKey);
  } catch (e) {
    throw e;
  }
}

// 5. Price List (Alias)
export async function extractPriceListData(file: File, apiKey: string) {
  return extractConsolidatedPriceListData(file, apiKey);
}

// Stub
export async function identifyFabricFromImage(file: File) { return null; }