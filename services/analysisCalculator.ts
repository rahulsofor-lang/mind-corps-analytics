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
// Alinhado com 'explicacao_do_calculo.txt': Alta (>=3), Média (=2), Baixa (<=1)
const getSeverityLevel = (score: number): SeverityLevel => {
  if (score >= 3.0) return 'Alta';    // 3.0 a 4.0
  if (score >= 2.0) return 'Média';   // 2.0 a 2.9
  return 'Baixa';                     // 0.0 a 1.9
};

// Função auxiliar para determinar o nível de probabilidade - AGORA COM 3 NÍVEIS, ALINHADO COM A EXPLICAÇÃO
// Conforme 'explicacao_do_calculo.txt': "1 - Baixa / 2 Média / 3 Alta Probabilidade" e "Alta (>=3), Média (=2), Baixa (<=1)"
// A pontuação de probabilidade que vem do riskCalculator.ts pode ser de 1 a 4,
// mas para a CLASSIFICAÇÃO visual e da matriz, vamos usar os 3 níveis da explicação.
const getProbabilityLevel = (score: number): ProbabilityLevel => {
  if (score >= 3.0) return 'Alta';    // Se a pontuação for 3.0 ou mais (incluindo o 'Crítico' do riskCalculator.ts que é >= 3.6)
  if (score >= 2.0) return 'Média';   // Se a pontuação for 2.0 a 2.9
  return 'Baixa';                     // Se a pontuação for 0.0 a 1.9
};

// ✅ MATRIZ DE RISCO ADAPTADA PARA 3 NÍVEIS DE PROBABILIDADE
// Gravidade (linhas): Baixa (0-1.9), Média (2.0-2.9), Alta (3.0-4.0)
// Probabilidade (colunas): Baixa (0-1.9), Média (2.0-2.9), Alta (3.0-4.0)
// A descrição da NR 01 ainda permite 4 níveis de risco final (Baixo, Médio, Alto, Crítico),
// mesmo com 3x3 de entrada. Esta é uma interpretação comum para matrizes de risco.
const getRiskMatrixLevel = (gravidade: number, probabilidade: number): RiskMatrixLevel => {
  const gravityLevel = getSeverityLevel(gravidade); // Reutiliza a função de gravidade
  const probLevel = getProbabilityLevel(probabilidade); // Reutiliza a nova função de probabilidade (3 níveis)

  // Lógica da Matriz de Risco 3x3 (Gravidade x Probabilidade)
  // Os resultados da matriz (Baixo, Médio, Alto, Crítico) são 4 níveis, conforme a NR 01.
  if (gravityLevel === 'Baixa') {
    if (probLevel === 'Baixa') return 'Baixo';
    if (probLevel === 'Média') return 'Médio';
    if (probLevel === 'Alta') return 'Médio'; // Ajustado para ser mais conservador
  }
  if (gravityLevel === 'Média') {
    if (probLevel === 'Baixa') return 'Médio';
    if (probLevel === 'Média') return 'Médio';
    if (probLevel === 'Alta') return 'Alto';
  }
  if (gravityLevel === 'Alta') {
    if (probLevel === 'Baixa') return 'Médio'; // Ajustado para ser mais conservador
    if (probLevel === 'Média') return 'Alto';
    if (probLevel === 'Alta') return 'Alto';
  }

  return 'Baixo'; // Fallback para qualquer caso não coberto (idealmente não deve ocorrer)
};

