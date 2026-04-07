import { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { motion } from 'motion/react';
import { Download, ArrowLeft, Sparkles, CheckCircle2, LayoutTemplate, Image as ImageIcon, Heart, Gift, PartyPopper, Star, Trophy, Flower2, Crown, Medal, Share2, Copy, FileText, X, Loader2, Check } from 'lucide-react';
import { updatePost } from '../services/dbService';
import { generateLongCaption } from '../services/geminiService';
import { ClassicLayout, CoverLayout, PolaroidLayout, SplitLayout } from '../components/Layouts';
import { handleSupabaseError, OperationType } from '../services/errorHandling';

const getThemeConfig = (ocasiao: string) => {
  const lower = ocasiao.toLowerCase();
  
  if (lower.includes('aniversário') || lower.includes('festa') || lower.includes('parabéns')) {
    return {
      bgGradient: 'bg-gradient-to-br from-amber-50 via-white to-orange-50',
      topBarGradient: 'bg-gradient-to-r from-amber-400 to-orange-400',
      blob1: 'bg-orange-200',
      blob2: 'bg-amber-200',
      quoteColor: 'text-amber-200',
      imageRing: 'from-amber-400 to-orange-400',
      solidBg: 'bg-orange-500',
      solidText: 'text-white',
      icons: (
        <>
          <PartyPopper className="absolute top-12 left-8 w-10 h-10 text-orange-400/20 -rotate-12" />
          <Gift className="absolute bottom-16 right-8 w-12 h-12 text-amber-400/20 rotate-12" />
          <Star className="absolute top-32 right-10 w-6 h-6 text-orange-400/20 rotate-45" />
        </>
      )
    };
  }
  
  if (lower.includes('amor') || lower.includes('namorad') || lower.includes('casamento') || lower.includes('romântico') || lower.includes('espos') || lower.includes('noiv') || lower.includes('paixão')) {
    return {
      bgGradient: 'bg-gradient-to-br from-rose-50 via-white to-pink-50',
      topBarGradient: 'bg-gradient-to-r from-rose-400 to-pink-400',
      blob1: 'bg-pink-200',
      blob2: 'bg-rose-200',
      quoteColor: 'text-rose-200',
      imageRing: 'from-rose-400 to-pink-400',
      solidBg: 'bg-rose-500',
      solidText: 'text-white',
      icons: (
        <>
          <Heart className="absolute top-12 left-8 w-12 h-12 text-rose-400/20 -rotate-12" />
          <Heart className="absolute bottom-16 right-8 w-10 h-10 text-pink-400/20 rotate-12" />
          <Sparkles className="absolute top-32 right-10 w-6 h-6 text-rose-400/20" />
        </>
      )
    };
  }

  if (lower.includes('formatura') || lower.includes('conquista') || lower.includes('sucesso') || lower.includes('trabalho') || lower.includes('promoção')) {
    return {
      bgGradient: 'bg-gradient-to-br from-yellow-50 via-white to-amber-50',
      topBarGradient: 'bg-gradient-to-r from-yellow-400 to-amber-400',
      blob1: 'bg-amber-200',
      blob2: 'bg-yellow-200',
      quoteColor: 'text-yellow-200',
      imageRing: 'from-yellow-400 to-amber-400',
      solidBg: 'bg-amber-500',
      solidText: 'text-white',
      icons: (
        <>
          <Trophy className="absolute top-12 left-8 w-12 h-12 text-amber-400/20 -rotate-12" />
          <Star className="absolute bottom-16 right-8 w-10 h-10 text-yellow-400/20 rotate-12" />
          <Medal className="absolute top-32 right-10 w-8 h-8 text-amber-400/20" />
        </>
      )
    };
  }

  if (lower.includes('mulher') || lower.includes('mãe') || lower.includes('menina') || lower.includes('filha') || lower.includes('vó') || lower.includes('avó') || lower.includes('amiga')) {
    return {
      bgGradient: 'bg-gradient-to-br from-fuchsia-50 via-white to-pink-50',
      topBarGradient: 'bg-gradient-to-r from-fuchsia-400 to-pink-400',
      blob1: 'bg-pink-200',
      blob2: 'bg-fuchsia-200',
      quoteColor: 'text-fuchsia-200',
      imageRing: 'from-fuchsia-400 to-pink-400',
      solidBg: 'bg-fuchsia-500',
      solidText: 'text-white',
      icons: (
        <>
          <Flower2 className="absolute top-12 left-8 w-12 h-12 text-fuchsia-400/20 -rotate-12" />
          <Heart className="absolute bottom-16 right-8 w-10 h-10 text-pink-400/20 rotate-12" />
          <Sparkles className="absolute top-32 right-10 w-6 h-6 text-fuchsia-400/20" />
        </>
      )
    };
  }

  if (lower.includes('pai') || lower.includes('homem') || lower.includes('menino') || lower.includes('filho') || lower.includes('vô') || lower.includes('avô') || lower.includes('amigo')) {
    return {
      bgGradient: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50',
      topBarGradient: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      blob1: 'bg-cyan-200',
      blob2: 'bg-blue-200',
      quoteColor: 'text-blue-200',
      imageRing: 'from-blue-400 to-cyan-400',
      solidBg: 'bg-blue-500',
      solidText: 'text-white',
      icons: (
        <>
          <Crown className="absolute top-12 left-8 w-12 h-12 text-blue-400/20 -rotate-12" />
          <Star className="absolute bottom-16 right-8 w-10 h-10 text-cyan-400/20 rotate-12" />
          <Sparkles className="absolute top-32 right-10 w-6 h-6 text-blue-400/20" />
        </>
      )
    };
  }

  // Default
  return {
    bgGradient: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50',
    topBarGradient: 'bg-gradient-to-r from-indigo-400 to-purple-400',
    blob1: 'bg-purple-200',
    blob2: 'bg-indigo-200',
    quoteColor: 'text-indigo-200',
    imageRing: 'from-indigo-400 to-purple-400',
    solidBg: 'bg-indigo-600',
    solidText: 'text-white',
    icons: (
      <>
        <Sparkles className="absolute top-12 left-8 w-10 h-10 text-indigo-400/20 -rotate-12" />
        <Star className="absolute bottom-16 right-8 w-10 h-10 text-purple-400/20 rotate-12" />
      </>
    )
  };
};

export default function Resultado() {
  const location = useLocation();
  const navigate = useNavigate();
  const post = location.state?.post;
  const postRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setScale(width / 1080);
      }
    });

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => observer.disconnect();
  }, []);
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [layout, setLayout] = useState<'classic' | 'cover' | 'polaroid' | 'split'>('classic');
  const [formato, setFormato] = useState(post.formato_post || 'Quadrado (1:1 - Feed)');
  
  // Inicializa com dados da IA se existirem
  const [imageFilter, setImageFilter] = useState<'none' | 'classic-dark' | 'sepia' | 'grayscale' | 'blur'>(post.ia_enhancements?.filter || 'none');
  const [themeColor, setThemeColor] = useState(post.ia_enhancements?.borderColor || post?.cor_tema || '');
  
  // Estados do Modal de Texto Longo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wordCount, setWordCount] = useState<number>(150);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [longCaption, setLongCaption] = useState('');
  const [isGeneratingLongCaption, setIsGeneratingLongCaption] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (post?.id && layout !== (post.estilo || 'classic')) {
      const timer = setTimeout(async () => {
        try {
          await updatePost(post.id, { estilo: layout });
          post.estilo = layout;
        } catch (error) {
          handleSupabaseError(error, OperationType.UPDATE, 'posts');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [layout, post]);

  const colorPresets = [
    { name: 'Padrão', value: '' },
    { name: 'Roxo', value: '#6C63FF' },
    { name: 'Azul', value: '#00AEEF' },
    { name: 'Rosa', value: '#FF69B4' },
    { name: 'Dourado', value: '#FFD700' },
    { name: 'Cinza Escuro', value: '#333333' }
  ];

  if (!post) {
    navigate('/dashboard');
    return null;
  }

  const theme = getThemeConfig(post.tipo_ocasiao);

  const calculateFontSize = (text: string) => {
    const length = text.length;
    if (length <= 150) return 'text-base'; // 16px
    if (length <= 250) return 'text-sm'; // 14px
    if (length <= 400) return 'text-xs'; // 12px
    return 'text-[10px]'; // ~10px
  };

  const splitMessage = (text: string) => {
    // Tenta primeiro separar por quebras de linha explícitas
    const parts = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      const isSignature = lastPart.length < 120 && /^(com amor|com carinho|de:|ass:|beijos|abraços|seu|sua|com afeto|um abraço)/i.test(lastPart);
      
      if (isSignature) {
        return {
          mainText: parts.slice(0, parts.length - 1).join('\n\n'),
          signature: lastPart
        };
      }
    }

    // Se não houver quebra de linha, procura por palavras-chave perto do final do texto
    const keywords = ['com amor', 'com carinho', 'de:', 'ass:', 'beijos', 'abraços', 'com afeto', 'um abraço', 'seu ', 'sua ', 'atenciosamente'];
    const lowerText = text.toLowerCase();
    
    let bestIndex = -1;
    for (const keyword of keywords) {
      const idx = lowerText.lastIndexOf(keyword);
      // Garante que está nos últimos 150 caracteres e não no começo
      if (idx !== -1 && idx > text.length - 150 && idx > 0) {
        // Garante que é precedido por espaço ou pontuação
        const prevChar = lowerText[idx - 1];
        if (/[.\s!?]/.test(prevChar)) {
          if (idx > bestIndex) {
            bestIndex = idx;
          }
        }
      }
    }

    if (bestIndex !== -1) {
      let main = text.substring(0, bestIndex).trim();
      // Remove pontuação final do texto principal se houver
      main = main.replace(/[.,!?]+$/, '');
      const sig = text.substring(bestIndex).trim();
      return { mainText: main, signature: sig };
    }

    return { mainText: text, signature: '' };
  };

  const extractHashtags = (text: string) => {
    // Regex para encontrar hashtags no final do texto
    const hashtagRegex = /(?:\s*#[a-zA-ZÀ-ÿ0-9_]+)+/g;
    const cleanText = text.replace(hashtagRegex, '').trim();
    return { cleanText };
  };

  const { cleanText } = extractHashtags(post.mensagem_gerada);
  const { mainText: rawMainText, signature } = splitMessage(cleanText);
  const mainText = rawMainText.length > 160 ? rawMainText.substring(0, 157) + '...' : rawMainText;

  const isColorDark = (color: string) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const getFilterStyle = () => {
    switch (imageFilter) {
      case 'sepia': return 'sepia(100%)';
      case 'grayscale': return 'grayscale(100%)';
      case 'blur': return 'blur(8px)';
      case 'classic-dark': return 'brightness(0.8) contrast(1.2)';
      default: return 'none';
    }
  };

  const baixarPost = async () => {
    if (postRef.current) {
      setDownloading(true);
      try {
        const isVertical = formato === 'Vertical (9:16 - Stories/Reels)';
        const isRetrato = formato === 'Retrato (1080x1350)';
        const width = 1080;
        const height = isVertical ? 1920 : isRetrato ? 1350 : 1080;

        const dataUrl = await htmlToImage.toPng(postRef.current, { 
          cacheBust: true,
          pixelRatio: 2,
          quality: 1.0,
          canvasWidth: width,
          canvasHeight: height,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });
        const link = document.createElement('a');
        link.download = `homenagem-${post.nome_homenageado.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        alert('Ocorreu um erro ao baixar a imagem.');
      } finally {
        setDownloading(false);
      }
    }
  };

  const compartilharPost = async () => {
    if (!navigator.share) {
      alert('Compartilhamento não suportado neste navegador, use o botão Baixar.');
      return;
    }

    if (postRef.current) {
      setSharing(true);
      try {
        const isVertical = formato === 'Vertical (9:16 - Stories/Reels)';
        const isRetrato = formato === 'Retrato (1080x1350)';
        const width = 1080;
        const height = isVertical ? 1920 : isRetrato ? 1350 : 1080;

        const dataUrl = await htmlToImage.toPng(postRef.current, { 
          cacheBust: true,
          pixelRatio: 2,
          quality: 1.0,
          canvasWidth: width,
          canvasHeight: height,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });
        
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `homenagem-${post.nome_homenageado.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });

        const shareData: ShareData = {
          title: `Homenagem para ${post.nome_homenageado}`,
          text: post.mensagem_gerada,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }

        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          alert('Compartilhamento não suportado neste navegador, use o botão Baixar.');
        }
      } finally {
        setSharing(false);
      }
    }
  };

  const handleGenerateLongCaption = async () => {
    if (!additionalInfo.trim()) {
      alert('Por favor, adicione algumas informações ou memórias.');
      return;
    }
    
    setIsGeneratingLongCaption(true);
    try {
      const topic = `Homenagem de ${post.tipo_ocasiao} para ${post.nome_homenageado}`;
      const result = await generateLongCaption(
        topic,
        post.rede_social || 'Genérica',
        wordCount,
        additionalInfo
      );
      setLongCaption(result);
    } catch (error) {
      console.error('Erro ao gerar texto longo:', error);
      alert('Ocorreu um erro ao gerar o texto. Tente novamente.');
    } finally {
      setIsGeneratingLongCaption(false);
    }
  };

  const isDarkTheme = themeColor ? isColorDark(themeColor) : false;
  const dynamicTextColor = isDarkTheme ? 'text-white' : 'text-slate-800';
  const dynamicTextMuted = isDarkTheme ? 'text-white/80' : 'text-slate-600';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div className="h-4 w-px bg-slate-200"></div>
            <button 
              onClick={() => navigate('/dashboard', { state: { editPost: post } })}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Voltar para o Formulário
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">CriarteAI</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 pb-24 flex flex-col lg:flex-row gap-12 items-start justify-center">
        
        {/* Left: The Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto lg:mx-0 shrink-0"
        >
          {/* Toggle Layout (Only if image exists) */}
          {post.imagem_url && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-slate-200/50 p-1.5 rounded-xl w-fit mx-auto">
              <button
                onClick={() => setLayout('classic')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${layout === 'classic' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutTemplate className="w-4 h-4" />
                Clássico
              </button>
              <button
                onClick={() => setLayout('cover')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${layout === 'cover' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ImageIcon className="w-4 h-4" />
                Fundo
              </button>
              <button
                onClick={() => setLayout('polaroid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${layout === 'polaroid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ImageIcon className="w-4 h-4" />
                Polaroid
              </button>
              <button
                onClick={() => setLayout('split')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${layout === 'split' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutTemplate className="w-4 h-4" />
                Split
              </button>
            </div>
          )}

          {/* Toggle Formato */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-slate-200/50 p-1.5 rounded-xl w-fit mx-auto">
            <button
              onClick={() => setFormato('Quadrado (1:1 - Feed)')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${formato === 'Quadrado (1:1 - Feed)' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Quadrado
            </button>
            <button
              onClick={() => setFormato('Retrato (1080x1350)')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${formato === 'Retrato (1080x1350)' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Retrato
            </button>
            <button
              onClick={() => setFormato('Vertical (9:16 - Stories/Reels)')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${formato === 'Vertical (9:16 - Stories/Reels)' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Vertical
            </button>
          </div>

          {/* Wrapper for the image generation to ensure clean borders */}
          <div 
            className="p-4 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 w-full max-w-md mx-auto lg:mx-0"
            style={post.ia_enhancements?.borderColor ? { 
              border: `${8 * scale}px solid ${post.ia_enhancements.borderColor}`,
              borderRadius: `${2 * 16 * scale}px` 
            } : {}}
          >
            <div 
              ref={postRef} 
              className={`w-full ${formato === 'Vertical (9:16 - Stories/Reels)' ? 'aspect-[9/16]' : formato === 'Retrato (1080x1350)' ? 'aspect-[4/5]' : 'aspect-square'} rounded-3xl flex flex-col relative overflow-hidden ${
                layout === 'classic' || !post.imagem_url 
                  ? (themeColor ? '' : theme.bgGradient)
                  : layout === 'cover' ? 'bg-slate-900' : 'bg-white'
              }`}
              style={
                (layout === 'classic' || !post.imagem_url) && themeColor
                  ? { backgroundColor: themeColor }
                  : {}
              }
            >
              {/* IA Overlay */}
              {post.ia_enhancements?.overlayEmoji && (
                <div className="absolute top-4 right-4 z-20 text-4xl">
                  {post.ia_enhancements.overlayEmoji}
                </div>
              )}

              {/* Layouts */}
              {layout === 'cover' && post.imagem_url && (
                <CoverLayout 
                  post={post} theme={theme} themeColor={themeColor} scale={scale} 
                  mainText={mainText} signature={signature} imageFilter={imageFilter} 
                  getFilterStyle={getFilterStyle} dynamicTextColor={dynamicTextColor} 
                  dynamicTextMuted={dynamicTextMuted} iaEnhancements={post.ia_enhancements}
                />
              )}

              {layout === 'polaroid' && post.imagem_url && (
                <PolaroidLayout 
                  post={post} theme={theme} themeColor={themeColor} scale={scale} 
                  mainText={mainText} signature={signature} imageFilter={imageFilter} 
                  getFilterStyle={getFilterStyle} dynamicTextColor={dynamicTextColor} 
                  dynamicTextMuted={dynamicTextMuted} iaEnhancements={post.ia_enhancements}
                />
              )}

              {layout === 'split' && post.imagem_url && (
                <SplitLayout 
                  post={post} theme={theme} themeColor={themeColor} scale={scale} 
                  mainText={mainText} signature={signature} imageFilter={imageFilter} 
                  getFilterStyle={getFilterStyle} dynamicTextColor={dynamicTextColor} 
                  dynamicTextMuted={dynamicTextMuted} iaEnhancements={post.ia_enhancements}
                />
              )}

              {(layout === 'classic' || !post.imagem_url) && (
                <ClassicLayout 
                  post={post} theme={theme} themeColor={themeColor} scale={scale} 
                  mainText={mainText} signature={signature} imageFilter={imageFilter} 
                  getFilterStyle={getFilterStyle} dynamicTextColor={dynamicTextColor} 
                  dynamicTextMuted={dynamicTextMuted} iaEnhancements={post.ia_enhancements}
                />
              )}
            </div>
          </div>

          {/* Caption Area */}
          <div className="mt-6 bg-white p-6 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-indigo-500" />
                Legenda do Post
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(post.mensagem_gerada);
                  alert('Legenda copiada para a área de transferência!');
                }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copiar Legenda
              </button>
            </div>
            <textarea
              readOnly
              value={cleanText}
              className="w-full h-32 p-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none"
            />
          </div>
        </motion.div>

        {/* Right: Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm flex flex-col gap-6 pt-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Sua homenagem está pronta!</h1>
            <p className="text-slate-500">Baixe a imagem em alta qualidade para compartilhar nas suas redes sociais ou enviar diretamente.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            {post.imagem_url && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Filtro da Imagem</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setImageFilter('none')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${imageFilter === 'none' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setImageFilter('classic-dark')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${imageFilter === 'classic-dark' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Classic Dark
                  </button>
                  <button
                    onClick={() => setImageFilter('sepia')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${imageFilter === 'sepia' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setImageFilter('grayscale')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${imageFilter === 'grayscale' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Grayscale
                  </button>
                  <button
                    onClick={() => setImageFilter('blur')}
                    className={`col-span-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${imageFilter === 'blur' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Blur Background
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Cor de Destaque</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setThemeColor(preset.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden ${themeColor === preset.value ? 'border-slate-800 scale-110 shadow-md' : 'border-slate-200 hover:scale-110 shadow-sm'} ${!preset.value ? 'bg-gradient-to-tr from-indigo-100 to-purple-100' : ''}`}
                      style={preset.value ? { backgroundColor: preset.value } : {}}
                      title={preset.name}
                      aria-label={`Selecionar cor ${preset.name}`}
                    >
                      {!preset.value && <span className="text-[10px] font-bold text-slate-400">P</span>}
                    </button>
                  ))}
                  <div className="h-8 w-px bg-slate-200 mx-1"></div>
                  <div 
                    className={`w-8 h-8 rounded-full border-2 border-slate-200 shadow-sm overflow-hidden flex-shrink-0 relative ${!themeColor ? 'bg-gradient-to-tr from-indigo-100 to-purple-100' : ''}`}
                    style={themeColor ? { backgroundColor: themeColor } : {}}
                    title="Cor personalizada"
                  >
                    <input 
                      type="color" 
                      value={themeColor || '#ffffff'}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-medium transition-colors border border-indigo-200 flex items-center justify-center gap-2 shadow-sm"
              >
                <FileText className="w-5 h-5" />
                Criar História (Texto Longo)
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={baixarPost} 
                  disabled={downloading || sharing}
                  className={`flex-1 py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    downloaded 
                      ? 'bg-emerald-500 text-white shadow-emerald-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  } shadow-lg disabled:opacity-70`}
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Preparando...
                    </>
                  ) : downloaded ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Concluído!
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Baixar
                    </>
                  )}
                </button>

                <button 
                  onClick={compartilharPost} 
                  disabled={downloading || sharing}
                  className={`flex-1 py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 disabled:opacity-70`}
                >
                  {sharing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Preparando...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Compartilhar
                    </>
                  )}
                </button>
              </div>
              
              <button 
                onClick={() => navigate('/dashboard')} 
                className="w-full py-4 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-colors border border-slate-200"
              >
                Criar Nova Homenagem
              </button>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Modal de Texto Longo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm sm:p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Gerador de História
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Quantidade de palavras</label>
                <div className="flex flex-wrap gap-2">
                  {[50, 150, 300, 500].map((count) => (
                    <button
                      key={count}
                      onClick={() => setWordCount(count)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                        wordCount === count
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ~{count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Adicione detalhes especiais (memórias, etc)</label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Ex: Lembro de quando viajamos para a praia e..."
                  className="w-full min-h-[120px] p-4 text-base bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <button
                onClick={handleGenerateLongCaption}
                disabled={isGeneratingLongCaption || !additionalInfo.trim()}
                className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isGeneratingLongCaption ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando História...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Texto Extra
                  </>
                )}
              </button>

              {longCaption && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <label className="text-sm font-semibold text-slate-700">Resultado</label>
                  <div className="w-full p-4 text-base text-slate-700 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap">
                    {longCaption}
                  </div>
                </div>
              )}
            </div>

            {longCaption && (
              <div className="p-6 border-t border-slate-100 shrink-0 bg-white">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(longCaption);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className={`w-full py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isCopied
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copiar História
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
