import { useState, useEffect } from 'react';
import { Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { enhanceImageWithIA } from '../services/geminiService';

interface OverlayItem {
  emoji: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium';
  opacity: number;
}

interface EnhancementResult {
  filter?: string;
  borderColor?: string;
  overlays?: OverlayItem[];
  enhancedImageBase64?: string;
}

interface AIImageEnhancerProps {
  imageFile: File;
  onEnhancementComplete: (data: EnhancementResult) => void;
}

export function AIImageEnhancer({ imageFile, onEnhancementComplete }: AIImageEnhancerProps) {
  const [iaPrompt, setIaPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementResults, setEnhancementResults] = useState<EnhancementResult | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [history, setHistory] = useState<EnhancementResult[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Evita vazamento de memória
  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // 🔥 Fallback inteligente COMPLETO
  const generateFallbackOverlays = (prompt: string): OverlayItem[] => {
    const lower = prompt.toLowerCase();

    if (lower.includes("anivers")) {
      return [
        { emoji: "🎉", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "🎂", position: "bottom-left", size: "small", opacity: 0.6 },
        { emoji: "🎈", position: "top-left", size: "small", opacity: 0.5 }
      ];
    }

    if (lower.includes("amor") || lower.includes("romant") || lower.includes("casal")) {
      return [
        { emoji: "❤️", position: "top-right", size: "small", opacity: 0.5 },
        { emoji: "💖", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "💕", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("casamento") || lower.includes("noiva")) {
      return [
        { emoji: "💍", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "👰", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "🤵", position: "top-left", size: "small", opacity: 0.5 }
      ];
    }

    if (lower.includes("formatura") || lower.includes("graduação")) {
      return [
        { emoji: "🎓", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "📜", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "✨", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("amizade") || lower.includes("amigo")) {
      return [
        { emoji: "🤝", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "😊", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "💙", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("pai")) {
      return [
        { emoji: "👨", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "💙", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "👏", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("mãe") || lower.includes("mae") || lower.includes("mamãe")) {
      return [
        { emoji: "👩", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "🌸", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "💖", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("mulher")) {
      return [
        { emoji: "🌹", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "💜", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "✨", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("natal")) {
      return [
        { emoji: "🎄", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "🎅", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "❄️", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("ano novo") || lower.includes("reveillon")) {
      return [
        { emoji: "🎆", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "🥂", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "✨", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("batizado") || lower.includes("batismo")) {
      return [
        { emoji: "👶", position: "top-right", size: "small", opacity: 0.6 },
        { emoji: "🕊️", position: "bottom-left", size: "small", opacity: 0.5 },
        { emoji: "🙏", position: "top-left", size: "small", opacity: 0.4 }
      ];
    }

    if (lower.includes("luto") || lower.includes("homenagem")) {
      return [
        { emoji: "🕊️", position: "top-right", size: "small", opacity: 0.4 },
        { emoji: "🤍", position: "top-left", size: "small", opacity: 0.3 }
      ];
    }

    return [
      { emoji: "✨", position: "top-right", size: "small", opacity: 0.4 },
      { emoji: "💫", position: "bottom-left", size: "small", opacity: 0.4 }
    ];
  };

  const buildSmartPrompt = (userPrompt: string) => {
    return `
Você é um editor profissional de imagens.

REGRAS:
- Sempre retornar JSON válido
- Se o usuário pedir elementos, incluir overlays
- Não colocar no centro
- Não cobrir o rosto
- Elementos pequenos e discretos

Formato:
{
  "filter": "",
  "borderColor": "",
  "overlays": []
}

Pedido:
${userPrompt}
`;
  };

  const handleEnhance = async () => {
    if (!iaPrompt) return;
    setIsEnhancing(true);

    try {
      const base64data = await toBase64(imageFile);
      const smartPrompt = buildSmartPrompt(iaPrompt);

      let result: EnhancementResult = await enhanceImageWithIA(base64data, smartPrompt);

      // 🔥 GARANTIA DE EMOJIS
      if (!result.overlays || result.overlays.length === 0) {
        result.overlays = generateFallbackOverlays(iaPrompt);
      }

      setEnhancementResults(result);
      setIsEnhanced(true);
      setHistory((prev) => [...prev, result]);

      onEnhancementComplete(result);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao processar imagem");
    } finally {
      setIsEnhancing(false);
    }
  };

  const getPosition = (pos?: string) => {
    switch (pos) {
      case 'top-left': return 'top-2 left-2';
      case 'bottom-left': return 'bottom-2 left-2';
      case 'bottom-right': return 'bottom-2 right-2';
      default: return 'top-2 right-2';
    }
  };

  const getSize = (size?: string) => {
    return size === 'medium' ? 'text-2xl' : 'text-xl';
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      {!isEnhanced ? (
        <>
          <textarea
            value={iaPrompt}
            onChange={(e) => setIaPrompt(e.target.value)}
            placeholder="Ex: adicionar emojis de aniversário"
            className="w-full p-3 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
            rows={2}
          />
          <button 
            onClick={handleEnhance}
            disabled={isEnhancing || !iaPrompt}
            className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isEnhancing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Melhorar</span>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2 border border-green-100">
            <CheckCircle2 className="w-4 h-4" />
            Ajustes aplicados com sucesso!
          </div>
          
          <div className="relative rounded-lg overflow-hidden border-4" style={{ borderColor: enhancementResults?.borderColor || 'transparent' }}>
            <img 
              src={enhancementResults?.enhancedImageBase64 || imageUrl} 
              className="w-full h-auto object-cover"
              style={{ filter: enhancementResults?.filter }}
            />
            {enhancementResults?.overlays?.map((o, i) => (
              <div
                key={i}
                className={`absolute ${getPosition(o.position)} ${getSize(o.size)}`}
                style={{ opacity: o.opacity }}
              >
                {o.emoji}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setIsEnhanced(false);
              setEnhancementResults(null);
              setIaPrompt("");
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
          >
            Pedir novas alterações
          </button>
        </div>
      )}
    </div>
  );
}