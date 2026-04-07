import React, { useState, useEffect } from 'react';
import { X, User, Bell, Shield, LogOut, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { deleteUserAccount } from '../services/dbService';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        setUserId(user.id);
      }
    };
    if (isOpen) {
      getUser();
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setIsDeleting(true);
    try {
      await deleteUserAccount(userId);
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Ocorreu um erro ao tentar excluir sua conta. Tente novamente.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#050810] rounded-2xl shadow-2xl overflow-hidden border border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Perfil
            </h3>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-slate-300">
              <p>Email: {userEmail || 'Carregando...'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> Legal
            </h3>
            <Link 
              to="/privacidade" 
              onClick={onClose}
              className="w-full p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-left flex items-center justify-between"
            >
              <span>Política de Privacidade</span>
              <FileText className="w-4 h-4 text-slate-500" />
            </Link>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Zona de Perigo
            </h3>
            
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-left flex items-center justify-between"
              >
                <span>Excluir minha conta e dados</span>
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 space-y-4">
                <p className="text-sm text-red-300">
                  <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus posts, imagens e dados serão apagados permanentemente.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Excluindo...' : 'Sim, excluir tudo'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
