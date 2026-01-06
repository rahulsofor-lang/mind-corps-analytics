// services/riskCalculator.ts

import { Evaluation, ProbabilityAssessment, RiskAnalysisResult } from '../types';
import { RISK_FACTORS } from './riskFactors'; // Importar a lista de fatores de risco

export const calculateRiskAnalysis = (
  evaluations: Evaluation[],
  probAssessment: ProbabilityAssessment | null
): RiskAnalysisResult[] => {
  if (!probAssessment || !probAssessment.scores) return [];

  const results: RiskAnalysisResult[] = [];

  // Itera sobre os scores de probabilidade fornecidos pelo psicólogo
  for (const factorIdStr in probAssessment.scores) {
    const factorId = parseInt(factorIdStr);
    const probabilityScore = probAssessment.scores[factorId]; // Probabilidade numérica definida pelo psicólogo

    const riskFactor = RISK_FACTORS.find(f => f.id === factorId);
    if (!riskFactor) continue; // Pula se não encontrar o fator correspondente

    // 1. Filtrar todas as respostas deste tópico (fator) em todas as avaliações do setor
    const topicResponses = evaluations.flatMap(e =>
      e.respostas.filter(r => r.topico === riskFactor.label) // Filtra pelo label do fator
    );

    // 2. Média de Gravidade (G) do Tópico
    const avgGravity = topicResponses.length > 0
      ? topicResponses.reduce((acc, curr) => acc + curr.gravidadeNum, 0) / topicResponses.length
      : 1; // Valor padrão 1 para evitar divisão por zero ou risco muito baixo

    // 3. Probabilidade (P) vem do psicólogo (já temos `probabilityScore`)

    // 4. Risco Final = G x P
    const riskValue = parseFloat((avgGravity * probabilityScore).toFixed(1));

    // 5. Classificação NR-01
    let classification = { texto: 'Baixo', cor: '#10b981' };
    if (riskValue > 6.0) {
      classification = { texto: 'Crítico', cor: '#000000' };
    } else if (riskValue > 4.0) {
      classification = { texto: 'Alto', cor: '#ef4444' };
    } else if (riskValue > 2.0) {
      classification = { texto: 'Médio', cor: '#eab308' };
    }

    results.push({
      topico: riskFactor.label,
      fonteGeradora: riskFactor.label, // Pode ser ajustado se a fonte geradora for diferente do label
      gravidade: parseFloat(avgGravity.toFixed(2)),
      probabilidade: probabilityScore, // A probabilidade numérica
      risco: riskValue,
      classificacao: classification
    });
  }

  return results;
};
