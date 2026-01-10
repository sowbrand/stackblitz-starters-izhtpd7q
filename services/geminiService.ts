import { GoogleGenerativeAI } from "@google/generative-ai";

// Função para validar a chave antes de começar
const getGenAI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey || apiKey.includes('SuaChaveAqui')) {
    console.error("ERRO CRÍTICO: Chave de API inválida ou não encontrada.");
    throw new Error("Chave de API não configurada corretamente.");
  }
  
  return new GoogleGenerativeAI(apiKey);
};

export async function identifyFabricFromImage(imageFile: File) {
  try {
    console.log("🚀 Iniciando processamento com Gemini 1.5 Flash...");
    const genAI = getGenAI();
    
    // USANDO O MODELO MAIS MODERNO E COMPATÍVEL
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Converter arquivo para Base64
    const base64Data = await fileToGenerativePart(imageFile);

    const prompt = `
      Você é um especialista têxtil. Analise esta imagem de tecido/malha.
      Retorne APENAS um objeto JSON (sem crases, sem markdown) com estes dados estimados:
      {
        "name": "Nome comercial provável (ex: Malha PV, Piquet, Dry Fit)",
        "code": "Sugira um código curto de 6 letras (ex: MAL-PV)",
        "price": 0.00 (estime um preço de mercado em reais entre 20 e 80),
        "width": 0 (largura padrão em cm, ex: 160, 180),
        "grammage": 0 (gramatura em g/m², ex: 160, 200),
        "yield": 0 (rendimento em m/kg, ex: 2.5),
        "composition": "Composição provável (ex: 67% Poliéster 33% Viscose)",
        "image": "Mantenha vazio"
      }
    `;

    console.log("📤 Enviando imagem para a IA...");
    const result = await model.generateContent([prompt, base64Data]);
    const response = await result.response;
    const text = response.text();
    
    console.log("📥 Resposta bruta da IA:", text);

    // Limpar formatação Markdown se houver
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("❌ Erro detalhado na API Gemini:", error);
    
    // Tratamento de erros específicos
    if (error.message?.includes("404") || error.message?.includes("not found")) {
        throw new Error("FALHA: O modelo 'gemini-1.5-flash' não foi encontrado. Verifique se sua chave API tem permissão.");
    }
    
    throw new Error(`Erro na IA: ${error.message || "Falha desconhecida"}`);
  }
}

// Função auxiliar para converter imagem
async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}