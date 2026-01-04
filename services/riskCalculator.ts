import { Evaluation, ProbabilityAssessment, RiskAnalysisResult } from '../types';  // ← CORRIGIDO (removido 'responses')

export const calculateRiskAnalysis = (
  evaluations: Evaluation[],
  probAssessment: ProbabilityAssessment | null
): RiskAnalysisResult[] => {
  if (!probAssessment) return [];

  return probAssessment.topicos.map(pTopic => {
    // 1. Filtrar todas as respostas deste tópico em todas as avaliações do setor
    const topicResponses = evaluations.flatMap(e =>
      e.respostas.filter(r => r.topico === pTopic.nomeTopico)
    );

    // 2. Média de Gravidade (G) do Tópico
    const avgGravity = topicResponses.length > 0
      ? topicResponses.reduce((acc, curr) => acc + curr.gravidadeNum, 0) / topicResponses.length
      : 1;

    // 3. Probabilidade (P) vem do psicólogo
    const probability = pTopic.pontuacao;

    // 4. Risco Final = G x P
    const riskValue = parseFloat((avgGravity * probability).toFixed(1));

    // 5. Classificação NR-01
    let classification = { texto: 'Baixo', cor: '#10b981' };
    if (riskValue > 6.0) {
      classification = { texto: 'Crítico', cor: '#000000' };
    } else if (riskValue > 4.0) {
      classification = { texto: 'Alto', cor: '#ef4444' };
    } else if (riskValue > 2.0) {
      classification = { texto: 'Médio', cor: '#eab308' };
    }

    return {
      topico: pTopic.nomeTopico,
      fonteGeradora: pTopic.fonteGeradora,
      gravidade: parseFloat(avgGravity.toFixed(2)),
      probabilidade: probability,
      risco: riskValue,
      classificacao: classification
    };
  });
};