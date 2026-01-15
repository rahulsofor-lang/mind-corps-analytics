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

// ✅ FUNÇÕES AUXILIARES PARA DETERMINAR OS NÍVEIS (AJUSTADAS PARA ESCALA 1-4)

// Função auxiliar para determinar o nível de severidade (Gravidade)
// Baseado na média das respostas dos colaboradores (escala 1 a 4)
const getSeverityLevel = (score: number): SeverityLevel => {
  if (score >= 3.1) return 'Crítica'; // Ex: 3.1 a 4.0
  if (score >= 2.1) return 'Alta';    // Ex: 2.1 a 3.0
  if (score >= 1.1) return 'Média';   // Ex: 1.1 a 2.0
  return 'Baixa';                     // Ex: 1.0
};

// Função auxiliar para determinar o nível de probabilidade
// Baseado no score da psicóloga (escala 1 a 4)
const getProbabilityLevel = (score: number): ProbabilityLevel => {
  if (score >= 3.1) return 'Provável';   // Ex: 3.1 a 4.0
  if (score >= 2.1) return 'Possível';   // Ex: 2.1 a 3.0
  return 'Improvável';                   // Ex: 1.0 a 2.0
};

// Função auxiliar para determinar o nível da matriz de risco (Gravidade * Probabilidade)
// Os pontos de corte foram ajustados para a nova escala de 1 a 4 para G e P.
// Ex: G=4 * P=4 = 16 (Crítico)
// Ex: G=3 * P=3 = 9 (Alto)
// Ex: G=2 * P=2 = 4 (Médio)
// Ex: G=1 * P=1 = 1 (Baixo)
const getRiskMatrixLevel = (score: number): RiskMatrixLevel => {
  if (score >= 9) return 'Crítico'; // Ex: 3*3=9, 3*4=12, 4*3=12, 4*4=16
  if (score >= 5) return 'Alto';    // Ex: 2*3=6, 2*4=8, 3*2=6, 4*2=8
  if (score >= 2) return 'Médio';   // Ex: 1*2=2, 2*1=2
  return 'Baixo';                   // Ex: 1*1=1
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

  // ✅ Agora calculateRiskAnalysis retorna a média de gravidade e a probabilidade da psicóloga
  const riskAnalysisResults = calculateRiskAnalysis(evaluations, probability);

  const factorsAnalysis: FactorAnalysis[] = RISK_FACTORS.map(factor => {
    const analysisResult = riskAnalysisResults.find(
      ar => ar.topico === factor.label
    );

    // ✅ gravidadeScore agora é a média real das respostas dos colaboradores
    const gravidadeScore = analysisResult?.gravidade || 1;
    // ✅ probabilidadeScore agora é o score da psicóloga (ou 1 se não encontrado)
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

  const gravityStats: GravityStats = {
    baixa: factorsAnalysis.filter(f => f.gravidade === 'Baixa').length,
    media: factorsAnalysis.filter(f => f.gravidade === 'Média').length,
    alta: factorsAnalysis.filter(f => f.gravidade === 'Alta' || f.gravidade === 'Crítica').length,
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
