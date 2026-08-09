import { GoogleGenAI, Type } from "@google/genai";

export const generatePostMessage = async (topic: string, redeSocial: string = 'Genérica'): Promise<string[]> => {
  let promptRedeSocial = '';
  if (redeSocial === 'Instagram') {
    promptRedeSocial = 'Adapte o texto para o Instagram: foco em visual, tom mais engajador. Inclua de 3 a 5 hashtags populares e visuais no final (ex: #homenagem #amor #aniversario #gratidao #instamoment #criatividade #inspiracao #celebração).';
  } else if (redeSocial === 'WhatsApp') {
    promptRedeSocial = 'Adapte o texto para o WhatsApp: texto mais curto, direto e ideal para status ou envio rápido. Prefira não usar hashtags ou usar apenas uma de sentimento (ex: #gratidão).';
  } else if (redeSocial === 'LinkedIn') {
    promptRedeSocial = 'Adapte o texto para o LinkedIn: tom um pouco mais profissional e inspirador. Inclua de 3 a 5 hashtags focadas em valores humanos e profissionais no final (ex: #liderança #reconhecimento #carreira #inspiracao #equipe #softskills #gratidãoprofissional).';
  } else if (redeSocial === 'Tik Tok') {
    promptRedeSocial = 'Adapte o texto para o Tik Tok: texto dinâmico, curto, com linguagem atual. Inclua de 3 a 5 hashtags virais no final.';
  } else if (redeSocial === 'Facebook') {
    promptRedeSocial = 'Adapte o texto para o Facebook: tom amigável, focado em conexões familiares e de amizade. Inclua de 3 a 5 hashtags de comunidade e família no final (ex: #familia #amigos #recordação #felicidade #homenagemespecial).';
  } else {
    promptRedeSocial = 'Adapte o texto para um post genérico. Inclua de 3 a 5 hashtags equilibradas e padrão de celebração no final (ex: #postdodia #homenagem #inspiracao #momentos).';
  }

  const finalPrompt = `Crie 3 opções de mensagens curtas e engajadoras para um post sobre: ${topic}
  
  ${promptRedeSocial}
  
  MUITO IMPORTANTE:
  1. Gere a legenda principal (para o card) com no máximo 160 caracteres. O texto deve ser impactante e direto.
  2. Proibição de Nomes: O texto da legenda NÃO deve conter o nome do usuário/remetente dentro da frase principal.
  3. Foco na Mensagem: Gere apenas a mensagem de homenagem. Você pode iniciar com o nome do homenageado, mas não é obrigatório.
  4. Assinatura: NÃO inclua o nome do remetente na legenda.
  5. Sempre inclua a hashtag #CriarteAI no final de todas as opções de mensagem geradas.`;

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: finalPrompt,
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "STRING"
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error("Erro na API");
  }

  const data = await response.json();
  
  try {
    return typeof data.text === 'string' ? JSON.parse(data.text) : data.text;
  } catch (error) {
    console.error("Erro ao fazer parse do JSON do Gemini:", error);
    return ["Erro ao gerar opções. Tente novamente."];
  }
};

export const generateLongCaption = async (
  topic: string,
  redeSocial: string,
  wordCount: number,
  additionalInfo: string
): Promise<string> => {
  // Acessa a chave através do globalThis/window para evitar que o Vite substitua por {} no build
  const apiKey = (typeof window !== 'undefined' && window.process?.env?.GEMINI_API_KEY) 
    || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)
    || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave da API do Gemini não encontrada.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const finalPrompt = `Você é um redator especialista em criar homenagens emocionantes e detalhadas.
  
  Crie um texto longo (uma história ou homenagem expandida) sobre o seguinte tema: ${topic}
  
  Diretrizes:
  - O texto deve ter aproximadamente ${wordCount} palavras.
  - Inclua as seguintes informações adicionais/memórias específicas: "${additionalInfo}"
  - Adapte o tom para a rede social: ${redeSocial}
  - O texto deve ser emocionante, bem estruturado e engajador.
  - Inclua hashtags relevantes no final, de acordo com a rede social, e sempre inclua a hashtag #CriarteAI.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: finalPrompt,
  });
  
  return response.text || "Erro ao gerar texto. Tente novamente.";
};

export const enhanceImageWithIA = async (imageB64: string, userPrompt: string) => {
  const apiKey = (typeof window !== 'undefined' && window.process?.env?.GEMINI_API_KEY) 
    || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)
    || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) throw new Error("Configuração de API indisponível.");

  const ai = new GoogleGenAI({ apiKey });
  const base64Clean = imageB64.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Clean } },
          { text: `Editor de Arte. Analise a imagem e o pedido: "${userPrompt}".` }
        ]
      },
      config: {
        systemInstruction: "Retorne APENAS JSON: {filter: string, overlayEmoji: string|null, borderColor: string|null, suggestion: string}.",
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    // Tenta encontrar o objeto JSON dentro da resposta, ignorando texto extra
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Erro na IA:", error);
    throw new Error("Não foi possível processar a imagem. Tente novamente.");
  }
};
