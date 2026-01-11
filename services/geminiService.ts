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

// --- DESCOBERTA AUTOMÁTICA DE MODELO (CRUCIAL PARA CORRIGIR O 404) ---
async function pickBestModel(apiKey: string): Promise<string> {
  try {
    // Pergunta ao Google quais modelos estão disponíveis para esta chave
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) return "gemini-1.5-flash"; // Fallback padrão

    const data = await response.json();
    if (!data.models) return "gemini-1.5-flash";

    // Filtra modelos que geram texto
    const usableModels = data.models
      .filter((m: any) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
      .map((m: any) => m.name.replace('models/', ''));

    // Lista de preferência (do mais estável para o mais novo)
    const preferences = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-002",
      "gemini-2.0-flash-exp", // Cuidado com cota, mas serve se for o único
      "gemini-1.5-pro",
      "gemini-pro-vision"
    ];

    // Tenta achar o melhor
    for (const pref of preferences) {
      if (usableModels.includes(pref)) {
        console.log(`Modelo selecionado automaticamente: ${pref}`);
        return pref;
      }
    }

    // Se não achou nenhum da lista, pega o primeiro disponível que tenha 'flash'
    const fallback = usableModels.find((m: string) => m.includes('flash')) || usableModels[0];
    console.log(`Modelo fallback selecionado: ${fallback}`);
    return fallback || "gemini-1.5-flash";

  } catch (e) {
    return "gemini-1.5-flash";
  }
}

// --- CHAMADA API SEGURA ---
async function callGeminiAPI(prompt: string, base64Image: string, apiKey: string) {
  if (!apiKey) throw new Error("Chave de API não fornecida.");

  // 1. Descobre o modelo certo para evitar 404
  const modelName = await pickBestModel(apiKey);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: {
      temperature: 0.2, // Baixa temperatura para dados mais precisos
      maxOutputTokens: 2000,
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
      if (response.status === 429) {
        throw new Error("Limite de velocidade do Google atingido. Aguardando...");
      }
      throw new Error(`Erro Google (${modelName} - ${response.status}): ${errText}`);
    }

    const data = await response.json();
    
    // Validação para evitar o TypeError
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("A IA não retornou texto válido.");
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error: any) {
    throw error; // Repassa o erro para ser tratado no loop
  }
}

// ============================================================================
// EXPORTS DO SISTEMA
// ============================================================================

// 1. Single Extraction (Cadastro Unitário)
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

// 2. Batch Extraction (Lote - COM SUPORTE A VARIAÇÕES DE COR)
export async function extractBatchDataFromFiles(files: File[], apiKey: string) {
  // Tipagem explícita para evitar erros
  const results: any[] = [];

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file);
      
      const prompt = `
        Analise a imagem da etiqueta técnica de tecido.
        
        TAREFA: Extrair dados e gerar itens baseados na Tabela de Cores.
        
        1. DADOS TÉCNICOS GERAIS (Comuns a todos):
           - Código (Ref): (ex: 76040)
           - Nome do Artigo: (ex: SUEDINE)
           - Largura (m): numérico
           - Gramatura (g/m²): numérico
           - Rendimento (m/kg): numérico
           - Composição: Texto completo
        
        2. PREÇOS POR COR (Importante):
           Procure pela tabela de "Classificação" ou "Cores" (BRANCO, CLARA, MÉDIA, ESCURA, EXTRA).
           Para CADA cor encontrada na tabela, extraia o preço da coluna "À VISTA".
        
        3. SAÍDA (Lista de Objetos JSON):
           Gere um objeto para cada cor encontrada.
           O nome deve ser: "Nome do Artigo - COR".
           
           Exemplo de retorno esperado:
           [
             { "name": "SUEDINE - BRANCO", "code": "76040", "price": 66.01, "width": 1.85, "grammage": 210, "yield": 2.57, "composition": "100% Algodão" },
             { "name": "SUEDINE - CLARA", "code": "76040", "price": 67.71, "width": 1.85, "grammage": 210, "yield": 2.57, "composition": "100% Algodão" }
           ]

        Se não houver tabela de cores, gere apenas um item com o preço base.
      `;
      
      console.log(`Processando ${file.name}...`);
      
      const responseData = await callGeminiAPI(prompt, base64, apiKey);
      
      // Garante que trabalhamos com array
      const items = Array.isArray(responseData) ? responseData : [responseData];

      items.forEach((item: any) => {
        results.push({ 
          ...item, 
          id: Math.random().toString(36).substr(2, 9), 
          originalFile: file.name 
        });
      });

      // Pausa de 4s para evitar erro 429 (Too Many Requests)
      await new Promise(resolve => setTimeout(resolve, 4000));

    } catch (err: any) {
      console.error(`Erro ao processar ${file.name}:`, err.message);
      // Não para o loop, tenta o próximo arquivo
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