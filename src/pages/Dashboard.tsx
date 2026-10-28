import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { generatePostMessage } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { uploadImage, savePost, saveUpload, getPostsByUser, deletePost, updatePost } from '../services/dbService';
import { Post } from '../types';
import { motion } from 'motion/react';
import imageCompression from 'browser-image-compression';
import { Sparkles, User, Calendar, Palette, Image as ImageIcon, Loader2, LogOut, CheckCircle2, HeartHandshake, PenTool, History, Clock, ChevronRight, Trash2, MessageSquare, Users, Smartphone, LayoutTemplate, Plus, Settings, ShieldCheck } from 'lucide-react';
import { HomenagemStepper } from '../components/HomenagemStepper';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { HistorySkeleton } from '../components/Skeleton';

export default function Dashboard() {
  const [nome, setNome] = useState('');
  const [ocasiao, setOcasiao] = useState('');
  const [estilo, setEstilo] = useState('');
  const [autorNome, setAutorNome] = useState('');
  const [autorRelacao, setAutorRelacao] = useState('');
  const [grauIntimidade, setGrauIntimidade] = useState('');
  const [redeSocial, setRedeSocial] = useState('Genérica');
  const [formatoPost, setFormatoPost] = useState('Quadrado (1:1 - Feed)');
  const [instrucoesAdicionais, setInstrucoesAdicionais] = useState('');
  const [usarTextoComoLegenda, setUsarTextoComoLegenda] = useState(false);
  const [imagem, setImagem] = useState<File | null>(null);
  const [opcoesMensagem, setOpcoesMensagem] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<Post[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isStepperOpen, setIsStepperOpen] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'criar' | 'historico'>('criar');
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil:', error);
        } else {
          console.log('Perfil carregado:', data);
          setProfile(data);
        }
      } else {
        console.warn('Usuário não autenticado');
      }
    }
    fetchProfile();
  }, []);

  const grausIntimidade = [
    "Amigo Próximo",
    "Familiar",
    "Colega de Trabalho",
    "Conhecido"
  ];

  const estilosMensagem = [
    "Acolhedor",
    "Agradecimento",
    "Alegre",
    "Amigável",
    "Apaixonado",
    "Carinhoso",
    "Clássico",
    "Descontraído",
    "Divertido",
    "Dramático",
    "Emocionante",
    "Engraçado",
    "Esperançoso",
    "Espiritual",
    "Formal",
    "Incentivador",
    "Inspirador",
    "Irreverente",
    "Luto",
    "Melancólico",
    "Minimalista",
    "Moderno",
    "Motivacional",
    "Nostálgico",
    "Poético",
    "Profissional",
    "Reflexivo",
    "Religioso",
    "Respeitoso",
    "Reverente",
    "Romântico",
    "Saudade",
    "Sincero",
    "Tristeza",
    "Épico"
  ];

  const redesSociais = [
    'Genérica', 'Instagram', 'WhatsApp', 'Facebook', 'LinkedIn', 'Tik Tok'
  ];

  const formatos = [
    'Quadrado (1:1 - Feed)', 'Vertical (9:16 - Stories/Reels)', 'Retrato (1080x1350)'
  ];

  useEffect(() => {
    let mounted = true;

    const fetchHistorico = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const posts = await getPostsByUser(session.user.id);
          if (mounted) {
            setHistorico(posts || []);
          }
        }
      } catch (error) {
        if (mounted) console.error('Erro ao buscar histórico:', error);
      } finally {
        if (mounted) setLoadingHistorico(false);
      }
    };

    fetchHistorico();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGerarOpcoes = async () => {
    if (!nome || !ocasiao) {
      setToast({ message: 'Preencha pelo menos "Para quem" e "Ocasião" para identificar a homenagem.', type: 'error' });
      return;
    }

    if (usarTextoComoLegenda) {
      if (!instrucoesAdicionais.trim()) {
        setToast({ message: 'Digite o texto que deseja usar como legenda.', type: 'error' });
        return;
      }
      setOpcoesMensagem([instrucoesAdicionais]);
      return;
    }

    if (!autorNome || !autorRelacao || !grauIntimidade) {
      setToast({ message: 'Preencha os campos obrigatórios (Seu Nome, Sua Relação e Grau de Intimidade).', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      let topic = `Escreva uma homenagem para ${nome} na ocasião de ${ocasiao} no estilo ${estilo || 'livre'}. A mensagem está sendo escrita por ${autorNome}, que é ${autorRelacao} da pessoa homenageada. Grau de intimidade: ${grauIntimidade}. É OBRIGATÓRIO incluir uma assinatura no final da mensagem dizendo exatamente algo como "Com amor, seu(sua) ${autorRelacao}, ${autorNome}" ou variação similar que faça sentido.`;
      
      if (instrucoesAdicionais.trim()) {
        topic += `\n\nInstruções adicionais do usuário: ${instrucoesAdicionais}`;
      }

      const mensagens = await generatePostMessage(topic, redeSocial);
      setOpcoesMensagem(mensagens);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'Erro ao gerar opções de post';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarMensagem = async (mensagemSelecionada: string, saveAsNew: boolean = false) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let imageUrl = editingPost?.imagem_url || '';
      if (imagem) {
        let compressedImage = imagem;
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1080,
            useWebWorker: true,
          };
          compressedImage = await imageCompression(imagem, options);
        } catch (error) {
          console.error('Erro ao comprimir imagem:', error);
        }
        
        imageUrl = await uploadImage(compressedImage, user.id);
        await saveUpload({ user_id: user.id, file_url: imageUrl });
      }

      const postData = {
        user_id: user.id,
        nome_homenageado: nome,
        tipo_ocasiao: ocasiao,
        estilo: estilo,
        mensagem_gerada: mensagemSelecionada,
        imagem_url: imageUrl,
        grau_intimidade: grauIntimidade,
        rede_social: redeSocial,
        formato_post: formatoPost,
      };
      
      let savedPost;
      if (editingPost && !saveAsNew) {
        if (!editingPost.id) throw new Error('ID do post não encontrado');
        savedPost = await updatePost(editingPost.id, postData);
        setHistorico(prev => prev.map(p => p.id === editingPost.id ? savedPost : p));
        setToast({ message: 'Post atualizado com sucesso!', type: 'success' });
      } else {
        savedPost = await savePost(postData);
        setHistorico(prev => [savedPost, ...prev]);
        setToast({ message: 'Post salvo com sucesso!', type: 'success' });
      }
      
      setEditingPost(null);
      navigate('/resultado', { state: { post: savedPost } });
      
    } catch (error) {
      console.error(error);
      setToast({ message: 'Erro ao salvar post', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setPostToDelete(postId);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      await deletePost(postToDelete);
      setHistorico(prev => prev.filter(post => post.id !== postToDelete));
      setToast({ message: 'Post excluído com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      setToast({ message: 'Erro ao excluir post', type: 'error' });
    } finally {
      setPostToDelete(null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    navigate('/resultado', { state: { post } });
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.editPost) {
      const post = location.state.editPost;
      setNome(post.nome_homenageado);
      setOcasiao(post.tipo_ocasiao);
      setEstilo(post.estilo || '');
      setInstrucoesAdicionais(post.mensagem_gerada);
      setGrauIntimidade(post.grau_intimidade || '');
      setRedeSocial(post.rede_social || 'Genérica');
      setFormatoPost(post.formato_post || 'Quadrado (1:1 - Feed)');
      setUsarTextoComoLegenda(true);
      setEditingPost(post);
      setOpcoesMensagem([]);
      setActiveTab('criar');
      setIsStepperOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Limpa o state para não ficar preso no modo edição se recarregar a página
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-slate-900/10"></div>
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-200/20 blur-[90px]"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">CriarteAI</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Sair
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('criar')}
            className={`pb-4 font-bold text-lg transition-colors ${activeTab === 'criar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Criar Homenagem
          </button>
          <button 
            onClick={() => {
              setActiveTab('historico');
              // Força a recarga do histórico ao clicar na aba
              const fetchHistorico = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  const posts = await getPostsByUser(session.user.id);
                  setHistorico(posts || []);
                }
              };
              fetchHistorico();
            }}
            className={`pb-4 font-bold text-lg transition-colors ${activeTab === 'historico' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Seu Histórico
          </button>
        </div>

        <UserSettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)} 
        />

        {activeTab === 'criar' && (
          <>
            {editingPost && (
              <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PenTool className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Você está editando um post existente. As informações foram carregadas abaixo.</span>
                </div>
                <button 
                  onClick={() => {
                    setEditingPost(null);
                    setNome('');
                    setOcasiao('');
                    setEstilo('');
                    setAutorNome('');
                    setAutorRelacao('');
                    setGrauIntimidade('');
                    setRedeSocial('Genérica');
                    setFormatoPost('Quadrado (1:1 - Feed)');
                    setInstrucoesAdicionais('');
                    setUsarTextoComoLegenda(false);
                    setOpcoesMensagem([]);
                  }}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
                >
                  Cancelar Edição
                </button>
              </div>
            )}

            <div className="mb-10 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Criar nova homenagem</h1>
                <p className="text-slate-500 mt-2">Preencha os detalhes abaixo e deixe a IA fazer a mágica.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsStepperOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm shadow-indigo-200"
                >
                  <Plus className="w-5 h-5" /> Nova Homenagem
                </button>
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                >
                  <Settings className="w-5 h-5" /> Configurações
                </button>
              </div>
            </div>
            
            {profile?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="mb-6 flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-xl border-2 border-indigo-500 shadow-lg hover:scale-[1.02] transition-transform"
              >
                <ShieldCheck size={20} className="text-indigo-400" />
                <span className="font-bold">Painel de Gestão CriarteAI</span>
              </Link>
            )}
            
            <HomenagemStepper 
              isOpen={isStepperOpen} 
              onClose={() => setIsStepperOpen(false)} 
              onNavigateToForm={() => setIsStepperOpen(false)}
              onNavigateToSettings={() => {
                setIsStepperOpen(false);
                setIsSettingsModalOpen(true);
              }}
              onViewHistory={() => {
                setIsStepperOpen(false);
                setActiveTab('historico');
              }}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Form Section */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 space-y-6 pb-20">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Para quem é a homenagem?</label>
                    <input 
                      type="text" 
                      value={nome} 
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Nome da pessoa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ocasião</label>
                    <input 
                      type="text" 
                      value={ocasiao} 
                      onChange={(e) => setOcasiao(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Ex: Aniversário, Casamento..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estilo da Mensagem</label>
                    <select 
                      value={estilo} 
                      onChange={(e) => setEstilo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                    >
                      <option value="">Selecione um estilo</option>
                      {estilosMensagem.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="usarTexto"
                      checked={usarTextoComoLegenda}
                      onChange={(e) => setUsarTextoComoLegenda(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="usarTexto" className="text-sm text-slate-600">Já tenho um texto/legenda</label>
                  </div>
                  {!usarTextoComoLegenda && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Seu Nome</label>
                        <input 
                          type="text" 
                          value={autorNome} 
                          onChange={(e) => setAutorNome(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Seu nome"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sua Relação</label>
                        <input 
                          type="text" 
                          value={autorRelacao} 
                          onChange={(e) => setAutorRelacao(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Ex: Filho, Amigo, Esposo(a)..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Grau de Intimidade</label>
                        <select 
                          value={grauIntimidade} 
                          onChange={(e) => setGrauIntimidade(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                        >
                          <option value="">Selecione</option>
                          {grausIntimidade.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Imagem para o Post</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImagem(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rede Social</label>
                    <select 
                      value={redeSocial} 
                      onChange={(e) => setRedeSocial(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                    >
                      {redesSociais.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Formato do Post</label>
                    <select 
                      value={formatoPost} 
                      onChange={(e) => setFormatoPost(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                    >
                      {formatos.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Instruções Adicionais</label>
                    <textarea 
                      value={instrucoesAdicionais} 
                      onChange={(e) => setInstrucoesAdicionais(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      rows={4}
                      placeholder="Detalhes especiais, memórias..."
                    />
                  </div>
                  <button 
                    onClick={handleGerarOpcoes}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {loading ? 'Gerando...' : 'Gerar Homenagens'}
                  </button>
                </div>
              </div>

              {/* Results Section */}
              <div className="lg:col-span-7">
                {opcoesMensagem.length > 0 ? (
                  <div className="space-y-6">
                    {opcoesMensagem.map((msg, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100">
                        <p className="text-slate-700 whitespace-pre-wrap mb-6">{msg}</p>
                        <button 
                          onClick={() => handleSelecionarMensagem(msg)}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors"
                        >
                          Usar esta mensagem
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">As homenagens aparecerão aqui</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">Preencha o formulário ao lado e clique em "Gerar Homenagens" para ver as opções criadas pela IA.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'historico' && (
          <div id="historico" className="mt-8">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Seu Histórico</h2>
            </div>
            
            {loadingHistorico ? (
              <HistorySkeleton />
            ) : historico.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historico.map((post) => (
                  <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        {post.tipo_ocasiao}
                      </span>
                      <button onClick={(e) => handleDeleteClick(e, post.id!)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-slate-900">{post.nome_homenageado}</h3>
                    <p className="text-sm text-slate-500 line-clamp-3 flex-1">{post.mensagem_gerada}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button onClick={(e) => handleEditClick(e, post)} className="text-sm font-medium text-slate-600 hover:text-indigo-600">
                        Editar
                      </button>
                      <button onClick={() => navigate('/resultado', { state: { post } })} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Nenhum post gerado ainda</h3>
                <p className="text-slate-500 mt-1">Seus posts salvos aparecerão aqui.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Custom Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
            toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
          }`}>
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 text-lg leading-none">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir post?</h3>
            <p className="text-slate-500 mb-6">Esta ação não pode ser desfeita. O post será removido permanentemente do seu histórico.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
