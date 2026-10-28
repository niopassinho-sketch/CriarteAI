async function postToGeminiProxy(body: any): Promise<any> {
  const endpoints = ['/gemini-proxy-v2', '/api/gemini-proxy-v2', '/api/gemini/generate'];
  let lastError = new Error('Falha ao comunicar com o servidor');

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.status === 404) {
        // Tenta o próximo endpoint
        continue;
      }

      if (!response.ok) {
        let errorMsg = `Erro na API (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes('404')) {
        throw err;
      }
    }
  }

  throw lastError;
}

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

  const data = await postToGeminiProxy({
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
  });

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
  const finalPrompt = `Você é um redator especialista em criar homenagens emocionantes e detalhadas.
  
  Crie um texto longo (uma história ou homenagem expandida) sobre o seguinte tema: ${topic}
  
  Diretrizes:
  - O texto deve ter aproximadamente ${wordCount} palavras.
  - Inclua as seguintes informações adicionais/memórias específicas: "${additionalInfo}"
  - Adapte o tom para a rede social: ${redeSocial}
  - O texto deve ser emocionante, bem estruturado e engajador.
  - Inclua hashtags relevantes no final, de acordo com a rede social, e sempre inclua a hashtag #CriarteAI.
  `;

  const data = await postToGeminiProxy({
    prompt: finalPrompt,
    model: "gemini-3-flash-preview",
  });

  return data.text || "Erro ao gerar texto. Tente novamente.";
};

export const enhanceImageWithIA = async (imageB64: string, userPrompt: string) => {
  try {
    const data = await postToGeminiProxy({
      prompt: `Editor de Arte. Analise a imagem e o pedido: "${userPrompt}".`,
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "Retorne APENAS JSON: {filter: string, overlayEmoji: string|null, borderColor: string|null, suggestion: string}.",
        responseMimeType: "application/json",
      }
    });

    const text = data.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Erro na IA:", error);
    throw new Error("Não foi possível processar a imagem. Tente novamente.");
  }
};
