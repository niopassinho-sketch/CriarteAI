// src/components/AdminRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient'; 
import { Navigate } from 'react-router-dom';

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      // 1. Pega o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // 2. Consulta o 'role' na tabela profiles 
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data?.role !== 'admin') {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, []);

  // Enquanto verifica, não mostra nada (ou um spinner)
  if (isAdmin === null) return <div className="flex h-screen items-center justify-center">Carregando permissões...</div>;

  // Se for admin, renderiza o conteúdo. Se não, joga para o login ou home.
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};