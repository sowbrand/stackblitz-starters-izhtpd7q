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

// --- SELEÇÃO DE MODELO ---
async function pickBestModel(apiKey: string): Promise<string> {
  // Mantemos o flash-latest pois é rápido e sua conta tem acesso
  return "gemini-flash-latest";
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
    throw new Error(`Erro Google (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error("A IA não retornou texto.");

  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanText);
}

// ============================================================================
// EXPORTS DO SISTEMA (CORRIGIDOS PARA 1 PRODUTO ÚNICO)
// ============================================================================

// 1. Single Extraction (Cadastro Unitário)
export async function extractDataFromFile(file: File, apiKey: string) {
  const base64 = await fileToBase64(file);
  const prompt = `
    Analise esta etiqueta técnica de tecido. Extraia os dados para cadastro de UM ÚNICO produto.
    
    REGRAS DE EXTRAÇÃO:
    - Preço: Se houver tabela de cores, use OBRIGATORIAMENTE o valor da cor "BRANCO" na coluna "À VISTA".
    - Largura: Valor numérico (ex: 1.85).
    - Gramatura: Valor numérico (ex: 210).
    - Rendimento: Valor numérico (ex: 2.57).
    - Composição: Texto completo (ex: 100% Algodão).
    
    Retorne APENAS JSON: 
    { 
      "name": "Nome do Artigo", 
      "code": "Código", 
      "price": 0.00, 
      "width": 0.00, 
      "grammage": 0, 
      "yield": 0.00, 
      "composition": "Descrição" 
    }
  `;
  try {
    const result = await callGeminiAPI(prompt, base64, apiKey);
    return Array.isArray(result) ? result[0] : result;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// 2. Batch Extraction (Lote) - AGORA RETORNA APENAS 1 ITEM POR ARQUIVO
export async function extractBatchDataFromFiles(files: File[], apiKey: string) {
  const results = [];

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file);
      
      const prompt = `
        Analise a imagem técnica de tecido. Extraia os dados para cadastro de UM ÚNICO produto.
        
        IMPORTANTE:
        1. Ignore variações de cor para criar linhas extras. Crie apenas UMA linha por imagem.
        2. Preço: Use o preço base "BRANCO" / "À VISTA".
        3. Extraia os dados técnicos (Largura, Gramatura, Rendimento) com precisão.

        Retorne APENAS UM JSON: 
        { 
          "name": "Nome", 
          "code": "Ref", 
          "price": 0.00, 
          "width": 0.00, 
          "grammage": 0, 
          "yield": 0.00, 
          "composition": "Desc" 
        }
      `;
      
      console.log(`Processando ${file.name}...`);
      
      const data = await callGeminiAPI(prompt, base64, apiKey);
      
      // Garante que é um objeto único, não array
      const item = Array.isArray(data) ? data[0] : data;

      results.push({ 
        ...item, 
        id: Math.random().toString(36).substr(2, 9), 
        originalFile: file.name 
      });

      // Pausa de segurança (4s)
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