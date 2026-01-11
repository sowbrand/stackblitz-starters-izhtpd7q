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

// --- LIMPEZA DE JSON ---
function cleanJson(text: string): string {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

// --- FUNÇÃO CENTRAL: TENTA VÁRIOS MODELOS ATÉ UM FUNCIONAR ---
async function callGeminiAPI(prompt: string, base64Image: string, apiKey: string) {
  if (!apiKey) throw new Error("Chave de API não fornecida.");

  // LISTA DE TENTATIVAS (DA MAIS MODERNA PARA A MAIS ANTIGA)
  // Se o seu projeto não tiver uma, ele tenta a próxima automaticamente.
  const modelsToTry = [
    "gemini-1.5-flash",         // Padrão atual
    "gemini-1.5-flash-001",     // Versão específica (corrige muitos erros 404)
    "gemini-1.5-flash-latest",  // Alias alternativo
    "gemini-1.5-pro",           // Fallback potente
    "gemini-pro-vision"         // Legado (último recurso)
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Tentando conectar com modelo: ${modelName}...`);
      
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

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Se der 404 ou 400, lança erro para cair no catch e tentar o próximo modelo
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Falha no modelo ${modelName} (${response.status}): ${errText}`);
      }

      // SUCESSO!
      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]) {
        throw new Error("A IA não retornou resposta válida.");
      }

      const text = data.candidates[0].content.parts[0].text;
      const jsonString = cleanJson(text);
      return JSON.parse(jsonString);

    } catch (error: any) {
      console.warn(`Erro com ${modelName}:`, error.message);
      lastError = error;
      // Continua para o próximo modelo no loop...
    }
  }

  // Se saiu do loop, todos falharam
  console.error("Todos os modelos falharam.");
  throw new Error(`Não foi possível processar a imagem. Verifique se sua Chave API está correta e tem permissões. Detalhe: ${lastError?.message}`);
}

// ============================================================================
// EXPORTS DO SISTEMA (MANTIDOS IGUAIS PARA NÃO QUEBRAR O RESTO)
// ============================================================================

// 1. Single Extraction
export async function extractDataFromFile(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Analise esta imagem técnica de tecido.
    Retorne APENAS um JSON válido (sem markdown) com estes campos:
    {
      "name": "Nome comercial",
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
  // Processa em paralelo, mas com limite de taxa "natural"
  const promises = files.map(async (file) => {
    try {
      const base64 = await fileToBase64(file);
      const prompt = `
        Analise o tecido/etiqueta na imagem.
        Retorne APENAS JSON: { "name": "Nome", "code": "Cod", "price": 0, "composition": "Desc" }
      `;
      
      // Pequeno delay aleatório para evitar erro 429 (Too Many Requests)
      await new Promise(r => setTimeout(r, Math.random() * 1000));
      
      const data = await callGeminiAPI(prompt, base64, apiKey);
      return { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9), 
        originalFile: file.name 
      };
    } catch (err) {
      console.error(`Erro ao processar ${file.name}`, err);
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
    Se não achar array, retorne array puro.
  `;
  
  const result = await callGeminiAPI(prompt, base64, apiKey);
  
  // Normalização da resposta
  if (Array.isArray(result)) return result;
  if (result.products && Array.isArray(result.products)) return result.products;
  return [result];
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