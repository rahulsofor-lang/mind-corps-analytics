// services/analysisCalculator.ts

import {
  Company,
  SurveyResponse,
  ProbabilityAssessment,
  DiagnosticReport,
  SeverityLevel,
  ProbabilityLevel,
  RiskMatrixLevel,
  FactorAnalysis,
  SectorAnalysisData
} from '../types';
import { RISK_FACTORS } from './riskFactors'; // Importa os fatores de risco

/**
 * Calcula a gravidade (severidade) de um fator de risco com base nas respostas da pesquisa.
 * @param responses Respostas da pesquisa para o setor.
 * @param startQuestion Número da primeira pergunta do fator.
 * @param endQuestion Número da última pergunta do fator.
 * @returns Um objeto com o nível de gravidade e a pontuação média.
 */
const calculateSeverity = (
  responses: SurveyResponse[],
  startQuestion: number,
  endQuestion: number
): { level: SeverityLevel; score: number } => {
  if (responses.length === 0) {
    return { level: 'Baixa', score: 0 };
  }

  let totalScore = 0;
  let totalAnswers = 0;

  responses.forEach((response) => {
    for (let i = startQuestion; i <= endQuestion; i++) {
      const answer = response.answers[i];
      if (answer !== undefined) {
        totalScore += answer;
        totalAnswers++;
      }
    }
  });

  if (totalAnswers === 0) {
    return { level: 'Baixa', score: 0 };
  }

  const averageScore = totalScore / totalAnswers;
  let level: SeverityLevel;

  if (averageScore <= 2) {
    level = 'Baixa';
  } else if (averageScore <= 3) {
    level = 'Média';
  } else if (averageScore <= 4) {
    level = 'Alta';
  } else {
    level = 'Crítica'; // Adicionado nível Crítica para scores > 4
  }

  return { level, score: parseFloat(averageScore.toFixed(2)) };
};

/**
 * Mapeia a pontuação de probabilidade para um nível de probabilidade.
 * @param score Pontuação de probabilidade (1 a 3).
 * @returns O nível de probabilidade.
 */
const mapProbabilityScoreToLevel = (score: number): ProbabilityLevel => {
  if (score === 1) return 'Baixa';
  if (score === 2) return 'Média';
  if (score === 3) return 'Alta';
  return 'Crítica'; // Se por algum motivo vier algo diferente, considera Crítica
};

/**
 * Calcula a matriz de risco com base na gravidade e probabilidade.
 * @param severityLevel Nível de gravidade.
 * @param probabilityLevel Nível de probabilidade.
 * @returns O nível da matriz de risco.
 */
const calculateRiskMatrix = (
  severityLevel: SeverityLevel,
  probabilityLevel: ProbabilityLevel
): RiskMatrixLevel => {
  const severityMap: { [key in SeverityLevel]: number } = {
    Baixa: 1,
    Média: 2,
    Alta: 3,
    Crítica: 4
  };
  const probabilityMap: { [key in ProbabilityLevel]: number } = {
    Baixa: 1,
    Média: 2,
    Alta: 3,
    Crítica: 4
  };

  const s = severityMap[severityLevel];
  const p = probabilityMap[probabilityLevel];

  // Matriz de risco simplificada (pode ser ajustada conforme a necessidade)
  // Ex: Baixa (1) x Baixa (1) = Baixo (1)
  // Ex: Alta (3) x Alta (3) = Crítico (9)
  const riskScore = s * p;

  if (riskScore <= 2) return 'Baixo';
  if (riskScore <= 4) return 'Médio';
  if (riskScore <= 9) return 'Alto';
  return 'Crítico';
};

/**
 * Constrói os dados completos da análise de um setor.
 * @param company Objeto da empresa.
 * @param sectorId ID do setor.
 * @param responses Respostas da pesquisa para o setor.
 * @param probability Avaliação de probabilidade do setor.
 * @param existingReport Relatório existente (para preencher fontes geradoras, agravos, medidas).
 * @returns Dados da análise do setor.
 */
export const buildSectorAnalysisData = (
  company: Company,
  sectorId: string,
  responses: SurveyResponse[],
  probability: ProbabilityAssessment | null,
  existingReport: DiagnosticReport | null
): SectorAnalysisData => {
  const sector = company.sectors.find((s) => s.id === sectorId);
  const sectorName = sector ? sector.name : 'Setor Desconhecido';

  const funcoes = Array.from(new Set(responses.map((r) => r.jobFunction)));
  const totalRespondentes = responses.length;
  const dataElaboracao = new Date().toLocaleDateString('pt-BR');

  const factorsAnalysis: FactorAnalysis[] = RISK_FACTORS.map((factor) => {
    const { level: gravidade, score: gravidadeScore } = calculateSeverity(
      responses,
      factor.startQuestion,
      factor.endQuestion
    );

    const probabilidadeScore = probability?.scores?.[factor.id] || 0;
    const probabilidade = mapProbabilityScoreToLevel(probabilidadeScore);

    const matriz = calculateRiskMatrix(gravidade, probabilidade);

    return {
      factor,
      fonteGeradora: existingReport?.fontesGeradoras?.[factor.id] || '',
      gravidade,
      gravidadeScore,
      probabilidade,
      probabilidadeScore,
      matriz,
      agravos: existingReport?.agravos?.[factor.id] || '',
      medidas: existingReport?.medidas?.[factor.id] || ''
    };
  });

  return {
    company,
    sectorName,
    funcoes,
    totalRespondentes,
    dataElaboracao,
    factors: factorsAnalysis
  };
};