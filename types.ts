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
  totalEmployees?: number;
  uf?: string;
}

export interface SurveyResponse {
  id: string;
  companyId: string;
  sectorId: string;
  jobFunction: string;
  completedAt: string;
  answers: { [questionId: number]: number };
  respostas?: { topico: string; gravidadeNum: number }[];
}

export interface ProbabilityAssessment {
  id: string;
  companyId: string;
  sectorId: string;
  scores: { [factorId: number]: number };
}

export interface DiagnosticReport {
  id?: string;
  companyId: string;
  sectorId: string;
  isMain?: boolean;

  author?: string;
  dataElaboracao?: string;
  funcoes?: string[];

  agravosSaude?: string;
  medidasControle?: string;
  conclusao?: string;

  fontesGeradoras: { [factorId: number]: string };

  createdAt?: Date | any;
  updatedAt?: Date | any;
}

export interface Psychologist {
  id: string;
  nomeCompleto: string;
  email: string;
  crp: string;
  telefone: string;
  endereco?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  senha?: string;
  primeiroAcesso?: boolean;
  perguntaSeguranca?: string;
  respostaSeguranca?: string;
}

// =============================================================================
// TIPOS E INTERFACES PARA ANÁLISE DE RISCO
// =============================================================================

export type SeverityLevel = 'Baixa' | 'Média' | 'Alta';
// ✅ CORRIGIDO: Agora com 3 NÍVEIS, alinhado com a explicação e analysisCalculator.ts
export type ProbabilityLevel = 'Baixa' | 'Média' | 'Alta';
export type RiskMatrixLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'; // Este continua com 4 níveis, conforme a NR 01

export interface RiskFactor {
  id: number;
  key: string;
  label: string;
  startQuestion: number;
  endQuestion: number;
}

export interface FactorAnalysis {
  factor: RiskFactor;
  gravidade: SeverityLevel;
  gravidadeScore: number;
  probabilidade: ProbabilityLevel;
  probabilidadeScore: number;
  matriz: RiskMatrixLevel;
}

export interface SectorAnalysisData {
  company: Company;
  sectorId: string;
  sectorName: string;
  funcoes: string[];
  totalRespondentes: number;
  dataElaboracao: string;
  factors: FactorAnalysis[];

  gravityStats: GravityStats;
  riskMatrixStats: RiskMatrixStats;
  themes: {
    label: string;
    avgGravity: number;
    probValue: number;
    risk: RiskMatrixLevel;
  }[];
}

export interface RiskAnalysisResult {
  topico: string;
  fonteGeradora: string;
  gravidade: number;
  probabilidade: number;
  risco: number;
  classificacao: { texto: string; cor: string };
}

export interface Evaluation {
  id: string;
  companyId: string;
  sectorId: string;
  jobFunction: string;
  completedAt: string;
  respostas: { topico: string; gravidadeNum: number }[];
}

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
