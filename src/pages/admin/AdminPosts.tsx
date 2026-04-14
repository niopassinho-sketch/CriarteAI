import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Loader2, Trash2, Eye, X } from 'lucide-react';

export const AdminPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    
    // 1. Busca todos os posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, user_id, nome_homenageado, tipo_ocasiao, estilo, mensagem_gerada, imagem_url, created_at');
    
    // 2. Busca todos os perfis
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name');

    if (postsError || profilesError) {
      console.error('Erro ao buscar dados:', postsError || profilesError);
      setLoading(false);
      return;
    }

    // 3. Cria um mapa de perfis para facilitar a busca pelo ID
    const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
      acc[profile.id] = profile.name;
      return acc;
    }, {});

    // 4. Combina os dados
    const postsWithProfiles = (postsData || []).map(post => ({
      ...post,
      userName: profilesMap[post.user_id] || 'Desconhecido'
    }));

    setPosts(postsWithProfiles);
    setLoading(false);
  };

  const deletePost = async () => {
    if (!postToDelete) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postToDelete);
    
    if (error) {
      console.error('Erro ao excluir post:', error);
      alert('Erro ao excluir post. Verifique se não existem dados relacionados (como likes ou comentários) que impedem a exclusão.');
    } else {
      fetchPosts();
    }
    setPostToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C63FF]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Gestão de Posts</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Usuário</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap">Homenageado</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Ocasião</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Mensagem</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Imagem</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Data</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map(post => (
              <tr key={post.id}>
                <td className="px-4 py-3 text-slate-900 font-medium whitespace-nowrap">{post.userName}</td>
                <td className="px-4 py-3 text-slate-900 font-medium whitespace-nowrap">{post.nome_homenageado}</td>
                <td className="px-4 py-3 text-slate-600">{post.tipo_ocasiao}</td>
                <td className="px-4 py-3 text-slate-600">
                  <button 
                    onClick={() => setSelectedMessage(post.mensagem_gerada)}
                    className="text-[#6C63FF] hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Eye size={16} /> Ver
                  </button>
                </td>
                <td className="px-4 py-3">
                  {post.imagem_url ? (
                    <button onClick={() => setSelectedImage(post.imagem_url)}>
                      <img src={post.imagem_url} alt="Post" className="w-12 h-12 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs">Sem imagem</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{new Date(post.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => setPostToDelete(post.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {postToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
            <p className="text-slate-600 mb-6">Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPostToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={deletePost} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
            <button onClick={() => setSelectedMessage(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h3 className="text-lg font-bold mb-4">Mensagem</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage}</p>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Post ampliado" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};