// ✅ LISTA DE PERGUNTAS INVERTIDAS
// Baseado no arquivo 'Perguntas_invertidas.txt'
// As perguntas são 1-indexed no documento, então ajustamos para 0-indexed para o array.
const INVERTED_QUESTIONS_INDICES = new Set([
  0, // p - 1 (índice 0)
  3, // p - 4 (índice 3)
  4, // p - 5 (índice 4)
  5, // p - 6 (índice 5)
  8, // p - 9 (índice 8)
  9, // p - 10 (índice 9)
  10, // p - 11 (índice 10)
  11, // p - 12 (índice 11)
  17, // p - 18 (índice 17)
  27, // p - 28 (índice 27)
  45, // p - 46 (índice 45)
  49, // p - 50 (índice 49)
  51, // p - 52 (índice 51)
  52, // p - 53 (índice 52)
  56, // p - 57 (índice 56)
  59, // p - 60 (índice 59)
  60, // p - 61 (índice 60)
  61, // p - 62 (índice 61)
  63, // p - 64 (índice 63)
  65, // p - 66 (índice 65)
  66, // p - 67 (índice 66)
  67, // p - 68 (índice 67)
  68, // p - 69 (índice 68)
  69, // p - 70 (índice 69)
  72, // p - 73 (índice 72)
  74, // p - 75 (índice 74)
  75, // p - 76 (índice 75)
  82, // p - 83 (índice 82)
  88  // p - 89 (índice 88)
]);

// Função para inverter a pontuação de 0 a 4
const invertScore = (score: number): number => {
  // A escala é de 0 a 4.
  // 0 -> 4
  // 1 -> 3
  // 2 -> 2
  // 3 -> 1
  // 4 -> 0
  return 4 - score;
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
      // Ajustamos o loop para usar o índice correto do array de respostas (0-indexed)
      // As perguntas no `riskFactors.ts` são 1-indexed, então `i` é o número da pergunta.
      // Para acessar o array `response.answers`, usamos `i - 1`.
      for (let i = factor.startQuestion; i <= factor.endQuestion; i++) {
        const answerIndex = i - 1; // Converte o número da pergunta (1-indexed) para índice do array (0-indexed)
        let answer = response.answers[answerIndex]; // Pega a resposta original

        if (answer !== undefined) {
          // ✅ APLICA A LÓGICA DE INVERSÃO AQUI
          if (INVERTED_QUESTIONS_INDICES.has(answerIndex)) {
            answer = invertScore(answer); // Inverte a pontuação se for uma pergunta invertida
          }

          factorResponses.push({
            topico: factor.label,
            gravidadeNum: answer // Usa a resposta (potencialmente invertida)
          });
        }
      }
      return factorResponses;
    })
  }));

  // calculateRiskAnalysis é responsável por calcular a gravidade e probabilidade (de 1 a 4)
  // Ele receberá as gravidades já ajustadas para as perguntas invertidas.
  const riskAnalysisResults = calculateRiskAnalysis(evaluations, probability);

  const factorsAnalysis: FactorAnalysis[] = RISK_FACTORS.map(factor => {
    const analysisResult = riskAnalysisResults.find(
      ar => ar.topico === factor.label
    );

    const gravidadeScore = analysisResult?.gravidade || 1;
    const probabilidadeScore = analysisResult?.probabilidade || 1; // Score de 1 a 4 vindo do riskCalculator

    return {
      factor: factor,
      gravidade: getSeverityLevel(gravidadeScore), // Classifica a gravidade em 3 níveis
      gravidadeScore: gravidadeScore,
      probabilidade: getProbabilityLevel(probabilidadeScore), // Classifica a probabilidade em 3 níveis
      probabilidadeScore: probabilidadeScore,
      matriz: getRiskMatrixLevel(gravidadeScore, probabilidadeScore), // Usa a matriz atualizada com 3 níveis de entrada
    };
  });

  const gravityStats: GravityStats = {
    baixa: factorsAnalysis.filter(f => f.gravidade === 'Baixa').length,
    media: factorsAnalysis.filter(f => f.gravidade === 'Média').length,
    alta: factorsAnalysis.filter(f => f.gravidade === 'Alta').length,
  };

  // Os níveis da matriz de risco final (Baixo, Médio, Alto, Crítico) permanecem 4,
  // pois a NR 01 geralmente usa essa granularidade para o risco final.
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
