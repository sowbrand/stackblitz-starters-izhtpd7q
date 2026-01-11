// services/geminiService.ts

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

async function getWorkingModelName(apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    if (!data.models) return "gemini-1.5-flash";
    const models = data.models.map((m: any) => m.name.replace('models/', ''));
    const preferred = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro-vision"];
    for (const pref of preferred) {
      if (models.includes(pref)) return pref;
    }
    return "gemini-1.5-flash";
  } catch (e) {
    return "gemini-1.5-flash";
  }
}

async function callGeminiAPI(prompt: string, base64Image: string, apiKey: string) {
  if (!apiKey) throw new Error("Chave de API não fornecida.");

  const modelName = await getWorkingModelName(apiKey);
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
    throw new Error(`Erro Google (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanText);
}

// --- EXPORTS ---

// 1. Single Extraction (Cadastro de Malha)
export async function extractDataFromFile(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Analise esta imagem técnica de tecido. Retorne JSON:
    {
      "name": "Nome sugerido",
      "code": "Código sugerido",
      "price": 0.00,
      "width": 0,
      "grammage": 0,
      "yield": 0,
      "composition": "Composição",
      "image": ""
    }
  `;
  return callGeminiAPI(prompt, base64, apiKey);
}

// 2. Batch Extraction
export async function extractBatchDataFromFiles(files: File[], apiKey: string) {
  const promises = files.map(async (file) => {
    try {
      const base64 = await fileToBase64(file);
      const prompt = `Analise o tecido. Retorne JSON: { "name": "Nome", "code": "Cod", "price": 0, "composition": "Desc" }`;
      await new Promise(r => setTimeout(r, Math.random() * 1000));
      const data = await callGeminiAPI(prompt, base64, apiKey);
      return { ...data, id: Math.random().toString(36).substr(2, 9), originalFile: file.name };
    } catch (err) {
      console.warn(`Falha no arquivo ${file.name}`, err);
      return null;
    }
  });
  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

// 3. Consolidated List
export async function extractConsolidatedPriceListData(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `Extraia tabela. JSON array "products": [{ "code": "...", "name": "...", "price": 0 }]`;
  const result = await callGeminiAPI(prompt, base64, apiKey);
  return Array.isArray(result) ? result : (result.products || [result]);
}

// Stubs (sem uso crítico no momento)
export async function identifyFabricFromImage(file: File) { return null; }
export async function extractPriceListData(file: File) { return []; }
export async function extractPriceUpdateData(file: File) { return null; }