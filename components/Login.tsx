import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // 'Lock' e 'Sparkles' removidos
// import { Psychologist } from '../types'; // Mantido para tipagem, mas não usado para login

interface LoginProps {
  onLoginSuccess: () => void;
  // onFirstAccess e onForgotPassword são opcionais agora, pois não são usados no fluxo de login local
  // onFirstAccess?: (psychologist: Psychologist) => void;
  // onForgotPassword?: (psychologist: Psychologist) => void;
}

// Senha master local fixa
const LOCAL_MASTER_PASSWORD = '05081979';

// Novo URL do logo
const NEW_LOGO_URL = 'https://i.postimg.cc/qzhtyZwF/LOGO-1.png';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!senha) {
      setError('Por favor, digite a senha');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      if (senha === LOCAL_MASTER_PASSWORD) {
        onLoginSuccess();
      } else {
        setError('Senha master incorreta');
      }
      setLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="relative inline-block">
            {/* O logo agora ocupa mais espaço e é o foco */}
            <img
              src={NEW_LOGO_URL} // Usando o URL do logo que você forneceu
              alt="Mind Corps Analytics Logo"
              className="w-64 h-64 mx-auto mb-6 drop-shadow-2xl relative z-10 object-contain" // Ajustado para 64x64 (256px) para destaque
            />
          </div>
          {/* REMOVIDO: Título e subtítulo */}
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl shadow-blue-500/10">
          {/* REMOVIDO: Ícone de cadeado */}
          <h2 className="text-2xl font-bold text-white text-center mb-6">Acesso Restrito</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-cyan-300/80 mb-2">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua senha master"
                className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 pr-12 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          <button
            onClick={() => { /* Lógica para recuperação de senha local, se necessário */ }}
            className="w-full text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            Esqueci minha senha
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 Mind Corps Analytics. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;