import React, { useState, useMemo } from 'react';
import { Company, ProbabilityAssessment } from './types';
import { LOGO_URL } from './constants';
import { ArrowLeft, Printer, Save } from 'lucide-react';

interface ReportEditorProps {
  company: Company;
  sectorId: string;
  probability: ProbabilityAssessment | null;
  onBack: () => void;
}

const ReportEditor: React.FC<ReportEditorProps> = ({
  company,
  sectorId,
  probability,
  onBack
}) => {
  const [sumario, setSumario] = useState(
    'Descreva aqui, em linguagem técnica porém acessível, o contexto geral do setor.'
  );

  const [fontesGeradoras, setFontesGeradoras] = useState(
    'Exemplo:\n- Exigência constante de atendimento simultâneo a múltiplas demandas;\n- Falhas na comunicação entre liderança e equipe.'
  );

  const [agravos, setAgravos] = useState(
    'Exemplo:\n- Aumento do risco de quadros de estresse ocupacional;\n- Maior probabilidade de conflitos interpessoais.'
  );

  const [medidasControle, setMedidasControle] = useState(
    'Exemplo:\n- Implementar espaços formais de feedback;\n- Revisar a distribuição de tarefas.'
  );

  const [saved, setSaved] = useState(false);

  const sector = useMemo(
    () => company.sectors.find((s) => s.id === sectorId),
    [company, sectorId]
  );

  const matrixStats = useMemo(() => {
    const base = { baixo: 0, medio: 0, alto: 0, critico: 0 };
    if (!probability) return base;

    Object.values(probability.scores).forEach((v) => {
      const value = Number(v);
      if (value === 1) base.baixo++;
      else if (value === 2) base.medio++;
      else if (value === 3) base.alto++;
      else if (value >= 4) base.critico++;
    });

    return base;
  }, [probability]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    console.log('✅ Devolutiva salva');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-4 print:hidden flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-cyan-300 hover:text-cyan-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <div className="flex items-center space-x-3">
          {saved && <span className="text-green-400 text-sm">Salvo!</span>}
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
          >
            <Save className="w-5 h-5" />
            <span>Salvar</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg"
          >
            <Printer className="w-5 h-5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white text-black rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-300 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Relatório Psicossocial</h1>
            <p className="text-sm text-gray-600">DRPS</p>
          </div>
          <div className="text-right text-sm">
            <p><strong>Empresa:</strong> {company.nomeFantasia}</p>
            <p><strong>Setor:</strong> {sector?.name}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">1. Sumário</h2>
          <textarea
            value={sumario}
            onChange={(e) => setSumario(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-md p-3 text-sm min-h-[120px]"
          />
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Matriz de Risco</h3>
          <table className="w-full text-sm border-2 border-gray-300">
            <thead className="bg-cyan-100">
              <tr>
                <th className="border px-3 py-2 text-left">Nível</th>
                <th className="border px-3 py-2 text-center">Qtde</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-green-50">
                <td className="border px-3 py-2">Baixo</td>
                <td className="border px-3 py-2 text-center">{matrixStats.baixo}</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className="border px-3 py-2">Médio</td>
                <td className="border px-3 py-2 text-center">{matrixStats.medio}</td>
              </tr>
              <tr className="bg-orange-50">
                <td className="border px-3 py-2">Alto</td>
                <td className="border px-3 py-2 text-center">{matrixStats.alto}</td>
              </tr>
              <tr className="bg-red-50">
                <td className="border px-3 py-2">Crítico</td>
                <td className="border px-3 py-2 text-center">{matrixStats.critico}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">2. Fontes Geradoras</h2>
          <textarea
            value={fontesGeradoras}
            onChange={(e) => setFontesGeradoras(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-md p-3 text-sm min-h-[160px]"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">3. Agravos</h2>
          <textarea
            value={agravos}
            onChange={(e) => setAgravos(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-md p-3 text-sm min-h-[160px]"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">4. Medidas de Controle</h2>
          <textarea
            value={medidasControle}
            onChange={(e) => setMedidasControle(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-md p-3 text-sm min-h-[180px]"
          />
        </div>
      </div>

      <style>
        {`
        @media print {
          .print\\:hidden { display: none !important; }
        }
      `}
      </style>
    </div>
  );
};

export default ReportEditor;