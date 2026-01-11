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

// --- DESCOBERTA AUTOMÁTICA DE MODELO (A CORREÇÃO) ---
// Esta função lista o que a sua conta TEM acesso e escolhe o melhor
async function pickBestModel(apiKey: string): Promise<string> {
  try {
    // 1. Pede a lista real de modelos para a sua chave
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(listUrl);
    
    if (!response.ok) {
       console.warn("Não foi possível listar modelos. Usando fallback seguro.");
       return "gemini-1.5-flash";
    }

    const data = await response.json();

    if (!data.models) return "gemini-1.5-flash";

    // 2. Filtra apenas modelos que sabem "Gerar Conteúdo" (descarta embeddings, etc)
    const usableModels = data.models
      .filter((m: any) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
      .map((m: any) => m.name.replace('models/', ''));

    console.log("Modelos disponíveis na sua chave:", usableModels);

    // 3. Lista de preferência (do mais rápido/moderno para o mais antigo)
    const preferences = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-002",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-pro-vision"
    ];

    // Tenta encontrar um modelo da lista de preferência que EXISTA na sua conta
    for (const pref of preferences) {
      if (usableModels.includes(pref)) return pref;
    }

    // Se não achou os exatos, pega qualquer um que tenha 'flash' no nome (geralmente o melhor custo-benefício)
    const anyFlash = usableModels.find((m: string) => m.includes('flash'));
    if (anyFlash) return anyFlash;

    // Se não, pega o primeiro da lista que seja válido
    if (usableModels.length > 0) return usableModels[0];

    return "gemini-1.5-flash"; // Último recurso

  } catch (e) {
    console.error("Erro ao escolher modelo:", e);
    return "gemini-1.5-flash";
  }
}

// --- FUNÇÃO CENTRAL DE CONEXÃO ---
async function callGeminiAPI(prompt: string, base64Image: string, apiKey: string) {
  if (!apiKey) throw new Error("Chave de API não fornecida.");

  // Passo 1: Descobre o nome correto do modelo
  const modelName = await pickBestModel(apiKey);
  console.log(`Conectando usando o modelo: ${modelName}`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000,
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro Google (${modelName} - ${response.status}): ${errText}`);
    }

    const data = await response.json();
    
    // Validação extra para garantir que veio resposta
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("A IA processou mas não retornou texto. Tente outra imagem.");
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("Falha na chamada da API:", error);
    throw error;
  }
}

// ============================================================================
// EXPORTS DO SISTEMA
// ============================================================================

// 1. Single Extraction
export async function extractDataFromFile(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Atue como especialista têxtil. Analise a imagem.
    Retorne APENAS um JSON válido (sem markdown) com estes campos:
    {
      "name": "Nome comercial",
      "code": "Código",
      "price": 0.00,
      "width": 0,
      "grammage": 0,
      "yield": 0,
      "composition": "Composição",
      "image": ""
    }
  `;
  try {
    return await callGeminiAPI(prompt, base64, apiKey);
  } catch (e) {
    // Retorno de segurança para não travar a tela
    console.error(e);
    throw e; 
  }
}

// 2. Batch Extraction
export async function extractBatchDataFromFiles(files: File[], apiKey: string) {
  const promises = files.map(async (file) => {
    try {
      const base64 = await fileToBase64(file);
      const prompt = `Analise o tecido/etiqueta. Retorne APENAS JSON: { "name": "Nome", "code": "Ref", "price": 0, "composition": "Desc" }`;
      
      // Delay aleatório para evitar erro de muitos pedidos ao mesmo tempo
      await new Promise(r => setTimeout(r, Math.random() * 800));
      
      const data = await callGeminiAPI(prompt, base64, apiKey);
      return { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9), 
        originalFile: file.name 
      };
    } catch (err) {
      console.error(`Erro no arquivo ${file.name}`, err);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

// 3. Consolidated List
export async function extractConsolidatedPriceListData(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Extraia a tabela de preços da imagem.
    Retorne APENAS um JSON com array "products":
    { "products": [{ "code": "...", "name": "...", "price": 0 }] }
    Se a imagem não for clara, tente extrair o que for possível.
  `;
  
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
  const prompt = `
    Analise o comunicado de reajuste.
    Retorne APENAS JSON:
    { "effectiveDate": "YYYY-MM-DD", "percentage": 0, "items": [{ "code": "...", "newPrice": 0 }] }
  `;
  return callGeminiAPI(prompt, base64, apiKey);
}

// 5. Price List (Alias)
export async function extractPriceListData(file: File, apiKey: string) {
  return extractConsolidatedPriceListData(file, apiKey);
}

// Stub
export async function identifyFabricFromImage(file: File) { return null; }