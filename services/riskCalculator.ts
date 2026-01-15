// services/riskCalculator.ts

import { Evaluation, ProbabilityAssessment } from '../types';
import { RISK_FACTORS } from './riskFactors';

// A interface RiskAnalysisResult precisa ser definida no seu arquivo types.ts
// ou aqui, se for exclusiva deste arquivo.
// Vou assumir que ela está em '../types' e que inclui 'risco'.
interface RiskAnalysisResult {
  topico: string;
  gravidade: number; // Média das respostas dos colaboradores (sempre exata)
  probabilidade: number; // Score de probabilidade AUTOMÁTICO (arredondado)
  risco: number; // Gravidade * Probabilidade
}

export const calculateRiskAnalysis = (
  evaluations: Evaluation[],
  // ✅ probabilityAssessment NÃO É MAIS USADO PARA DEFINIR A PROBABILIDADE,
  // MAS PODE SER MANTIDO PARA COMPATIBILIDADE OU FUTURAS NECESSIDADES.
  // Se você quiser removê-lo completamente, precisará ajustar a chamada em analysisCalculator.ts
  probabilityAssessment: ProbabilityAssessment | null
): RiskAnalysisResult[] => {
  const results: RiskAnalysisResult[] = [];

  RISK_FACTORS.forEach((factor, factorIndex) => {
    // 1. Filtrar todas as respostas deste tópico (fator) em todas as avaliações do setor
    const topicResponses = evaluations.flatMap(e =>
      e.respostas.filter(r => r.topico === factor.label)
    );

    // 2. Calcular a MÉDIA de Gravidade (G) do Tópico
    // ✅ A gravidade é mantida como a média exata, sem arredondamento.
    const avgGravity = topicResponses.length > 0
      ? topicResponses.reduce((acc, curr) => acc + curr.gravidadeNum, 0) / topicResponses.length
      : 1; // Valor padrão 1 se não houver respostas para o tópico

    // 3. Determinar a PROBABILIDADE (P) AUTOMATICAMENTE com base na avgGravity
    let automaticProbabilityScore: number;

    if (avgGravity >= 3.1) {
      automaticProbabilityScore = 4; // Se a média da gravidade for 3.1 ou mais, probabilidade = 4
    } else if (avgGravity >= 2.1) {
      automaticProbabilityScore = 3; // Se a média da gravidade for 2.1 ou mais, probabilidade = 3
    } else if (avgGravity >= 1.1) {
      automaticProbabilityScore = 2; // Se a média da gravidade for 1.1 ou mais, probabilidade = 2
    } else {
      automaticProbabilityScore = 1; // Se a média da gravidade for menor que 1.1, probabilidade = 1
    }

    // 4. Calcular o Risco Final = G x P
    // ✅ Usa a avgGravity exata e a automaticProbabilityScore arredondada
    const riskValue = parseFloat((avgGravity * automaticProbabilityScore).toFixed(2));

    // ✅ RESULTADO para este fator
    results.push({
      topico: factor.label,
      gravidade: parseFloat(avgGravity.toFixed(2)), // Gravidade com 2 casas decimais
      probabilidade: automaticProbabilityScore, // Probabilidade automática
      risco: riskValue // O valor numérico do risco
    });
  });

  return results;
};
