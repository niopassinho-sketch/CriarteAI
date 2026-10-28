import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, History, Settings, FileText, Sparkles, Loader2, ImageIcon } from 'lucide-react';
import { AIImageEnhancer } from './AIImageEnhancer';
import { generatePostMessage } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { uploadImage, savePost, saveUpload } from '../services/dbService';
import imageCompression from 'browser-image-compression';

interface HomenagemStepperProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToForm: () => void;
  onViewHistory?: () => void;
  onNavigateToSettings: () => void;
}

export const HomenagemStepper: React.FC<HomenagemStepperProps> = ({ isOpen, onClose, onNavigateToForm, onViewHistory, onNavigateToSettings }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    nome: '', 
    ocasiao: '', 
    autorNome: '',
    autorRelacao: '',
    proximidade: 'Amigo Próximo', 
    rede_social: 'Genérica',
    formato_post: 'Quadrado (1:1 - Feed)',
    estilo: 'Acolhedor',
    instrucoes: '',
    usarTextoComoLegenda: false,
    imagem: null as File | null
  });

  const [opcoes, setOpcoes] = useState<string[]>([]);
  const [iaEnhancements, setIaEnhancements] = useState<any>(null);

  if (!isOpen) return null;

  const steps = [
    { title: 'Quem iremos homenagear hoje?', field: 'nome', type: 'text' },
    { title: 'Qual a ocasião dessa comemoração?', field: 'ocasiao', type: 'text' },
    { title: 'Sobre você (assinatura)', field: 'assinatura', type: 'assinatura' },
    { title: 'Qual o estilo da mensagem?', field: 'estilo', type: 'select', options: ['Acolhedor', 'Agradecimento', 'Alegre', 'Amigável', 'Apaixonado', 'Carinhoso', 'Clássico', 'Descontraído', 'Divertido', 'Dramático', 'Emocionante', 'Engraçado', 'Esperançoso', 'Espiritual', 'Formal', 'Incentivador', 'Inspirador', 'Irreverente', 'Luto', 'Melancólico', 'Minimalista', 'Moderno', 'Motivacional', 'Nostálgico', 'Poético', 'Profissional', 'Reflexivo', 'Religioso', 'Respeitoso', 'Reverente', 'Romântico', 'Saudade', 'Sincero', 'Tristeza', 'Épico'] },
    { title: 'Adicione uma foto e instruções para a IA', field: 'instrucoes', type: 'final' },
    { title: 'Escolha a legenda ideal', field: 'opcoes', type: 'opcoes' },
  ];

  const handleFinalize = async (mensagemSelecionada: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let imageUrl = '';
      if (data.imagem) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1080, useWebWorker: true };
        const compressedImage = await imageCompression(data.imagem, options);
        imageUrl = await uploadImage(compressedImage, user.id);
        await saveUpload({ user_id: user.id, file_url: imageUrl });
      }

      // Se não for texto próprio, anexa a assinatura se ainda não estiver presente
      let mensagemFinal = mensagemSelecionada;
      if (!data.usarTextoComoLegenda && !mensagemFinal.includes(data.autorNome)) {
        mensagemFinal += `\n\nAtenciosamente,\n${data.autorNome} (${data.autorRelacao})`;
      }

      const postData = {
        user_id: user.id,
        nome_homenageado: data.nome,
        tipo_ocasiao: data.ocasiao,
        estilo: data.estilo,
        mensagem_gerada: mensagemFinal,
        imagem_url: imageUrl,
        grau_intimidade: data.proximidade,
        rede_social: data.rede_social,
        formato_post: data.formato_post,
        ia_enhancements: iaEnhancements,
      };
      
      const savedPost = await savePost(postData);
      navigate('/resultado', { state: { post: savedPost } });
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar post: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleGerarOpcoes = async () => {
    if (data.usarTextoComoLegenda) {
      setOpcoes([data.instrucoes]);
      setStep(5);
      return;
    }

    setLoading(true);
    try {
      const topic = `Escreva uma homenagem para ${data.nome} na ocasião de Feliz ${data.ocasiao} no estilo ${data.estilo}. Grau de intimidade: ${data.proximidade}. Assinado por ${data.autorNome}, que é ${data.autorRelacao} do homenageado. Instruções adicionais: ${data.instrucoes}. IMPORTANTE: NÃO inclua o nome do homenageado na legenda, apenas a mensagem e a assinatura.`;
      const mensagens = await generatePostMessage(topic, data.rede_social);
      setOpcoes(mensagens);
      setStep(5); // Vai para o passo de escolha
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < steps.length - 2) {
      setStep(prev => prev + 1);
    } else if (step === steps.length - 2) {
      handleGerarOpcoes();
    }
  };
  const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#050810] rounded-2xl shadow-2xl overflow-y-auto border border-slate-800 pb-24 max-h-[90vh]">
        
        {/* Background Decorations */}
        <div className="absolute inset-0 z-0">
          {/* Base Radial Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a2644,_#050810)]" />
          
          {/* Texture: Horizontal Lines */}
          <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(transparent_0px,transparent_2px,#ffffff_3px,transparent_4px)]" />
          
          {/* Chevron Top Left */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-cyan-500/10 rotate-45 transform" />
          
          {/* Chevron Top Right */}
          <div className="absolute -top-16 -right-16 w-48 h-48 border-2 border-blue-900/30 rotate-45 transform" />
          
          {/* Lens Flare */}
          <div className="absolute top-1/4 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
          <h2 className="text-2xl font-bold text-white mb-6">{steps[step].title}</h2>
          
          {step === 0 ? (
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={data.nome}
                onChange={(e) => setData({...data, nome: e.target.value})}
                placeholder="Nome do homenageado"
                className="w-full p-4 mb-2 text-lg bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-500"
              />
              <button onClick={handleNext} className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Continuar</button>
              <button onClick={onViewHistory} className="flex items-center justify-center gap-2 p-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                <History className="w-5 h-5" /> Ver histórico
              </button>
              <button onClick={onNavigateToSettings} className="flex items-center justify-center gap-2 p-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5" /> Configurações
              </button>
              <button 
                onClick={onNavigateToForm}
                className="flex items-center justify-center gap-2 p-3 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <FileText className="w-5 h-5" /> Ir para modo formulário
              </button>
              <button onClick={onClose} className="p-3 text-slate-500 hover:text-slate-300 transition-colors">
                Cancelar
              </button>
            </div>
          ) : step === 5 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {opcoes.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleFinalize(opt)}
                  disabled={loading}
                  className="w-full text-left p-4 bg-slate-900/50 border border-slate-700 hover:border-indigo-500 rounded-xl text-slate-200 text-sm transition-all group"
                >
                  <p className="line-clamp-4 group-hover:line-clamp-none transition-all">{opt}</p>
                  <div className="mt-3 flex items-center gap-2 text-indigo-400 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Selecionar esta opção
                  </div>
                </button>
              ))}
              <button 
                onClick={handleBack} 
                className="w-full p-3 text-slate-500 hover:text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar e ajustar
              </button>
            </div>
          ) : step === 4 ? (
            <div className="space-y-4">
              <input 
                type="file" 
                id="file-upload"
                className="hidden"
                onChange={(e) => setData({...data, imagem: e.target.files?.[0] || null})} 
              />
              {data.imagem ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-700">
                    <img 
                      src={URL.createObjectURL(data.imagem)} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => setData({...data, imagem: null})}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <AIImageEnhancer 
                    imageFile={data.imagem} 
                    onEnhancementComplete={setIaEnhancements}
                  />
                </div>
              ) : (
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-800 transition-colors">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-500" />
                  <p className="text-sm text-slate-400">Clique para selecionar uma foto</p>
                </label>
              )}
              <textarea 
                placeholder="Instruções para a IA..."
                value={data.instrucoes}
                onChange={(e) => setData({...data, instrucoes: e.target.value})}
                rows={4}
                className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-xl placeholder:text-slate-500"
              />
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input 
                  type="checkbox" 
                  checked={data.usarTextoComoLegenda}
                  onChange={(e) => setData({...data, usarTextoComoLegenda: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">Usar meu texto como legenda</span>
              </label>
              <div className="flex justify-between items-center">
                <button onClick={handleBack} className="p-3 text-slate-500 hover:text-white"><ChevronLeft /></button>
                <button onClick={handleNext} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium flex items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? 'Gerando...' : 'Gerar Opções'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {steps[step].type === 'text' && <input type="text" value={String(data[steps[step].field as keyof typeof data] ?? '')} onChange={(e) => setData({...data, [steps[step].field]: e.target.value})} className="w-full p-4 mb-6 bg-slate-900/50 border border-slate-700 text-white rounded-xl placeholder:text-slate-500" />}
              {steps[step].type === 'select' && <select value={String(data[steps[step].field as keyof typeof data] ?? '')} onChange={(e) => setData({...data, [steps[step].field]: e.target.value})} className="w-full p-4 mb-6 bg-slate-900/50 border border-slate-700 text-white rounded-xl"><option value="">Selecione...</option>{steps[step].options?.map(o => <option key={o} value={o}>{o}</option>)}</select>}
              {steps[step].type === 'assinatura' && (
                <div className="space-y-4">
                  <input type="text" placeholder="Seu nome" value={data.autorNome} onChange={(e) => setData({...data, autorNome: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-xl placeholder:text-slate-500" />
                  <input type="text" placeholder="Sua relação com a pessoa" value={data.autorRelacao} onChange={(e) => setData({...data, autorRelacao: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-xl placeholder:text-slate-500" />
                  <select value={data.proximidade} onChange={(e) => setData({...data, proximidade: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-xl">
                    {['Amigo Próximo', 'Familiar', 'Colega de Trabalho', 'Conhecido'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <select value={data.rede_social} onChange={(e) => setData({...data, rede_social: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-xl">
                    {['Genérica', 'Instagram', 'WhatsApp', 'Facebook', 'LinkedIn', 'Tik Tok'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <select value={data.formato_post} onChange={(e) => setData({...data, formato_post: e.target.value})} className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-xl">
                    {['Quadrado (1:1 - Feed)', 'Vertical (9:16 - Stories/Reels)', 'Retrato (1080x1350)'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
              <div className="flex justify-between items-center">
                <button onClick={handleBack} className="p-3 text-slate-500 hover:text-white"><ChevronLeft /></button>
                <button onClick={handleNext} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium">Continuar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
