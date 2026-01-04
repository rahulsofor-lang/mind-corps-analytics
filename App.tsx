import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ReportEditor from './ReportEditor';
import { Company, ProbabilityAssessment } from './types';

type Screen = 'login' | 'dashboard' | 'report';

interface ReportContext {
  company: Company;
  sectorId: string;
  probability: ProbabilityAssessment | null;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [reportContext, setReportContext] = useState<ReportContext | null>(null);

  return (
    <>
      {currentScreen === 'login' && (
        <Login
          onLoginSuccess={() => setCurrentScreen('dashboard')}
        />
      )}

      {currentScreen === 'dashboard' && (
        <Dashboard
          onLogout={() => setCurrentScreen('login')}
          onOpenReport={({ company, sectorId, probability }) => {
            setReportContext({ company, sectorId, probability });
            setCurrentScreen('report');
          }}
        />
      )}

      {currentScreen === 'report' && reportContext && (
        <ReportEditor
          company={reportContext.company}
          sectorId={reportContext.sectorId}
          probability={reportContext.probability}
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}
    </>
  );
};

export default App;