// --- CONFIGURAÇÃO ---
// SUA CHAVE (MANTIDA)
const API_KEY = "AIzaSyAtV76KTAHaYhVgT6MCPLCyLPKptS9nZuk"; 

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

// --- AUTO-DETECÇÃO DE MODELO ---
// Esta função pergunta ao Google qual modelo está disponível para sua chave
async function getWorkingModelName(): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.models) {
      console.warn("Não foi possível listar modelos. Usando fallback.");
      return "gemini-1.5-flash"; // Fallback padrão
    }

    // Procura por modelos de visão (Flash ou Pro Vision)
    // Prioriza o Flash (mais rápido), depois Pro Vision, depois qualquer Pro
    const models = data.models.map((m: any) => m.name.replace('models/', ''));
    
    console.log("Modelos disponíveis na sua conta:", models);

    const preferred = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-001",
      "gemini-pro-vision",
      "gemini-1.0-pro-vision-latest"
    ];

    // Tenta encontrar um dos preferidos na lista real do Google
    for (const pref of preferred) {
      if (models.includes(pref)) return pref;
    }

    // Se não achar os exatos, pega qualquer um que tenha 'vision' ou 'flash'
    const fallback = models.find((m: string) => m.includes('flash') || m.includes('vision'));
    return fallback || "gemini-1.5-flash";

  } catch (e) {
    console.error("Erro ao auto-detectar modelo:", e);
    return "gemini-1.5-flash";
  }
}

// --- FUNÇÃO CENTRAL DE CONEXÃO ---
async function callGeminiAPI(prompt: string, base64Image: string) {
  // 1. Descobre o modelo certo dinamicamente
  const modelName = await getWorkingModelName();
  console.log(`Tentando conectar usando o modelo: ${modelName}`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1000, // Aumentado para garantir JSON completo
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
      throw new Error(`Erro Google (${modelName}): ${response.status} - ${errText}`);
    }

    const data = await response.json();
    
    try {
      const text = data.candidates[0].content.parts[0].text;
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Resposta da IA não foi JSON:", data);
      throw new Error("A IA respondeu, mas não foi um JSON válido.");
    }

  } catch (error: any) {
    console.error("Falha fatal na conexão:", error);
    throw error;
  }
}

// ============================================================================
// FUNÇÕES DO SISTEMA (MANTIDAS IGUAIS)
// ============================================================================

export async function identifyFabricFromImage(imageFile: File) {
  return extractDataFromFile(imageFile);
}

export async function extractDataFromFile(file: File) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Atue como especialista têxtil. Analise a imagem.
    Retorne APENAS um JSON:
    {
      "name": "Nome comercial",
      "code": "Código (ex: MAL-01)",
      "price": 0.00,
      "width": 0,
      "grammage": 0,
      "yield": 0,
      "composition": "Composição",
      "image": ""
    }
  `;
  return callGeminiAPI(prompt, base64);
}

export async function extractBatchDataFromFiles(files: File[]) {
  const promises = files.map(async (file) => {
    try {
      const base64 = await fileToBase64(file);
      const prompt = `Retorne JSON: { "name": "Nome", "code": "Ref", "price": 0, "width": 0, "grammage": 0, "yield": 0, "composition": "Desc" }`;
      
      await new Promise(r => setTimeout(r, Math.random() * 1000));
      
      const data = await callGeminiAPI(prompt, base64);
      return { ...data, id: Math.random().toString(36).substr(2, 9), originalFile: file.name };
    } catch (err) {
      console.error(`Erro no arquivo ${file.name}`, err);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

export async function extractPriceListData(file: File) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Extraia a tabela. Retorne JSON com array "products" ou array puro:
    [{ "code": "...", "name": "...", "price": 0, "composition": "..." }]
  `;
  const result = await callGeminiAPI(prompt, base64);
  return Array.isArray(result) ? result : (result.products || [result]);
}

export async function extractPriceUpdateData(file: File) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Analise o reajuste. Retorne JSON:
    { "effectiveDate": "YYYY-MM-DD", "items": [{ "code": "...", "newPrice": 0 }] }
  `;
  return callGeminiAPI(prompt, base64);
}

export async function extractConsolidatedPriceListData(file: File) {
  return extractPriceListData(file);
}