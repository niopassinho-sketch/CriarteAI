import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Privacidade</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Política de Privacidade</h1>
          <p className="text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">1. Coleta de Dados</h2>
            <p className="text-slate-600 mb-4">
              O CriarteAI coleta as seguintes informações para fornecer seus serviços:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Dados de Autenticação:</strong> Endereço de e-mail e nome fornecidos durante o login.</li>
              <li><strong>Conteúdo Gerado:</strong> Textos, prompts e imagens que você envia para aprimoramento ou criação de homenagens.</li>
              <li><strong>Dados de Uso:</strong> Informações sobre como você interage com o aplicativo para melhorias contínuas.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">2. Uso das Informações</h2>
            <p className="text-slate-600 mb-4">
              Utilizamos seus dados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Gerar textos e aprimorar imagens utilizando Inteligência Artificial (Google Gemini).</li>
              <li>Salvar seu histórico de criações para que você possa acessá-lo posteriormente.</li>
              <li>Melhorar a experiência e estabilidade do aplicativo.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">3. Compartilhamento de Dados</h2>
            <p className="text-slate-600 mb-4">
              Seus dados não são vendidos a terceiros. Compartilhamos dados estritamente necessários com:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Google Gemini:</strong> Para processamento de linguagem natural e aprimoramento de imagens.</li>
              <li><strong>Supabase:</strong> Para armazenamento seguro do seu histórico e imagens (banco de dados e storage).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">4. Exclusão de Dados e Conta</h2>
            <p className="text-slate-600 mb-4">
              Você tem o direito de solicitar a exclusão completa dos seus dados a qualquer momento.
            </p>
            <p className="text-slate-600 mb-4">
              Para excluir sua conta e todos os dados associados (histórico, imagens e perfil), acesse o menu <strong>Configurações</strong> dentro do aplicativo e clique em <strong>Excluir Conta</strong>. Esta ação é irreversível.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">5. Contato</h2>
            <p className="text-slate-600">
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato através do e-mail de suporte.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
