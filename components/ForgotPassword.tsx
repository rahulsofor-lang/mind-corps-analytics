import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Check, Shield } from 'lucide-react';
import { resetPassword } from '../services/firebaseService';
import { Psychologist } from '../types';
import { LOGO_URL } from '../constants';

interface ForgotPasswordProps {
  psychologist: Psychologist;
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ psychologist, onBack, onSuccess }) => {
  const [registroCRP, setRegistroCRP] = useState('');
  const [resposta, setResposta] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!registroCRP) {
      setError('Por favor, digite o número do CRP');
      return;
    }

    if (!resposta.trim()) {
      setError('Por favor, responda a pergunta de segurança');
      return;
    }

    if (!novaSenha || !confirmarSenha) {
      setError('Por favor, preencha todos os campos de senha');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não correspondem');
      return;
    }

    setLoading(true);

    try {
      const success = await resetPassword(registroCRP, resposta, novaSenha);
      if (success) {
        onSuccess();
      } else {
        setError('CRP ou resposta incorretos. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <img
            src={LOGO_URL}
            alt="Mind Corps Analytics"
            className="w-32 h-32 mx-auto mb-4 drop-shadow-2xl"
          />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 mb-2">
            Recuperar Senha
          </h1>
          <p className="text-cyan-300/70">Responda a pergunta de segurança para redefinir sua senha</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl shadow-blue-500/10">
          <div className="mb-6">
            <label className="block text-sm font-medium text-cyan-300/80 mb-2">
              Número de Registro CRP
            </label>
            <input
              type="text"
              value={registroCRP}
              onChange={(e) => setRegistroCRP(e.target.value)}
              placeholder="Ex: 12.345, 12-345, 12/345 ou 12345"
              className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Pergunta de Segurança</h3>
            </div>
            <label className="block text-sm font-medium text-cyan-300/80 mb-2">
              {psychologist.perguntaSeguranca || "Pergunta não configurada"}
            </label>
            <input
              type="text"
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              placeholder="Digite sua resposta"
              className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-cyan-300/80 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showNovaSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-cyan-300/80 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmarSenha ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme sua nova senha"
                className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {showConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Redefinindo...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Redefinir Senha</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;