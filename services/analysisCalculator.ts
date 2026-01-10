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

// Função auxiliar para determinar o nível de severidade
const getSeverityLevel = (score: number): SeverityLevel => {
  if (score >= 5) return 'Crítica';
  if (score >= 4) return 'Alta';
  if (score >= 2) return 'Média';
  return 'Baixa';
};

// Função auxiliar para determinar o nível de probabilidade
const getProbabilityLevel = (score: number): ProbabilityLevel => {
  if (score >= 3) return 'Provável';
  if (score >= 2) return 'Possível';
  return 'Improvável';
};

// Função auxiliar para determinar o nível da matriz de risco
const getRiskMatrixLevel = (score: number): RiskMatrixLevel => {
  if (score >= 15) return 'Crítico';
  if (score >= 9) return 'Alto';
  if (score >= 4) return 'Médio';
  return 'Baixo';
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
            topico: factor.label,
            gravidadeNum: answer
          });
        }
      }
      return factorResponses;
    })
  }));

  const riskAnalysisResults = calculateRiskAnalysis(evaluations, probability);

  // Análise por fator
  const factorsAnalysis: FactorAnalysis[] = RISK_FACTORS.map(factor => {
    const analysisResult = riskAnalysisResults.find(
      ar => ar.topico === factor.label
    );

    const gravidadeScore = analysisResult?.gravidade || 1;
    const probabilidadeScore = analysisResult?.probabilidade || 1;
    const matrizScore = gravidadeScore * probabilidadeScore;

    return {
      factor: factor,
      gravidade: getSeverityLevel(gravidadeScore),
      gravidadeScore: gravidadeScore,
      probabilidade: getProbabilityLevel(probabilidadeScore),
      probabilidadeScore: probabilidadeScore,
      matriz: getRiskMatrixLevel(matrizScore),
    };
  });

  // CALCULAR ESTATÍSTICAS DE GRAVIDADE
  const gravityStats: GravityStats = {
    baixa: factorsAnalysis.filter(f => f.gravidade === 'Baixa').length,
    media: factorsAnalysis.filter(f => f.gravidade === 'Média').length,
    alta: factorsAnalysis.filter(f => f.gravidade === 'Alta' || f.gravidade === 'Crítica').length,
  };

  // CALCULAR ESTATÍSTICAS DA MATRIZ DE RISCO
  const riskMatrixStats: RiskMatrixStats = {
    baixo: factorsAnalysis.filter(f => f.matriz === 'Baixo').length,
    medio: factorsAnalysis.filter(f => f.matriz === 'Médio').length,
    alto: factorsAnalysis.filter(f => f.matriz === 'Alto').length,
    critico: factorsAnalysis.filter(f => f.matriz === 'Crítico').length,
  };

  // CRIAR DADOS POR TEMA
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
