import React, { useState, useEffect } from 'react';
import {
  fetchCompanies,
  fetchResponsesByCompany,
  fetchResponsesBySector,
  fetchProbabilityBySector,
  fetchReportBySector,
  saveReportAnalysis
} from '../services/firebaseService';
import {
  Company,
  SurveyResponse,
  GravityStats,
  RiskMatrixStats,
  ProbabilityAssessment,
  DiagnosticReport
} from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Building2, Users, Target, FileText, LogOut } from 'lucide-react';
import ReportAnalysis from './ReportAnalysis';

interface DashboardProps {
  onLogout?: () => void;
  // onOpenReport foi removido, pois o botão "Gerar Devolutiva" não existe mais.
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => { // onOpenReport removido dos props
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [responsesAll, setResponsesAll] = useState<SurveyResponse[]>([]);
  const [responsesSector, setResponsesSector] = useState<SurveyResponse[]>([]);
  const [probabilitySector, setProbabilitySector] = useState<ProbabilityAssessment | null>(null);
  const [reportSector, setReportSector] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSector, setLoadingSector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCompanies();
      setCompanies(data);
      if (data.length === 0) {
        setError('Nenhuma empresa encontrada na coleção "companies".');
      }
    } catch (err) {
      setError('Erro ao carregar empresas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async (updatedReport: Partial<DiagnosticReport>) => {
    if (!selectedCompany || !selectedSectorId) return;

    try {
      await saveReportAnalysis(selectedCompany.id, selectedSectorId, updatedReport);
      alert('✅ Análise salva com sucesso!');

      // Recarregar o report atualizado
      const updatedReportData = await fetchReportBySector(selectedCompany.id, selectedSectorId);
      setReportSector(updatedReportData);
    } catch (error) {
      alert('❌ Erro ao salvar análise');
      console.error(error);
    }
  };

  const handleCompanyChange = async (companyId: string) => {
    try {
      setError(null);
      const company = companies.find(c => c.id === companyId) || null;
      setSelectedCompany(company);
      setSelectedSectorId('');
      setResponsesSector([]);
      setProbabilitySector(null);
      setReportSector(null);

      if (company) {
        setLoadingSector(true);
        const responses = await fetchResponsesByCompany(company.id);
        setResponsesAll(responses);
      } else {
        setResponsesAll([]);
      }
    } catch (err) {
      setError('Erro ao carregar respostas da empresa.');
      console.error(err);
    } finally {
      setLoadingSector(false);
    }
  };

  const handleSectorChange = async (sectorId: string) => {
    try {
      setError(null);
      setSelectedSectorId(sectorId);
      setResponsesSector([]);
      setProbabilitySector(null);
      setReportSector(null);

      if (selectedCompany && sectorId) {
        setLoadingSector(true);
        const responses = await fetchResponsesBySector(selectedCompany.id, sectorId);
        setResponsesSector(responses);

        const prob = await fetchProbabilityBySector(selectedCompany.id, sectorId);
        setProbabilitySector(prob);

        const report = await fetchReportBySector(selectedCompany.id, sectorId);
        setReportSector(report);
      }
    } catch (err) {
      setError('Erro ao carregar dados do setor.');
      console.error(err);
    } finally {
      setLoadingSector(false);
    }
  };

  const calculateGravity = (responses: SurveyResponse[]): GravityStats => {
    const stats: GravityStats = { baixa: 0, media: 0, alta: 0 };

    responses.forEach(response => {
      Object.values(response.answers).forEach(value => {
        if (value <= 2) stats.baixa++;
        else if (value <= 4) stats.media++;
        else stats.alta++;
      });
    });

    return stats;
  };

  const calculateMatrix = (prob: ProbabilityAssessment | null): RiskMatrixStats => {
    const base: RiskMatrixStats = { baixo: 0, medio: 0, alto: 0, critico: 0 };
    if (!prob) return base;

    Object.values(prob.scores).forEach(v => {
      const value = Number(v);
      if (value === 1) base.baixo++;
      else if (value === 2) base.medio++;
      else if (value === 3) base.alto++;
      else if (value >= 4) base.critico++;
    });

    return base;
  };

  const gravityAll = calculateGravity(responsesAll);
  const gravitySector = calculateGravity(responsesSector);
  const matrixSector = calculateMatrix(probabilitySector);

  const chartDataGravityAll = [
    { name: 'Baixa', value: gravityAll.baixa, fill: '#4CAF50' },
    { name: 'Média', value: gravityAll.media, fill: '#FFC107' },
    { name: 'Alta', value: gravityAll.alta, fill: '#F44336' }
  ];

  const chartDataGravitySector = [
    { name: 'Baixa', value: gravitySector.baixa, fill: '#4CAF50' },
    { name: 'Média', value: gravitySector.media, fill: '#FFC107' },
    { name: 'Alta', value: gravitySector.alta, fill: '#F44336' }
  ];

  const chartDataMatrixSector = [
    { name: 'Baixo', value: matrixSector.baixo, fill: '#4CAF50' },
    { name: 'Médio', value: matrixSector.medio, fill: '#FFC107' },
    { name: 'Alto', value: matrixSector.alto, fill: '#F44336' },
    { name: 'Crítico', value: matrixSector.critico, fill: '#000000' }
  ];

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mind Corps Analytics</h1>
            <p className="text-cyan-300/70">Painel de Análise Psicossocial</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-300">⚠️ {error}</p>
          </div>
        )}

        {/* Seleção de empresa / setor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
            <label className="flex items-center space-x-2 text-sm font-medium text-cyan-300/80 mb-3">
              <Building2 className="w-4 h-4" />
              <span>Selecione a Empresa</span>
            </label>
            <select
              value={selectedCompany?.id || ''}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.nomeFantasia}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 transition-opacity ${
              !selectedCompany ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <label className="flex items-center space-x-2 text-sm font-medium text-cyan-300/80 mb-3">
              <Target className="w-4 h-4" />
              <span>Selecione o Setor</span>
            </label>
            <select
              value={selectedSectorId}
              onChange={(e) => handleSectorChange(e.target.value)}
              className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {selectedCompany?.sectors?.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de resumo */}
        {selectedCompany && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-300 font-medium uppercase">Total de Funcionários</p>
                  <h3 className="text-3xl font-bold text-white">{selectedCompany.totalEmployees || 0}</h3>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-green-300 font-medium uppercase">Respondentes</p>
                  <h3 className="text-3xl font-bold text-white">{responsesAll.length}</h3>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-medium uppercase">Taxa de Adesão</p>
                  <h3 className="text-3xl font-bold text-white">
                    {selectedCompany.totalEmployees && selectedCompany.totalEmployees > 0
                      ? ((responsesAll.length / selectedCompany.totalEmployees) * 100).toFixed(1)
                      : 0}
                    %
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card setor selecionado */}
        {selectedSectorId && selectedCompany && (
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-orange-300 font-medium uppercase">
                  Setor: {selectedCompany.sectors.find(s => s.id === selectedSectorId)?.name}
                </p>
                <h3 className="text-3xl font-bold text-white">
                  {responsesSector.length} respondentes
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos em barra (todos verticais) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gravidade geral – empresa */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Gravidade Geral - Empresa</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartDataGravityAll}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value">
                  {chartDataGravityAll.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gravidade setor */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedSectorId && selectedCompany
                ? `Gravidade - ${selectedCompany.sectors.find(s => s.id === selectedSectorId)?.name}`
                : 'Gravidade - Setor (selecione um setor)'}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartDataGravitySector}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value">
                  {chartDataGravitySector.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Matriz de risco setor */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedSectorId && selectedCompany
                ? `Matriz de Risco - ${selectedCompany.sectors.find(s => s.id === selectedSectorId)?.name}`
                : 'Matriz de Risco - Setor (selecione um setor)'}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartDataMatrixSector}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value">
                  {chartDataMatrixSector.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Botões de ação */}
        {selectedCompany && selectedSectorId && responsesSector.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mb-12"> {/* Ajustado para 1 coluna, já que só terá um botão */}
            {/* Botão Ver Análise de Resultados */}
            <button
              onClick={() => setShowAnalysis(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-purple-900 transition-all shadow-2xl shadow-purple-900/40 flex items-center justify-center space-x-3 group active:scale-95"
            >
              <FileText className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              <span>📊 Ver Análise de Resultados</span>
            </button>

            {/* O botão "Gerar Devolutiva" foi removido daqui */}
          </div>
        )}

        {/* Modal Análise de Resultados */}
        {showAnalysis && selectedCompany && selectedSectorId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 border-b-2 border-blue-900 p-6 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-white">📊 Análise de Resultados - NR-01</h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-white hover:text-red-300 text-3xl font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
              <ReportAnalysis
                company={selectedCompany}
                sectorId={selectedSectorId}
                responses={responsesSector}
                probability={probabilitySector}
                report={reportSector}
                psychologist={null}
                onSave={handleSaveAnalysis}
              />
            </div>
          </div>
        )}

        {loadingSector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-slate-900 rounded-2xl p-8">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Carregando dados do setor...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
