export interface Post {
  id?: string;
  user_id: string;
  nome_homenageado: string;
  tipo_ocasiao: string;
  estilo: string;
  mensagem_gerada: string;
  imagem_url: string;
  cor_tema?: string;
  grau_intimidade?: string;
  rede_social?: string;
  formato_post?: string;
  ia_enhancements?: any;
  created_at?: string;
}

export interface Upload {
  id?: string;
  user_id: string;
  file_url: string;
  created_at?: string;
}
