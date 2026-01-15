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
  Psychologist
} from '../types';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const collections = {
  COMPANIES: 'companies',
  RESPONSES: 'responses',
  PROBABILITY: 'probability',
  REPORTS: 'reports',
  PROFILES: 'profiles'
};

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

// ✅ AGORA SEM AJUSTE 4→3
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

    return {
      ...data,
      id: docSnap.id,
      scores: data.scores
    };
  } catch (error) {
    console.error('❌ Erro ao buscar probabilidade:', error);
    return null;
  }
};

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

export const saveReportAnalysis = async (
  companyId: string,
  sectorId: string,
  updatedReport: Partial<DiagnosticReport>
): Promise<void> => {
  try {
    const reportId = `${companyId}_${sectorId}`;
    const reportRef = doc(db, collections.REPORTS, reportId);

    await setDoc(reportRef, { ...updatedReport, updatedAt: Timestamp.now() }, { merge: true });
    console.log('✅ Análise de resultados salva/atualizada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao salvar/atualizar análise de resultados:', error);
    throw error;
  }
};
