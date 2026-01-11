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

// --- DESCOBERTA DE MODELO ---
// Prioriza o que estiver disponível, mas sabemos que na sua conta é o 2.0-flash-exp
async function pickBestModel(apiKey: string): Promise<string> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) return "gemini-2.0-flash-exp"; // Chute seguro baseado no seu log

    const data = await response.json();
    if (!data.models) return "gemini-2.0-flash-exp";

    const usableModels = data.models
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => m.name.replace('models/', ''));

    // Sua conta parece preferir o 2.0, então vamos colocá-lo no topo se existir, 
    // mas com o sistema de retry ele vai funcionar.
    const preferences = [
      "gemini-1.5-flash", 
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash-exp" 
    ];

    for (const pref of preferences) {
      if (usableModels.includes(pref)) return pref;
    }
    
    return usableModels[0] || "gemini-2.0-flash-exp";
  } catch (e) {
    return "gemini-2.0-flash-exp";
  }
}

// --- CHAMADA API COM RETRY (A SOLUÇÃO DO ERRO 429) ---
async function callGeminiAPI(prompt: string, base64Image: string, apiKey: string, retries = 3) {
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

    // SE DER ERRO 429 (Muitas requisições), ESPERA E TENTA DE NOVO
    if (response.status === 429) {
      if (retries > 0) {
        console.warn(`Limite atingido (${modelName}). Aguardando 10 segundos para tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Espera 10s
        return callGeminiAPI(prompt, base64Image, apiKey, retries - 1); // Tenta de novo
      } else {
        throw new Error("Limite de cota do Google excedido mesmo após várias tentativas.");
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro Google (${response.status}): ${errText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("A IA não retornou texto.");
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error: any) {
    // Se for erro de rede ou parse, tenta de novo também
    if (retries > 0 && (error.message.includes("fetch") || error.message.includes("JSON"))) {
        console.warn("Erro de rede/parse. Tentando novamente...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        return callGeminiAPI(prompt, base64Image, apiKey, retries - 1);
    }
    throw error;
  }
}

// ============================================================================
// EXPORTS
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

// 2. Batch Extraction - COM LÓGICA DE CORES E RETRY
export async function extractBatchDataFromFiles(files: File[], apiKey: string) {
  const results: any[] = [];

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file);
      
      const prompt = `
        Atue como um importador têxtil. Analise a imagem (etiqueta técnica).
        
        OBJETIVO: Extrair dados técnicos e gerar uma lista de preços baseada nas cores.

        1. DADOS GERAIS (Repetir para todas as cores):
           - Código (Ref): ex: 76040
           - Nome do Artigo: ex: SUEDINE
           - Largura (m): número (ex: 1.85)
           - Gramatura (g/m²): número (ex: 210)
           - Rendimento (m/kg): número (ex: 2.57)
           - Composição: Texto (ex: 100% Algodão)
        
        2. PREÇOS POR COR (Coluna À VISTA):
           Procure a tabela de cores/classificação:
           - BRANCO
           - CLARA
           - MÉDIA
           - ESCURA
           - EXTRA
           
           Para cada uma encontrada, pegue o valor À VISTA.
        
        3. SAÍDA (Lista JSON):
           Gere um objeto para cada cor encontrada.
           O nome deve ser: "Nome do Artigo - COR" (ex: SUEDINE - BRANCO).
           
           Se não houver tabela de cores, gere apenas 1 item com o preço base.

           Retorne APENAS o JSON da lista.
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

      // Pausa entre arquivos para ajudar a cota
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err) {
      console.error(`Erro fatal no arquivo ${file.name}`, err);
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