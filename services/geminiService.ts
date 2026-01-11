// NÃO IMPORTAMOS MAIS A BIBLIOTECA QUE ESTÁ DANDO ERRO
// O código agora usa fetch nativo do navegador.

// --- CONFIGURAÇÃO ---
// SUA CHAVE (JÁ INCLUÍDA)
const API_KEY = "AIzaSyAtV76KTAHaYhVgT6MCPLCyLPKptS9nZuk"; 

// --- FUNÇÃO AUXILIAR: ARQUIVO PARA BASE64 ---
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove o cabeçalho "data:image/jpeg;base64," para enviar só os dados
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// --- FUNÇÃO CENTRAL DE CONEXÃO (RAW HTTP) ---
async function callGeminiAPI(prompt: string, base64Image: string) {
  // TENTATIVA 1: Modelo Flash (Mais rápido)
  try {
    return await tryModel("gemini-1.5-flash", prompt, base64Image);
  } catch (error) {
    console.warn("Flash falhou, tentando modelo clássico...", error);
    
    // TENTATIVA 2: Modelo Pro Vision (Mais robusto para contas antigas/manuais)
    try {
      return await tryModel("gemini-pro-vision", prompt, base64Image);
    } catch (finalError: any) {
      console.error("Todos os modelos falharam:", finalError);
      throw new Error(`Erro Google: ${finalError.message}`);
    }
  }
}

// Função que faz o envio real
async function tryModel(modelName: string, prompt: string, base64Image: string) {
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
      maxOutputTokens: 800,
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // Se der erro (ex: 404), lança para cair no catch e tentar o próximo modelo
    const errText = await response.text();
    throw new Error(`Erro API (${response.status}): ${errText}`);
  }

  const data = await response.json();
  
  // Extrai o texto da resposta complexa do Google
  try {
    const text = data.candidates[0].content.parts[0].text;
    // Limpa o Markdown (```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("A IA respondeu, mas não foi um JSON válido.");
  }
}

// ============================================================================
// FUNÇÕES DO SISTEMA (MANTIDAS IGUAIS PARA NÃO QUEBRAR O SITE)
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
      
      // Delay pequeno para não bloquear
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