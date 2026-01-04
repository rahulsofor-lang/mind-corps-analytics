import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
import {
  Company,
  SurveyResponse,
  ProbabilityAssessment,
  DiagnosticReport,
  Psychologist // Mantido para tipagem, mas as funções de perfil foram removidas
} from '../types';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ COLEÇÕES DO FIREBASE
export const collections = {
  COMPANIES: 'companies',
  RESPONSES: 'responses',
  PROBABILITY: 'probability',
  REPORTS: 'reports',
  PROFILES: 'profiles' // Mantido caso outras partes do app usem, mas não para login
};

// ✅ 1. BUSCAR TODAS AS EMPRESAS
export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const snapshot = await getDocs(collection(db, collections.COMPANIES));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Company[];
  } catch (error) {
    console.error('❌ Erro ao buscar empresas:', error);
    return [];
  }
};

// ✅ 2. BUSCAR UMA EMPRESA POR ID
export const fetchCompanyById = async (companyId: string): Promise<Company | null> => {
  try {
    const docRef = doc(db, collections.COMPANIES, companyId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Company;
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    return null;
  }
};

// ✅ 3. BUSCAR RESPOSTAS DE UMA EMPRESA
export const fetchResponsesByCompany = async (
  companyId: string
): Promise<SurveyResponse[]> => {
  try {
    const q = query(
      collection(db, collections.RESPONSES),
      where('companyId', '==', companyId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as SurveyResponse[];
  } catch (error) {
    console.error('❌ Erro ao buscar respostas:', error);
    return [];
  }
};

// ✅ 4. BUSCAR RESPOSTAS DE UM SETOR
export const fetchResponsesBySector = async (
  companyId: string,
  sectorId: string
): Promise<SurveyResponse[]> => {
  try {
    const q = query(
      collection(db, collections.RESPONSES),
      where('companyId', '==', companyId),
      where('sectorId', '==', sectorId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as SurveyResponse[];
  } catch (error) {
    console.error('❌ Erro ao buscar respostas por setor:', error);
    return [];
  }
};

// ✅ 5. BUSCAR PROBABILIDADE DE UM SETOR (COM AJUSTE 4→3)
export const fetchProbabilityBySector = async (
  companyId: string,
  sectorId: string
): Promise<ProbabilityAssessment | null> => {
  try {
    const probId = `${companyId}_${sectorId}`;
    const docSnap = await getDoc(doc(db, collections.PROBABILITY, probId));

    if (!docSnap.exists()) {
      console.log(`⚠️ Nenhuma probabilidade encontrada para o setor ${sectorId}`);
      return null;
    }

    const data = docSnap.data() as ProbabilityAssessment;

    // CONVERTER SCORE 4 PARA 3
    const adjustedScores: { [key: number]: number } = {};
    Object.entries(data.scores).forEach(([key, value]) => {
      const v = Number(value);
      adjustedScores[Number(key)] = v >= 4 ? 3 : v;
    });

    return {
      ...data,
      id: docSnap.id,
      scores: adjustedScores
    };
  } catch (error) {
    console.error('❌ Erro ao buscar probabilidade:', error);
    return null;
  }
};

// ✅ 6. BUSCAR LAUDO (DEVOLUTIVA) DE UM SETOR
export const fetchReportBySector = async (
  companyId: string,
  sectorId: string
): Promise<DiagnosticReport | null> => {
  try {
    const reportId = `${companyId}_${sectorId}`;
    const docSnap = await getDoc(doc(db, collections.REPORTS, reportId));

    if (!docSnap.exists()) {
      console.log(`⚠️ Nenhum laudo encontrado para o setor ${sectorId}`);
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as DiagnosticReport;
  } catch (error) {
    console.error('❌ Erro ao buscar laudo:', error);
    return null;
  }
};

// ✅ 7. BUSCAR TODOS OS LAUDOS DE UMA EMPRESA
export const fetchReportsByCompany = async (
  companyId: string
): Promise<DiagnosticReport[]> => {
  try {
    const q = query(
      collection(db, collections.REPORTS),
      where('companyId', '==', companyId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as DiagnosticReport[];
  } catch (error) {
    console.error('❌ Erro ao buscar laudos:', error);
    return [];
  }
};

// ❌ REMOVIDO: 8. BUSCAR PSICÓLOGO (PARA LOGIN)
// export const fetchPsychologist = async (): Promise<Psychologist | null> => { /* ... */ };

// ❌ REMOVIDO: 9. CRIAR PSICÓLOGO PADRÃO (PRIMEIRO ACESSO)
// export const createDefaultPsychologist = async (): Promise<void> => { /* ... */ };

// ❌ REMOVIDO: 10. ATUALIZAR SENHA E PERGUNTA (PRIMEIRO ACESSO)
// export const updatePsychologistPassword = async ( /* ... */ ): Promise<void> => { /* ... */ };

// ❌ REMOVIDO: 11. RECUPERAR SENHA (ESQUECI A SENHA)
// export const resetPassword = async ( /* ... */ ): Promise<boolean> => { /* ... */ };

// ✅ 12. SALVAR/ATUALIZAR ANÁLISE DE RESULTADOS
export const saveReportAnalysis = async (
  companyId: string,
  sectorId: string,
  updatedReport: Partial<DiagnosticReport>
): Promise<void> => {
  try {
    const reportId = `${companyId}_${sectorId}`;
    const reportRef = doc(db, collections.REPORTS, reportId);

    // Adiciona ou atualiza o campo updatedAt com o Timestamp do Firebase
    await setDoc(reportRef, { ...updatedReport, updatedAt: Timestamp.now() }, { merge: true });
    console.log('✅ Análise de resultados salva/atualizada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao salvar/atualizar análise de resultados:', error);
    throw error;
  }
};