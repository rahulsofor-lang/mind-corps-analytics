// components/ReportAnalysis.tsx

import React, { useState, useEffect } from 'react';
import {
  Company,
  SurveyResponse,
  ProbabilityAssessment,
  DiagnosticReport,
  Psychologist,
  FactorAnalysis,
  SeverityLevel,
  ProbabilityLevel,
  RiskMatrixLevel
} from '../types';
import { buildSectorAnalysisData } from '../services/analysisCalculator';
import { FileDown, Save } from 'lucide-react';

interface ReportAnalysisProps {
  company: Company;
  sectorId: string;
  responses: SurveyResponse[];
  probability: ProbabilityAssessment | null;
  report: DiagnosticReport | null;
  psychologist: Psychologist | null; // Pode ser null se não houver psicólogo logado
  onSave: (updatedReport: Partial<DiagnosticReport>) => void;
}

const ReportAnalysis: React.FC<ReportAnalysisProps> = ({
  company,
  sectorId,
  responses,
  probability,
  report,
  psychologist,
  onSave
}) => {
  const [analysisData, setAnalysisData] = useState(
    buildSectorAnalysisData(company, sectorId, responses, probability, report)
  );
  const [localReport, setLocalReport] = useState<Partial<DiagnosticReport>>({
    fontesGeradoras: report?.fontesGeradoras || {},
    agravos: report?.agravos || {},
    medidas: report?.medidas || {},
    funcoes: report?.funcoes || analysisData.funcoes,
    dataElaboracao: report?.dataElaboracao || analysisData.dataElaboracao,
    author: report?.author || psychologist?.nome || ''
  });

  useEffect(() => {
    // Recalcula a análise se os dados de entrada mudarem
    const newAnalysisData = buildSectorAnalysisData(company, sectorId, responses, probability, report);
    setAnalysisData(newAnalysisData);

    // Atualiza o localReport com os dados mais recentes do report ou defaults
    setLocalReport({
      fontesGeradoras: report?.fontesGeradoras || {},
      agravos: report?.agravos || {},
      medidas: report?.medidas || {},
      funcoes: report?.funcoes || newAnalysisData.funcoes,
      dataElaboracao: report?.dataElaboracao || newAnalysisData.dataElaboracao,
      author: report?.author || psychologist?.nome || ''
    });
  }, [company, sectorId, responses, probability, report, psychologist]);

  const getSeverityColor = (level: SeverityLevel | ProbabilityLevel | RiskMatrixLevel) => {
    switch (level) {
      case 'Baixa':
      case 'Baixo':
        return 'bg-green-600 text-white';
      case 'Média':
      case 'Médio':
        return 'bg-yellow-500 text-gray-900';
      case 'Alta':
      case 'Alto':
        return 'bg-red-600 text-white';
      case 'Crítica':
      case 'Crítico':
        return 'bg-black text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleFieldChange = (
    factorId: number,
    field: 'fontesGeradoras' | 'agravos' | 'medidas',
    value: string
  ) => {
    setLocalReport((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [factorId]: value
      }
    }));
  };

  const handleSaveClick = () => {
    onSave(localReport);
  };

  // Função para exportar para PDF (placeholder)
  const handleExportPdf = () => {
    alert('Funcionalidade de exportar para PDF ainda não implementada.');
    // Aqui você integraria uma biblioteca como jsPDF ou html2pdf
  };

  return (
    <div className="p-8 bg-white text-gray-800 font-sans">
      <div className="mb-8 border-b pb-6 border-gray-300">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Análise de Resultados - NR-01</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p>
            <strong className="text-blue-800">Empresa:</strong> {analysisData.company.nomeFantasia}
          </p>
          <p>
            <strong className="text-blue-800">CNPJ:</strong> {analysisData.company.cnpj}
          </p>
          <p>
            <strong className="text-blue-800">Setor:</strong> {analysisData.sectorName}
          </p>
          <p>
            <strong className="text-blue-800">Data da Elaboração:</strong>{' '}
            {localReport.dataElaboracao}
          </p>
          <p className="col-span-2">
            <strong className="text-blue-800">Funções Avaliadas:</strong>{' '}
            {localReport.funcoes?.join(', ') || 'N/A'}
          </p>
          <p className="col-span-2">
            <strong className="text-blue-800">Responsável Técnico:</strong>{' '}
            {localReport.author || 'Não informado'}
            {psychologist?.registroCRP && ` (CRP: ${psychologist.registroCRP})`}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">
          Classificação de Risco Psicossocial
        </h2>
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">Fatores de Risco</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">Fonte Geradora do Risco</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">Gravidade (Severidade)</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">Probabilidade de Ocorrência</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">Matriz Risco</th>
            </tr>
          </thead>
          <tbody>
            {analysisData.factors.map((item) => (
              <tr key={item.factor.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {item.factor.label}
                </td>
                <td className="py-3 px-4 text-sm">
                  <textarea
                    value={localReport.fontesGeradoras?.[item.factor.id] || ''}
                    onChange={(e) =>
                      handleFieldChange(item.factor.id, 'fontesGeradoras', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-y min-h-[60px]"
                    rows={3}
                  />
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-xs ${getSeverityColor(
                      item.gravidade
                    )}`}
                  >
                    {item.gravidade}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-xs ${getSeverityColor(
                      item.probabilidade
                    )}`}
                  >
                    {item.probabilidade}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-xs ${getSeverityColor(
                      item.matriz
                    )}`}
                  >
                    {item.matriz}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seções de Agravos e Medidas (editáveis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Possíveis Agravos à Saúde Mental</h2>
          {analysisData.factors.map((item) => (
            <div key={`agravos-${item.factor.id}`} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {item.factor.label}:
              </label>
              <textarea
                value={localReport.agravos?.[item.factor.id] || ''}
                onChange={(e) => handleFieldChange(item.factor.id, 'agravos', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-y min-h-[80px]"
                rows={4}
              />
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Medidas de Controle Existentes</h2>
          {analysisData.factors.map((item) => (
            <div key={`medidas-${item.factor.id}`} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {item.factor.label}:
              </label>
              <textarea
                value={localReport.medidas?.[item.factor.id] || ''}
                onChange={(e) => handleFieldChange(item.factor.id, 'medidas', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-y min-h-[80px]"
                rows={4}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleExportPdf}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
        >
          <FileDown className="w-5 h-5" />
          <span>Exportar para PDF</span>
        </button>
        <button
          onClick={handleSaveClick}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Salvar Análise</span>
        </button>
      </div>
    </div>
  );
};

export default ReportAnalysis;