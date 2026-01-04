// types.ts

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
  totalEmployees: number;
}

export interface SurveyResponse {
  id: string;
  companyId: string;
  sectorId: string;
  jobFunction: string;
  completedAt: string;
  answers: { [questionId: number]: number };
}

export interface ProbabilityAssessment {
  id: string;
  companyId: string;
  sectorId: string;
  scores: { [topicId: number]: number };
}

export interface DiagnosticReport {
  id: string;
  companyId: string;
  sectorId: string;
  author?: string; // Pode ser opcional se o psicólogo preencher
  isMain?: boolean; // Pode ser opcional
  agravosSaude?: string; // Pode ser opcional ou ser substituído pelos agravos por tópico
  medidasControle?: string; // Pode ser opcional ou ser substituído pelas medidas por tópico
  fontesGeradoras: { [topicId: number]: string };
  // ✅ NOVOS CAMPOS PARA ANÁLISE DE RESULTADOS (por tópico)
  agravos?: { [topicId: number]: string };
  medidas?: { [topicId: number]: string };
  funcoes?: string[];
  dataElaboracao?: string;
  updatedAt?: any; // Para o Timestamp do Firebase
}

export interface Psychologist {
  id: string;
  nome: string;
  registroCRP: string;
  email: string;
  telefone: string;
  endereco: string;
  senha: string;
  primeiroAcesso: boolean;
  perguntaSeguranca: string;
  respostaSeguranca: string;
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

// ✅ NOVOS TIPOS PARA ANÁLISE DE RESULTADOS

export type SeverityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type ProbabilityLevel = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type RiskMatrixLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export interface RiskFactor {
  id: number;
  key: string;
  label: string;
  startQuestion: number;
  endQuestion: number;
}

export interface FactorAnalysis {
  factor: RiskFactor;
  fonteGeradora: string;
  gravidade: SeverityLevel;
  gravidadeScore: number;
  probabilidade: ProbabilityLevel;
  probabilidadeScore: number;
  matriz: RiskMatrixLevel;
  agravos?: string;
  medidas?: string;
}

export interface SectorAnalysisData {
  company: Company;
  sectorName: string;
  funcoes: string[];
  totalRespondentes: number;
  dataElaboracao: string;
  factors: FactorAnalysis[];
}