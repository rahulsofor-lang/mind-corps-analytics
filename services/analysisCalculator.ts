// services/analysisCalculator.ts

import {
  Company,
  SurveyResponse,
  ProbabilityAssessment,
  DiagnosticReport,
  SectorAnalysisData,
  FactorAnalysis,
  RiskFactor,
  SeverityLevel,
  ProbabilityLevel,
  RiskMatrixLevel,
  Evaluation // Importar Evaluation
} from '../types';
import { RISK_FACTORS } from './riskFactors'; // Importar a lista de fatores de risco
import { calculateRiskAnalysis } from './riskCalculator'; // Importar o calculador de risco

// Função auxiliar para determinar o nível de severidade/probabilidade/matriz
const getLevel = (score: number, type: 'severity' | 'probability' | 'matrix'): SeverityLevel | ProbabilityLevel | RiskMatrixLevel => {
  if (type === 'severity') {
    if (score >= 4) return 'Crítica';
    if (score >= 3) return 'Alta';
    if (score >= 2) return 'Média';
    return 'Baixa';
  } else if (type === 'probability') {
    // Ajustado para 'Baixo', 'Médio', 'Alto', 'Crítico'
    if (score >= 4) return 'Crítico';
    if (score >= 3) return 'Alto';
    if (score >= 2) return 'Médio';
    return 'Baixo';
  } else { // type === 'matrix'
    if (score >= 6) return 'Crítico';
    if (score >= 4) return 'Alto';
    if (score >= 2) return 'Médio';
    return 'Baixo';
  }
};

export const buildSectorAnalysisData = (
  company: Company,
  sectorId: string,
  responses: SurveyResponse[],
  probability: ProbabilityAssessment | null,
  report: DiagnosticReport | null
): SectorAnalysisData => {
  const sector = company.sectors.find(s => s.id === sectorId);
  const sectorName = sector ? sector.name : 'Setor Desconhecido';

  // Filtra as respostas para o setor específico
  const sectorResponses = responses.filter(r => r.sectorId === sectorId);

  // Extrai as funções únicas do setor
  const funcoes = Array.from(new Set(sectorResponses.map(r => r.jobFunction)));

  // Prepara os dados para o calculateRiskAnalysis
  const evaluations: Evaluation[] = sectorResponses.map(response => ({
    id: response.id,
    companyId: response.companyId,
    sectorId: response.sectorId,
    jobFunction: response.jobFunction,
    completedAt: response.completedAt,
    respostas: RISK_FACTORS.flatMap(factor => {
      const factorResponses: { topico: string; gravidadeNum: number }[] = [];
      for (let i = factor.startQuestion; i <= factor.endQuestion; i++) {
        const answer = response.answers[i];
        if (answer !== undefined) {
          factorResponses.push({
            topico: factor.label, // Usar o label do fator como tópico
            gravidadeNum: answer // A resposta é a gravidade numérica
          });
        }
      }
      return factorResponses;
    })
  }));

  const riskAnalysisResults = calculateRiskAnalysis(evaluations, probability);

  const factorsAnalysis: FactorAnalysis[] = RISK_FACTORS.map(factor => {
    const analysisResult = riskAnalysisResults.find(
      ar => ar.topico === factor.label
    );

    // Valores padrão se não houver análise para o fator
    const gravidadeScore = analysisResult?.gravidade || 1;
    const probabilidadeScore = analysisResult?.probabilidade || 1;
    const matrizScore = analysisResult?.risco || 1;

    return {
      factor: factor,
      gravidade: getLevel(gravidadeScore, 'severity') as SeverityLevel,
      gravidadeScore: gravidadeScore,
      probabilidade: getLevel(probabilidadeScore, 'probability') as ProbabilityLevel,
      probabilidadeScore: probabilidadeScore,
      matriz: getLevel(matrizScore, 'matrix') as RiskMatrixLevel,
    };
  });

  return {
    company: company,
    sectorId: sectorId, // Adicionado, pois estava faltando e causando erro
    sectorName: sectorName,
    funcoes: funcoes,
    totalRespondentes: sectorResponses.length,
    dataElaboracao: report?.dataElaboracao || new Date().toLocaleDateString('pt-BR'),
    factors: factorsAnalysis
  };
};