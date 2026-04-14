import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Search, Shield, User as UserIcon, MoreVertical, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  role: 'admin' | 'user';
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null); // Menu de ações

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles_with_email')
      .select('id, name, email, avatar_url, created_at, role');
    
    if (error) {
      console.error('Erro ao buscar usuários:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const updateRole = async (id: string, newRole: 'admin' | 'user') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      alert(`Erro ao atualizar papel do usuário: ${error.message}`);
    } else {
      fetchUsers();
      setActiveMenu(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('Erro ao excluir usuário. Verifique as permissões.');
    } else {
      fetchUsers();
      setActiveMenu(null);
    }
  };

  // ... (restante do código)
  // No render, adicionar coluna Email e Menu de Ações
  // <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Email</th>
  // ...
  // <td className="px-6 py-4 text-slate-600">{user.email}</td>
  // ...
  // <td className="px-6 py-4 text-right relative">
  //   <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} className="p-2 hover:bg-slate-100 rounded-lg">
  //     <MoreVertical size={18} />
  //   </button>
  //   {activeMenu === user.id && (
  //     <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-10">
  //       <button onClick={() => updateRole(user.id, user.role === 'admin' ? 'user' : 'admin')} className="block w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">
  //         Tornar {user.role === 'admin' ? 'Usuário' : 'Admin'}
  //       </button>
  //       <button onClick={() => deleteUser(user.id)} className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm">
  //         Excluir Usuário
  //       </button>
  //     </div>
  //   )}
  // </td>

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Gestão de Usuários</h1>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Usuário</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Data de Cadastro</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Role</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + user.name} alt={user.name} className="w-10 h-10 rounded-full" />
                  <span className="font-medium text-slate-900">{user.name}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4 text-slate-600">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <MoreVertical size={18} />
                  </button>
                  {activeMenu === user.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-10">
                      <button onClick={() => updateRole(user.id, user.role === 'admin' ? 'user' : 'admin')} className="block w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">
                        Tornar {user.role === 'admin' ? 'Usuário' : 'Admin'}
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm">
                        Excluir Usuário
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + user.name} alt={user.name} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{formatDate(user.created_at)} • {user.role}</p>
              </div>
            </div>
            <button onClick={() => updateRole(user.id, user.role === 'admin' ? 'user' : 'admin')} className="p-2 hover:bg-slate-100 rounded-lg">
              <MoreVertical size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
