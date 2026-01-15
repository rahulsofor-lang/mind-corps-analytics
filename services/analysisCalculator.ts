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
  GravityStats,
  RiskMatrixStats,
  Evaluation
} from '../types';
import { RISK_FACTORS } from './riskFactors';
import { calculateRiskAnalysis } from './riskCalculator';

// ✅ FUNÇÕES AUXILIARES PARA DETERMINAR OS NÍVEIS

// Função auxiliar para determinar o nível de severidade (Gravidade) - 3 NÍVEIS
const getSeverityLevel = (score: number): SeverityLevel => {
  if (score >= 3.0) return 'Alta';    // 3.0 a 4.0
  if (score >= 2.0) return 'Média';   // 2.0 a 2.9
  return 'Baixa';                     // 0.0 a 1.9
};

// Função auxiliar para determinar o nível de probabilidade - 4 NÍVEIS
const getProbabilityLevel = (score: number): ProbabilityLevel => {
  if (score >= 3.6) return 'Crítico'; // 3.6 a 4.0
  if (score >= 3.0) return 'Alto';    // 3.0 a 3.5
  if (score >= 2.0) return 'Médio';   // 2.0 a 2.9
  return 'Baixo';                     // 0.0 a 1.9
};

// ✅ MATRIZ DE RISCO ADAPTADA PARA 4 NÍVEIS DE PROBABILIDADE
// Gravidade (linhas): Baixa (0-1.9), Média (2.0-2.9), Alta (3.0-4.0)
// Probabilidade (colunas): Baixo (0-1.9), Médio (2.0-2.9), Alto (3.0-3.5), Crítico (3.6-4.0)
const getRiskMatrixLevel = (gravidade: number, probabilidade: number): RiskMatrixLevel => {
  const gravityLevel = gravidade >= 3.0 ? 'Alta' : gravidade >= 2.0 ? 'Média' : 'Baixa';
  const probLevel = probabilidade >= 3.6 ? 'Crítico' : probabilidade >= 3.0 ? 'Alto' : probabilidade >= 2.0 ? 'Médio' : 'Baixo';

  // Matriz de risco
  if (gravityLevel === 'Baixa') {
    if (probLevel === 'Baixo' || probLevel === 'Médio') return 'Baixo';
    if (probLevel === 'Alto' || probLevel === 'Crítico') return 'Médio';
  }
  if (gravityLevel === 'Média') {
    if (probLevel === 'Baixo') return 'Baixo';
    if (probLevel === 'Médio') return 'Médio';
    if (probLevel === 'Alto') return 'Alto';
    if (probLevel === 'Crítico') return 'Crítico';
  }
  if (gravityLevel === 'Alta') {
    if (probLevel === 'Baixo') return 'Médio';
    if (probLevel === 'Médio') return 'Alto';
    if (probLevel === 'Alto' || probLevel === 'Crítico') return 'Crítico';
  }

  return 'Baixo'; // Fallback
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

  const sectorResponses = responses.filter(r => r.sectorId === sectorId);
  const funcoes = Array.from(new Set(sectorResponses.map(r => r.jobFunction)));

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
            topico: factor.label,
            gravidadeNum: answer
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

    const gravidadeScore = analysisResult?.gravidade || 1;
    const probabilidadeScore = analysisResult?.probabilidade || 1;

    return {
      factor: factor,
      gravidade: getSeverityLevel(gravidadeScore),
      gravidadeScore: gravidadeScore,
      probabilidade: getProbabilityLevel(probabilidadeScore),
      probabilidadeScore: probabilidadeScore,
      matriz: getRiskMatrixLevel(gravidadeScore, probabilidadeScore),
    };
  });

  const gravityStats: GravityStats = {
    baixa: factorsAnalysis.filter(f => f.gravidade === 'Baixa').length,
    media: factorsAnalysis.filter(f => f.gravidade === 'Média').length,
    alta: factorsAnalysis.filter(f => f.gravidade === 'Alta').length,
  };

  const riskMatrixStats: RiskMatrixStats = {
    baixo: factorsAnalysis.filter(f => f.matriz === 'Baixo').length,
    medio: factorsAnalysis.filter(f => f.matriz === 'Médio').length,
    alto: factorsAnalysis.filter(f => f.matriz === 'Alto').length,
    critico: factorsAnalysis.filter(f => f.matriz === 'Crítico').length,
  };

  const themes = factorsAnalysis.map(fa => ({
    label: fa.factor.label,
    avgGravity: fa.gravidadeScore,
    probValue: fa.probabilidadeScore,
    risk: fa.matriz,
  }));

  return {
    company: company,
    sectorId: sectorId,
    sectorName: sectorName,
    funcoes: funcoes,
    totalRespondentes: sectorResponses.length,
    dataElaboracao: report?.dataElaboracao || new Date().toLocaleDateString('pt-BR'),
    factors: factorsAnalysis,
    gravityStats: gravityStats,
    riskMatrixStats: riskMatrixStats,
    themes: themes,
  };
};
