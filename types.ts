// types.ts

// =============================================================================
// INTERFACES BÁSICAS
// =============================================================================

export interface Sector {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  accessCode: string;
  password: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  sectors: Sector[];
  totalEmployees?: number; // Adicionado como opcional, pois não aparece no print da Company
  uf?: string; // Adicionado como opcional, aparece no print da Company
}

export interface SurveyResponse {
  id: string;
  companyId: string;
  sectorId: string;
  jobFunction: string;
  completedAt: string; // Ou Date, dependendo de como você armazena
  answers: { [questionId: number]: number };
  // Pelo seu `riskCalculator.ts` e `analysisCalculator.ts`,
  // 'Evaluation' usa 'respostas: { topico: string; gravidadeNum: number }[]'.
  // Vamos adicionar isso aqui como opcional para flexibilidade.
  respostas?: { topico: string; gravidadeNum: number }[];
}

// Pelo print do Firebase, 'probability' tem 'scores' mapeado por ID do tópico/fator
export interface ProbabilityAssessment {
  id: string;
  companyId: string;
  sectorId: string;
  scores: { [factorId: number]: number }; // Ex: { '0': 2, '1': 3, ... }
}

// =============================================================================
// INTERFACE DIAGNOSTIC REPORT (AJUSTADA)
// =============================================================================

// Esta interface foi ajustada para refletir os campos 'agravosSaude', 'medidasControle'
// e 'conclusao' como strings únicas (não mais por tópico/fator),
// e 'fontesGeradoras' como um objeto por tópico/fator, conforme seus prints e pedidos.
export interface DiagnosticReport {
  id?: string; // Opcional, pode ser o ID do documento no Firestore
  companyId: string;
  sectorId: string;
  isMain?: boolean; // Pode ser opcional, conforme seu uso

  author?: string; // Nome do psicólogo/autor
  dataElaboracao?: string; // Data de elaboração do relatório
  funcoes?: string[]; // Funções avaliadas

  // Campos de texto únicos para o relatório geral (conforme solicitado e Firebase)
  agravosSaude?: string;      // Texto único para "Possíveis Agravos à Saúde Mental"
  medidasControle?: string;   // Texto único para "Medidas de Controle Existentes"
  conclusao?: string;         // Texto único para "Conclusão" (não estava no seu print, mas foi pedido)

  // Fontes geradoras por fator (mantém como objeto mapeado por ID do fator)
  fontesGeradoras: { [factorId: number]: string }; // Ex: { '0': 'NÃO HÁ', '2': 'NÃO HÁ', ... }

  createdAt?: Date | any; // Usar 'any' ou 'Timestamp' se você estiver usando o tipo do Firebase
  updatedAt?: Date | any; // Usar 'any' ou 'Timestamp' se você estiver usando o tipo do Firebase
}

// =============================================================================
// INTERFACE PSYCHOLOGIST (AJUSTADA)
// =============================================================================

// Ajustado para refletir os campos do print do Firebase para 'profiles/main_rt'
export interface Psychologist {
  id: string;
  nomeCompleto: string; // Pelo print, o campo é 'nomeCompleto'
  email: string;
  crp: string; // Pelo print, o campo é 'crp'
  telefone: string;
  endereco?: string; // Pode ser composto por logradouro, numero, bairro, cidade, uf
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  senha?: string; // Senha não deve ser exposta no frontend, mas pode estar no tipo se for para uso interno
  primeiroAcesso?: boolean;
  perguntaSeguranca?: string;
  respostaSeguranca?: string;
  // Adicione outros campos do psicólogo se houver
}

// =============================================================================
// TIPOS E INTERFACES PARA ANÁLISE DE RISCO
// =============================================================================

export type SeverityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
// Corrigido para 'Baixo', 'Médio', 'Alto', 'Crítico' para consistência de gênero
export type ProbabilityLevel = 'Improvável' | 'Possível' | 'Provável';
export type RiskMatrixLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
export interface RiskFactor {
  id: number;
  key: string;
  label: string;
  startQuestion: number;
  endQuestion: number;
}

// Interface para os dados de análise de cada fator
export interface FactorAnalysis {
  factor: RiskFactor;
  gravidade: SeverityLevel;
  gravidadeScore: number; // Adicionado para ter o valor numérico da gravidade
  probabilidade: ProbabilityLevel;
  probabilidadeScore: number; // Adicionado para ter o valor numérico da probabilidade
  matriz: RiskMatrixLevel;
}

// Interface para os dados de análise de um setor completo
export interface SectorAnalysisData {
  company: Company;
  sectorId: string; // Adicionado, pois estava faltando e causando erro
  sectorName: string;
  funcoes: string[];
  totalRespondentes: number;
  dataElaboracao: string;
  factors: FactorAnalysis[];

  // ADICIONE ESTAS PROPRIEDADES:
  gravityStats: GravityStats;
  riskMatrixStats: RiskMatrixStats;
  themes: {
    label: string;
    avgGravity: number;
    probValue: number;
    risk: RiskMatrixLevel;
  }[];
}

// Interface para o resultado do cálculo de risco (usado em riskCalculator.ts)
export interface RiskAnalysisResult {
  topico: string; // Nome do tópico/fator
  fonteGeradora: string; // Descrição da fonte geradora (pode ser o label do fator ou algo mais específico)
  gravidade: number; // Valor numérico da gravidade
  probabilidade: number; // Valor numérico da probabilidade
  risco: number; // Valor numérico do risco (gravidade * probabilidade)
  classificacao: { texto: string; cor: string }; // Classificação de risco (Baixo, Médio, etc.)
}

// Interface para a avaliação (usada em riskCalculator.ts)
// 'Evaluation' é uma SurveyResponse com um formato específico para as respostas
export interface Evaluation {
  id: string;
  companyId: string;
  sectorId: string;
  jobFunction: string;
  completedAt: string;
  respostas: { topico: string; gravidadeNum: number }[]; // Formato esperado pelo riskCalculator
}

// =============================================================================
// ESTATÍSTICAS (se você as usa)
// =============================================================================

export interface GravityStats {
  baixa: number;
  media: number;
  alta: number;
}

export interface RiskMatrixStats {
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
}