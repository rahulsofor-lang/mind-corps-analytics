// components/ReportAnalysis.tsx

import React, { useState, useEffect } from 'react';
import {
  Company,
  SurveyResponse,
  ProbabilityAssessment,
  DiagnosticReport,
  Psychologist,
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

  // data de geração (usada logo abaixo do título)
  const [generationDate] = useState<string>(
    report?.dataElaboracao || new Date().toLocaleDateString('pt-BR')
  );

  const [localReport, setLocalReport] = useState<Partial<DiagnosticReport>>({
    fontesGeradoras: report?.fontesGeradoras || {},
    agravosSaude: report?.agravosSaude || '',
    medidasControle: report?.medidasControle || '',
    conclusao: report?.conclusao || '',
    funcoes: report?.funcoes || analysisData.funcoes,
    dataElaboracao: report?.dataElaboracao || analysisData.dataElaboracao,
    author:
      report?.author ||
      psychologist?.nomeCompleto ||
      (psychologist as any)?.nome ||
      ''
  });

  useEffect(() => {
    const newAnalysisData = buildSectorAnalysisData(
      company,
      sectorId,
      responses,
      probability,
      report
    );
    setAnalysisData(newAnalysisData);

    setLocalReport(prev => ({
      ...prev,
      fontesGeradoras: report?.fontesGeradoras || {},
      agravosSaude: report?.agravosSaude || prev.agravosSaude || '',
      medidasControle: report?.medidasControle || prev.medidasControle || '',
      conclusao: report?.conclusao || prev.conclusao || '',
      funcoes: report?.funcoes || newAnalysisData.funcoes,
      dataElaboracao: report?.dataElaboracao || newAnalysisData.dataElaboracao,
      author:
        report?.author ||
        psychologist?.nomeCompleto ||
        (psychologist as any)?.nome ||
        ''
    }));
  }, [company, sectorId, responses, probability, report, psychologist]);

  const getSeverityColor = (
    level: SeverityLevel | ProbabilityLevel | RiskMatrixLevel
  ) => {
    switch (level) {
      case 'Baixa':
      case 'Baixo':
        return 'bg-green-600 text-white';
      case 'Média':
      case 'Médio':
        return 'bg-yellow-400 text-gray-900';
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

  const handleFonteChange = (factorId: number, value: string) => {
    setLocalReport(prev => ({
      ...prev,
      fontesGeradoras: {
        ...(prev.fontesGeradoras || {}),
        [factorId]: value
      }
    }));
  };

  const handleSimpleFieldChange = (
    field: 'agravosSaude' | 'medidasControle' | 'conclusao',
    value: string
  ) => {
    setLocalReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveClick = () => {
    onSave(localReport);
  };

  const handleExportPdf = () => {
    alert('Funcionalidade de exportar para PDF ainda não implementada.');
  };

  // monta texto "Nome – CRP: 06/74013"
  const renderResponsavel = () => {
    const nome =
      localReport.author ||
      psychologist?.nomeCompleto ||
      (psychologist as any)?.nome ||
      'Não informado';
    const crp = psychologist?.crp || (psychologist as any)?.registroCRP;

    if (crp) {
      return `${nome} – CRP: ${crp}`;
    }
    return nome;
  };

  return (
    <div className="p-8 bg-white text-gray-900 font-sans max-w-[210mm] mx-auto">
      {/* ===== TOPO: TÍTULO + DATA + RESPONSÁVEL + DADOS DA EMPRESA ===== */}
      <div className="mb-6 border-b border-gray-300 pb-4">
        {/* Linha 1: Título */}
        <h1 className="text-2xl font-bold text-left text-gray-900">
          Analise e Resultado
        </h1>

        {/* Linha 2: Data de geração do documento */}
        <p className="mt-1 text-sm text-left text-gray-700">
          <span className="font-semibold">Data de geração: </span>
          {generationDate}
        </p>

        {/* Linha 3: Responsável Técnico + CRP (nome + CRP do Firebase) */}
        <p className="mt-2 text-sm text-left">
          <span className="font-semibold">Responsável Técnico: </span>
          {renderResponsavel()}
        </p>

        {/* Dados da Empresa — cada linha separada, alinhada à esquerda */}
        <div className="mt-4 space-y-1 text-sm text-left">
          <p>
            <span className="font-semibold">RAZÃO SOCIAL: </span>
            {company.razaoSocial || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">NOME FANTASIA: </span>
            {company.nomeFantasia || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">CNPJ: </span>
            {company.cnpj || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">SETOR: </span>
            {analysisData.sectorName || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">FUNÇÕES: </span>
            {localReport.funcoes?.join(', ') || 'N/A'}
          </p>
        </div>
      </div>

      {/* ===== CAIXA 1: POSSÍVEIS AGRAVOS ===== */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-1 text-left">
          Possíveis Agravos a saúde Mental
        </h2>
        <textarea
          value={localReport.agravosSaude || ''}
          onChange={e => handleSimpleFieldChange('agravosSaude', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm resize-vertical min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Digite aqui os possíveis agravos à saúde mental identificados..."
        />
      </div>

      {/* ===== CAIXA 2: MEDIDAS DE CONTROLE ===== */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1 text-left">
          Medidas de Controle Existentes:
        </h2>
        <textarea
          value={localReport.medidasControle || ''}
          onChange={e =>
            handleSimpleFieldChange('medidasControle', e.target.value)
          }
          className="w-full border border-gray-300 rounded-md p-2 text-sm resize-vertical min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Digite aqui as medidas de controle existentes..."
        />
      </div>

      {/* ===== TABELA: CRITÉRIO + QUANTITATIVO E QUALITATIVO ===== */}
      <div className="mb-6">
        {/* Linha acima da tabela:
            - "Critério" em um quadrinho azul alinhado à coluna 1
            - "Quantitativo e Qualitativo" em um quadrinho azul alinhado às colunas 2–5
        */}
        <div className="grid grid-cols-5 text-xs font-semibold mb-0">
          {/* Coluna 1: Critério dentro de um quadrinho azul */}
          <div className="col-span-1 text-center border border-blue-700 bg-blue-700 text-white py-1 rounded-t-md">
            Critério
          </div>
          {/* Colunas 2–5: Quantitativo e Qualitativo dentro de outro quadrinho azul */}
          <div className="col-span-4 text-center border border-blue-700 bg-blue-700 text-white py-1 rounded-t-md ml-[-1px]">
            Quantitativo e Qualitativo
          </div>
        </div>

        {/* Tabela */}
        <table className="w-full text-xs border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-2 py-1 text-left font-semibold w-[24%]">
                Fatores de Risco
              </th>
              <th className="border border-gray-400 px-2 py-1 text-left font-semibold w-[26%]">
                Fonte Geradora do Risco
              </th>
              <th className="border border-gray-400 px-2 py-1 text-center font-semibold w-[16%]">
                Gravidade (Severidade)
              </th>
              <th className="border border-gray-400 px-2 py-1 text-center font-semibold w-[18%]">
                Probabilidade de Ocorrência
              </th>
              <th className="border border-gray-400 px-2 py-1 text-center font-semibold w-[16%]">
                Matriz Risco
              </th>
            </tr>
          </thead>
          <tbody>
            {analysisData.factors.map(item => (
              <tr key={item.factor.id} className="align-top hover:bg-gray-50">
                {/* Coluna 1: Fatores de Risco (texto fixo) */}
                <td className="border border-gray-400 px-2 py-1 font-medium text-left">
                  {item.factor.label}
                </td>

                {/* Coluna 2: Fonte Geradora (editável, por fator) */}
                <td className="border border-gray-400 px-1 py-1">
                  <textarea
                    value={localReport.fontesGeradoras?.[item.factor.id] || ''}
                    onChange={e => handleFonteChange(item.factor.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-sm p-1 text-[11px] resize-vertical min-h-[50px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Descreva a fonte..."
                  />
                </td>

                {/* Coluna 3: Gravidade */}
                <td className="border border-gray-400 px-1 py-1 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${getSeverityColor(
                      item.gravidade
                    )}`}
                  >
                    {item.gravidade}
                  </span>
                </td>

                {/* Coluna 4: Probabilidade */}
                <td className="border border-gray-400 px-1 py-1 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${getSeverityColor(
                      item.probabilidade
                    )}`}
                  >
                    {item.probabilidade}
                  </span>
                </td>

                {/* Coluna 5: Matriz de Risco */}
                <td className="border border-gray-400 px-1 py-1 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${getSeverityColor(
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

      {/* ===== CAIXA 3: CONCLUSÃO ===== */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-1 text-left">CONCLUSÃO</h2>
        <textarea
          value={localReport.conclusao || ''}
          onChange={e => handleSimpleFieldChange('conclusao', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm resize-vertical min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Digite aqui a conclusão da análise..."
        />
      </div>

      {/* ===== BOTÕES ===== */}
      <div className="flex justify-end space-x-4 mt-4">
        <button
          onClick={handleExportPdf}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span>Exportar para PDF</span>
        </button>
        <button
          onClick={handleSaveClick}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Análise</span>
        </button>
      </div>
    </div>
  );
};

export default ReportAnalysis;