import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

function getGeminiApiKey(): string | undefined {
  let key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    try {
      const devEnvPath = path.resolve(process.cwd(), "../.dev.env.json");
      if (fs.existsSync(devEnvPath)) {
        const parsed = JSON.parse(fs.readFileSync(devEnvPath, "utf8"));
        if (parsed.GEMINI_API_KEY && parsed.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
          return parsed.GEMINI_API_KEY;
        }
      }
    } catch {
      // ignore
    }
  }
  return key;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "25mb" }));

  // Gemini API Proxy handler
  const handleGeminiProxy = async (req: express.Request, res: express.Response) => {
    const { prompt, model, config } = req.body;
    const apiKey = getGeminiApiKey();

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(500).json({ error: "Chave da API Gemini não encontrada ou não configurada no servidor." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const primaryModel = model || "gemini-3-flash-preview";

      let response;
      try {
        response = await ai.models.generateContent({
          model: primaryModel,
          contents: prompt,
          config: config
        });
      } catch (firstErr: any) {
        console.warn(`Tentativa com ${primaryModel} falhou (${firstErr?.status || firstErr?.message}). Tentando modelo alternativo...`);
        const fallbackModel = primaryModel === "gemini-3-flash-preview" ? "gemini-3.8-flash" : "gemini-3-flash-preview";
        response = await ai.models.generateContent({
          model: fallbackModel,
          contents: prompt,
          config: config
        });
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro na API do Gemini:", error);
      if (error?.status === 400 || error?.message?.includes("API key")) {
        return res.status(401).json({ error: "Chave da API (GEMINI_API_KEY) inválida ou não autorizada." });
      }
      if (error?.status === 503 || error?.message?.includes("high demand") || error?.message?.includes("UNAVAILABLE")) {
        return res.status(503).json({ error: "O serviço de IA está temporariamente com alta demanda. Por favor, tente novamente em instantes." });
      }
      res.status(500).json({ error: error?.message || "Erro interno ao comunicar com a API do Gemini." });
    }
  };

  // Support all commonly used paths for proxying to prevent 404s
  const proxyPaths = ["/gemini-proxy-v2", "/api/gemini-proxy-v2", "/api/gemini/generate"];
  app.post(proxyPaths, handleGeminiProxy);

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

