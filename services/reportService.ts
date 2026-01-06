// services/reportService.ts

import { db } from '../firebaseConfig'; // <<<<<<< VERIFIQUE E AJUSTE ESTE CAMINHO PARA O SEU PROJETO >>>>>>>
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { DiagnosticReport } from '../types';

const REPORTS_COLLECTION = 'reports';

/**
 * Salva ou atualiza um relatório de diagnóstico no Firestore.
 * Se o documento já existe, faz update. Se não, cria novo.
 */
export const saveDiagnosticReport = async (
  companyId: string,
  sectorId: string,
  reportData: Partial<DiagnosticReport>,
  isMain: boolean = true
): Promise<string> => {
  try {
    // Gera um ID único baseado em companyId + sectorId
    const reportId = `${companyId}_${sectorId}`;

    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    const existingDoc = await getDoc(reportRef);

    const dataToSave: Partial<DiagnosticReport> = {
      ...reportData,
      companyId,
      sectorId,
      isMain,
      updatedAt: Timestamp.now() // Usar Timestamp do Firebase
    };

    if (existingDoc.exists()) {
      // Atualiza documento existente
      await updateDoc(reportRef, dataToSave);
      console.log('Relatório atualizado:', reportId);
    } else {
      // Cria novo documento
      await setDoc(reportRef, {
        ...dataToSave,
        createdAt: Timestamp.now(), // Usar Timestamp do Firebase
        id: reportId
      });
      console.log('Novo relatório criado:', reportId);
    }

    return reportId;
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    throw error;
  }
};

/**
 * Busca um relatório existente pelo companyId e sectorId
 */
export const getDiagnosticReport = async (
  companyId: string,
  sectorId: string
): Promise<DiagnosticReport | null> => {
  try {
    const reportId = `${companyId}_${sectorId}`;
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    const docSnap = await getDoc(reportRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DiagnosticReport;
      // Converte Timestamps de volta para Date se necessário no front-end
      // Ex: data.createdAt = (data.createdAt as any)?.toDate();
      // data.updatedAt = (data.updatedAt as any)?.toDate();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    throw error;
  }
};