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

// --- AUTO-DETECÇÃO DE MODELO ---
async function getWorkingModelName(apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();

    if (!data.models) return "gemini-1.5-flash";

    const models = data.models.map((m: any) => m.name.replace('models/', ''));
    console.log("Modelos detectados:", models);

    const preferred = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro-vision"];
    for (const pref of preferred) {
      if (models.includes(pref)) return pref;
    }
    return "gemini-1.5-flash";
  } catch (e) {
    return "gemini-1.5-flash";
  }
}

// --- FUNÇÃO CENTRAL DE CONEXÃO ---
// Agora recebe a apiKey como argumento obrigatório
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

// --- EXPORTS ADAPTADOS PARA RECEBER A CHAVE ---

export async function extractConsolidatedPriceListData(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Extraia a tabela de preços. Retorne JSON com array "products":
    [{ "code": "...", "name": "...", "price": 0 }]
  `;
  const result = await callGeminiAPI(prompt, base64, apiKey);
  return Array.isArray(result) ? result : (result.products || [result]);
}

// Adicionei exports vazios para as outras funções não quebrarem a compilação, 
// mas o foco hoje é o Consolidated.
export async function identifyFabricFromImage(file: File) { return null; }
export async function extractDataFromFile(file: File) { return null; }
export async function extractBatchDataFromFiles(files: File[]) { return []; }
export async function extractPriceListData(file: File) { return []; }
export async function extractPriceUpdateData(file: File) { return null; }