// services/riskFactors.ts

import { RiskFactor } from '../types';

export const RISK_FACTORS: RiskFactor[] = [
  {
    id: 1,
    key: 'assedio',
    label: 'Assédio Moral e Sexual',
    startQuestion: 1,
    endQuestion: 10
  },
  {
    id: 2,
    key: 'carga',
    label: 'Carga Excessiva de Trabalho',
    startQuestion: 11,
    endQuestion: 20
  },
  {
    id: 3,
    key: 'reconhecimento',
    label: 'Falta de Reconhecimento e Recompensas',
    startQuestion: 21,
    endQuestion: 30
  },
  {
    id: 4,
    key: 'clima',
    label: 'Clima Organizacional',
    startQuestion: 31,
    endQuestion: 40
  },
  {
    id: 5,
    key: 'autonomia',
    label: 'Falta de Autonomia e Controle sobre o Trabalho',
    startQuestion: 41,
    endQuestion: 50
  },
  {
    id: 6,
    key: 'pressao',
    label: 'Pressão e Metas Irrealistas',
    startQuestion: 51,
    endQuestion: 60
  },
  {
    id: 7,
    key: 'inseguranca',
    label: 'Insegurança e Ameaças',
    startQuestion: 61,
    endQuestion: 70
  },
  {
    id: 8,
    key: 'conflitos',
    label: 'Conflitos Interpessoais e Falta de Comunicação',
    startQuestion: 71,
    endQuestion: 80
  },
  {
    id: 9,
    key: 'alinhamento',
    label: 'Alinhamento entre Vida Pessoal e Profissional',
    startQuestion: 81,
    endQuestion: 90
  }
];