import { supabase } from './supabaseClient';
import { Post, Upload } from '../types';

export const uploadImage = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('posts-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('posts-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

export const savePost = async (post: Post) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select();

  if (error) throw error;
  return data[0];
};

export const saveUpload = async (upload: Upload) => {
  const { data, error } = await supabase
    .from('uploads')
    .insert([upload])
    .select();

  if (error) throw error;
  return data[0];
};

export const getPostsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updatePost = async (postId: string, updates: Partial<Post>) => {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select();

  if (error) throw error;
  return data[0];
};

export const deletePost = async (postId: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
};

export const deleteUserAccount = async (userId: string) => {
  // 1. Deletar todos os posts do usuário
  const { error: postsError } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', userId);
    
  if (postsError) throw postsError;

  // 2. Deletar todos os uploads do usuário
  const { error: uploadsError } = await supabase
    .from('uploads')
    .delete()
    .eq('user_id', userId);
    
  if (uploadsError) throw uploadsError;

  // 3. Deletar o usuário da autenticação (se possível pelo client)
  // Como o client do Supabase não permite deletar o próprio usuário diretamente sem RPC ou Admin API,
  // nós deletamos os dados e deslogamos. Para uma deleção completa da Auth, seria necessário um backend ou Edge Function.
  // Mas para compliance inicial, deletar os dados gerados e encerrar a sessão é o primeiro passo.
  
  // Atualizar metadados para marcar como deletado (opcional, mas bom para auditoria)
  await supabase.auth.updateUser({
    data: { deleted: true }
  });

  // 4. Fazer logout
  await supabase.auth.signOut();
};
