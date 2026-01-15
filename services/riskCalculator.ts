// services/riskCalculator.ts

import { Evaluation, ProbabilityAssessment, RiskAnalysisResult } from '../types';
import { RISK_FACTORS } from './riskFactors';

// 👉 Função para arredondar em passos de 0.5
const roundToHalf = (num: number): number => {
  return Math.round(num * 2) / 2;
};

// 👉 Função para classificar o risco (Baixo, Médio, Alto, Crítico) e sua cor
const getRiskClassification = (riskValue: number) => {
  if (riskValue >= 10.8) return { texto: 'Crítico', cor: '000000' }; // Preto
  if (riskValue >= 6.0) return { texto: 'Alto', cor: 'F97316' };    // Laranja
  if (riskValue >= 2.0) return { texto: 'Médio', cor: 'F59E0B' };   // Amarelo
  return { texto: 'Baixo', cor: '10B981' };                       // Verde
};

// Mapeamento FIXO de Fontes Geradoras por Tema
const FONTES_GERADORAS_MAP: { [key: string]: string } = {
  'Assédio Moral e Sexual': 'Relações de Trabalho Abusivas, comunicação violenta, e importunação sexual.',
  'Carga Excessiva de Trabalho': 'Metas irrealistas, Jornadas de Trabalho prolongadas, Horas extras excessivas, má distribuição de Cargos.',
  'Falta de Reconhecimento e Recompensas': 'Gestão Pouco Humanizada, Administração de recursos precária.',
  'Clima Organizacional': 'Autoritarismo, Gestão centralizadora, Ausência fiscalização de regras de bom convívio.',
  'Falta Autonomia e Controle sobre o Trabalho': 'Gestão Não Humanizada, Escassez de Inteligência Emocional.',
  'Pressão e Metas Irrealistas': 'Gestão não Humanizada, Propósitos financeiros desalinhados com saúde e Bem estar.',
  'Insegurança e Ameaças': 'Gestão Não Humanizada, Escassez de Inteligência Emocional para gerenciar conflitos.',
  'Conflitos Interpessoais e Falta de Comunicação': 'Falta de treinamentos, Gestão pouco habilitada, Baixas habilidades de oratória e comunicação não Violenta.',
  'Alinhamento entre Vida Pessoal e Profissional': 'Ausência de Propósito pessoal, Falta de tempo, planejamento, incentivo e recursos.',
};

export const calculateRiskAnalysis = (
  evaluations: Evaluation[],
  probAssessment: ProbabilityAssessment | null
): RiskAnalysisResult[] => {

  const results: RiskAnalysisResult[] = [];

  // Itera sobre TODOS os fatores de risco definidos em RISK_FACTORS
  RISK_FACTORS.forEach((riskFactor) => {

    // 1. Filtrar todas as respostas deste tópico (fator) em todas as avaliações do setor
    const topicResponses = evaluations.flatMap(e =>
      e.respostas.filter(r => r.topico === riskFactor.label)
    );

    // 2. Calcular a MÉDIA de Gravidade (G) do Tópico (valor real, sem arredondamento)
    const avgGravityRaw =
      topicResponses.length > 0
        ? topicResponses.reduce((acc, curr) => acc + curr.gravidadeNum, 0) / topicResponses.length
        : 1;

    const gravidade = parseFloat(avgGravityRaw.toFixed(2));

    // 3. Determinar a PROBABILIDADE (P) AUTOMATICAMENTE
    //    -> arredondada em passos de 0.5 a partir da gravidade média
    let probabilidade = roundToHalf(avgGravityRaw);

    // Garante que a probabilidade esteja entre 1 e 4
    if (probabilidade < 1) probabilidade = 1;
    if (probabilidade > 4) probabilidade = 4;

    // 4. Calcular o Risco Final = G x P
    const risco = parseFloat((avgGravityRaw * probabilidade).toFixed(2));

    // 5. Determinar a classificação do risco
    const classificacao = getRiskClassification(risco);

    // 6. Obter a fonte geradora
    const fonteGeradora = FONTES_GERADORAS_MAP[riskFactor.label] || 'Não informada';

    // ✅ Monta o objeto com o formato EXATO da interface RiskAnalysisResult
    results.push({
      topico: riskFactor.label,
      fonteGeradora: fonteGeradora,
      gravidade: gravidade,
      probabilidade: probabilidade,
      risco: risco,
      classificacao: classificacao
    });
  });

  return results;
};
