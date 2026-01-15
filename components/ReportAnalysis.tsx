import React, { useState, useEffect } from 'react';
import {
  Company,
  SurveyResponse,
  ProbabilityAssessment,
  DiagnosticReport,
  Psychologist,
  SeverityLevel,
  ProbabilityLevel,
  RiskMatrixLevel
} from '../types';
import { buildSectorAnalysisData } from '../services/analysisCalculator';
import { FileDown, Save } from 'lucide-react';

import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  ShadingType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';

interface ReportAnalysisProps {
  company: Company;
  sectorId: string;
  responses: SurveyResponse[];
  probability: ProbabilityAssessment | null;
  report: DiagnosticReport | null;
  psychologist: Psychologist | null;
  onSave: (updatedReport: Partial<DiagnosticReport>) => void;
}

const ReportAnalysis: React.FC<ReportAnalysisProps> = ({
  company,
  sectorId,
  responses,
  probability,
  report,
  psychologist,
  onSave
}) => {
  const [analysisData, setAnalysisData] = useState(
    buildSectorAnalysisData(company, sectorId, responses, probability, report)
  );

  const [generationDate] = useState<string>(
    report?.dataElaboracao || new Date().toLocaleDateString('pt-BR')
  );

  const [localReport, setLocalReport] = useState<Partial<DiagnosticReport>>({
    fontesGeradoras: report?.fontesGeradoras || {},
    agravosSaude: report?.agravosSaude || '',
    medidasControle: report?.medidasControle || '',
    conclusao: report?.conclusao || '',
  });

  useEffect(() => {
    setAnalysisData(buildSectorAnalysisData(company, sectorId, responses, probability, report));
    setLocalReport({
      fontesGeradoras: report?.fontesGeradoras || {},
      agravosSaude: report?.agravosSaude || '',
      medidasControle: report?.medidasControle || '',
      conclusao: report?.conclusao || '',
    });
  }, [company, sectorId, responses, probability, report]);

  const handleReportChange = (field: keyof DiagnosticReport, value: string) => {
    setLocalReport(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localReport);
  };

  // --- Funções auxiliares para DOCX ---
  const getRiskColor = (riskLevel: RiskMatrixLevel): string => {
    switch (riskLevel) {
      case 'Baixo': return '10B981';
      case 'Médio': return 'F59E0B';
      case 'Alto': return 'F97316';
      case 'Crítico': return '000000'; // ✅ PRETO
      default: return '000000';
    }
  };

  // ✅ getGravityColor para Gravidade (3 níveis)
  const getGravityColor = (level: SeverityLevel): string => {
    switch (level) {
      case 'Baixa': return '10B981';   // Verde
      case 'Média': return 'F59E0B';   // Amarelo
      case 'Alta': return 'EF4444';    // Vermelho
      // 'Crítica' não é um SeverityLevel, mas se fosse, seria preto
      default: return '000000';
    }
  };

  // ✅ getProbabilityColor para Probabilidade (4 níveis)
  const getProbabilityColor = (level: ProbabilityLevel): string => {
    switch (level) {
      case 'Baixo': return '10B981';   // Verde
      case 'Médio': return 'F59E0B';   // Amarelo
      case 'Alto': return 'EF4444';    // Vermelho
      case 'Crítico': return '000000'; // Preto
      default: return '000000';
    }
  };

  const createParagraphsFromText = (text: string, bold: boolean = false, size: number = 24, color: string = '000000') => {
    return text.split('\n').map((line) => new Paragraph({
      children: [new TextRun({ text: line || ' ', bold, size, color })],
      spacing: { after: 60, line: 240 },
      alignment: AlignmentType.JUSTIFIED,
    }));
  };

  // --- Mapeamento FIXO de Fontes Geradoras por Tema ---
  // A função getFonteGeradora abaixo ainda usará um mapa fixo para o DOCX,
  // mas o dado real virá do riskCalculator.ts para o objeto analysisData.factors.
  const fontesGeradorasMapForDocx: { [key: string]: string } = {
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

  const getFonteGeradora = (tema: string): string => {
    // Agora a fonte geradora deve vir do analysisData.factors.find(f => f.factor.label === tema)?.fonteGeradora
    // Mas para o DOCX, vamos manter o mapa fixo para garantir que o texto seja o esperado.
    return fontesGeradorasMapForDocx[tema] || 'Não informada';
  };

    const generateDocx = async () => {
    const psicologaNome = "Daniele Trebbi Fernandes Sofor";
    const psicologaCRP = "06/74013";

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
            },
          },
        },
        children: [

          // 🔵 TÍTULO FIXO
          new Paragraph({
            children: [
              new TextRun({
                text: `RELATÓRIO PSICOSSOCIAL – ANÁLISE DE SETOR`,
                bold: true,
                size: 24, // tamanho 12 no Word
                color: '004481',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // 🔵 DATA
          new Paragraph({
            children: [
              new TextRun({ text: `Data de Elaboração: ${generationDate}`, size: 22 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // 🔵 1 — DADOS DA EMPRESA
          new Paragraph({
            children: [new TextRun({ text: `1. DADOS DA EMPRESA`, bold: true, size: 24 })],
            spacing: { after: 80 },
          }),
          new Paragraph({ children: [new TextRun({ text: `Razão Social: ${company.razaoSocial}`, size: 22 })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: `CNPJ: ${company.cnpj}`, size: 22 })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: `Setor Avaliado: ${analysisData.sectorName}`, size: 22 })], spacing: { after: 200 } }),

          // 🔵 2 — RESPONSÁVEL TÉCNICO
          new Paragraph({
            children: [new TextRun({ text: `2. Responsável Técnico: ${psicologaNome} / CRP ${psicologaCRP}`,bold: true, size: 24 })
            ],
            spacing: { after: 300 }
            }),

          // 🔵 3 — AGRAVOS
          new Paragraph({
            children: [new TextRun({ text: `3. AGRAVOS POTENCIAIS À SAÚDE MENTAL`, bold: true, size: 24 })],
            spacing: { after: 120 },
          }),
          ...createParagraphsFromText(localReport.agravosSaude || 'Não informado.', false, 22),
          new Paragraph({ spacing: { after: 300 } }),

          // 🔵 4 — MEDIDAS DE CONTROLE
          new Paragraph({
            children: [new TextRun({ text: `4. MEDIDAS DE CONTROLE E INTERVENÇÃO`, bold: true, size: 24 })],
            spacing: { after: 120 },
          }),
          ...createParagraphsFromText(localReport.medidasControle || 'Não informado.', false, 22),
          new Paragraph({ spacing: { after: 300 } }),

          // 🔵 5 — ANÁLISE DE RISCOS (NOVO NOME)
          new Paragraph({
            children: [new TextRun({ text: `5. ANÁLISE DE RISCOS PSICOSSOCIAIS POR SETOR`, bold: true, size: 24 })],
            spacing: { after: 200 },
          }),

// 🔵 TABELA AJUSTADA (AZUL CLARO, SEM FUNDO PRETO, TEXTO CENTRALIZADO)
new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [

new TableRow({
  children: [
    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'TEMA', bold: true, size: 20, color: '#FFFFFF' })],
          alignment: AlignmentType.CENTER
        })
      ],
      shading: { fill: 'E5F1FB', type: ShadingType.SOLID },
      verticalAlign: VerticalAlign.CENTER
    }),

    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'FONTE GERADORA', bold: true, size: 20, color: '#FFFFFF' })],
          alignment: AlignmentType.CENTER
        })
      ],
      shading: { fill: 'E5F1FB', type: ShadingType.SOLID },
      verticalAlign: VerticalAlign.CENTER
    }),

    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'GRAVIDADE (SEVERIDADE)', bold: true, size: 20, color: '#FFFFFF' })],
          alignment: AlignmentType.CENTER
        })
      ],
      shading: { fill: 'E5F1FB', type: ShadingType.SOLID },
      verticalAlign: VerticalAlign.CENTER
    }),

    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'PROBABILIDADE DE OCORRÊNCIA', bold: true, size: 20, color: '#FFFFFF' })],
          alignment: AlignmentType.CENTER
        })
      ],
      shading: { fill: 'E5F1FB', type: ShadingType.SOLID },
      verticalAlign: VerticalAlign.CENTER
    }),

    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'MATRIZ DE RISCO', bold: true, size: 20, color: '#FFFFFF' })],
          alignment: AlignmentType.CENTER
        })
      ],
      shading: { fill: 'E5F1FB', type: ShadingType.SOLID },
      verticalAlign: VerticalAlign.CENTER
    }),
  ],
}),

    // 🔵 LINHAS DA TABELA
    ...analysisData.themes.map((theme) =>
      new TableRow({
        children: [

          // Tema
          new TableCell({
  children: [
    new Paragraph({
      children: [new TextRun({ text: theme.label, size: 20 })],
      alignment: AlignmentType.CENTER
    })
  ],
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 0, bottom: 0, left: 80, right: 80 } // 🔵 ZERO altura
}),

          // Fonte geradora
          new TableCell({
  children: [
    new Paragraph({
      children: [new TextRun({ text: getFonteGeradora(theme.label), size: 20 })],
      alignment: AlignmentType.CENTER
    })
  ],
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 0, bottom: 0, left: 80, right: 80 } // 🔵 ZERO altura
}),

          // Gravidade – texto Baixa / Média / Alta
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text:
                      analysisData.factors.find(f => f.factor.label === theme.label)?.gravidade || 'Baixa',
                    size: 20,
                    color: getGravityColor(
                      analysisData.factors.find(f => f.factor.label === theme.label)?.gravidade || 'Baixa'
                    )
                  })
                ],
                alignment: AlignmentType.CENTER
              })
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0, left: 100, right: 100 },
          }),

          // Probabilidade – texto Baixo / Médio / Alto / Crítico
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text:
                      analysisData.factors.find(f => f.factor.label === theme.label)?.probabilidade || 'Baixo',
                    size: 20,
                    color: getProbabilityColor(
                      analysisData.factors.find(f => f.factor.label === theme.label)?.probabilidade || 'Baixo'
                    )
                  })
                ],
                alignment: AlignmentType.CENTER
              })
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0, left: 100, right: 100 },
          }),

          // Matriz de risco
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: theme.risk,
                    size: 20,
                    color: getRiskColor(theme.risk)
                  })
                ],
                alignment: AlignmentType.CENTER
              })
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 0, bottom: 0, left: 100, right: 100 },
          }),

        ]
      })
    )

  ]
}),

          new Paragraph({ spacing: { after: 300 } }),

          // 🔵 6 — CONCLUSÃO (dentro de uma caixa/tabela)
new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
          },
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100,
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `CONCLUSÃO:`,
                  bold: true,
                  size: 24,
                  color: '000000',
                }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: localReport.conclusao || '',
                  size: 22,
                  color: '000000',
                }),
              ],
              alignment: AlignmentType.JUSTIFIED, // 🔵 JUSTIFICADO
              spacing: { line: 240, after: 60 }, // 🔵 espaçamento 1.0
            }),
          ],
        }),
      ],
    }),
  ],
}),

          // ❌ SEM assinatura no final
        ],
      }],
    });

    try {
      const blob = await Packer.toBlob(doc);
      const fileName = `Relatorio_Psicossocial_${company.nomeFantasia.replace(/\s+/g, '_')}_${analysisData.sectorName.replace(/\s+/g, '_')}.docx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Erro DOCX:', err);
      alert('Erro ao gerar arquivo.');
    }
  };

    return (
    <div className="p-8 bg-white text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#004481]">Análise de Resultados - {analysisData.sectorName}</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center space-x-2 shadow-md"
          >
            <Save className="w-5 h-5" />
            <span>Salvar Análise</span>
          </button>
          <button
            onClick={generateDocx}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
          >
            <FileDown className="w-5 h-5" />
            <span>Gerar DOCX</span>
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-8">Data de Elaboração: {generationDate}</p>

      <div className="mb-8 p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Gravidade Geral por Setor</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-100 text-green-800 rounded-lg">
            <p className="text-sm font-semibold">Baixa</p>
            <p className="text-2xl font-bold">{analysisData.gravityStats?.baixa ?? 0}</p>
          </div>
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            <p className="text-sm font-semibold">Média</p>
            <p className="text-2xl font-bold">{analysisData.gravityStats?.media ?? 0}</p>
          </div>
          <div className="p-4 bg-red-100 text-red-800 rounded-lg">
            <p className="text-sm font-semibold">Alta</p>
            <p className="text-2xl font-bold">{analysisData.gravityStats?.alta ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Matriz de Risco por Setor</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-green-100 text-green-800 rounded-lg">
            <p className="text-sm font-semibold">Baixo</p>
            <p className="text-2xl font-bold">{analysisData.riskMatrixStats?.baixo ?? 0}</p>
          </div>
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            <p className="text-sm font-semibold">Médio</p>
            <p className="text-2xl font-bold">{analysisData.riskMatrixStats?.medio ?? 0}</p>
          </div>
          <div className="p-4 bg-orange-100 text-orange-800 rounded-lg">
            <p className="text-sm font-semibold">Alto</p>
            <p className="text-2xl font-bold">{analysisData.riskMatrixStats?.alto ?? 0}</p>
          </div>
          <div className="p-4 bg-red-100 text-red-800 rounded-lg">
            <p className="text-sm font-semibold">Crítico</p>
            <p className="text-2xl font-bold">{analysisData.riskMatrixStats?.critico ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Análise por Tema</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-4 py-3 border-b-2 border-gray-200">Tema</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Fonte Geradora</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Gravidade Média</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Probabilidade</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-center">Risco</th>
              </tr>
            </thead>
            <tbody>
              {(analysisData.themes || []).map((theme, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b border-gray-200 text-sm">{theme.label}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm">{getFonteGeradora(theme.label)}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                    <span className={`font-bold ${
                      analysisData.factors.find(f => f.factor.label === theme.label)?.gravidade === 'Crítica' ? 'text-black' :
                      analysisData.factors.find(f => f.factor.label === theme.label)?.gravidade === 'Alta' ? 'text-red-600' :
                      analysisData.factors.find(f => f.factor.label === theme.label)?.gravidade === 'Média' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {theme.avgGravity.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                    <span className={`font-bold ${
                      analysisData.factors.find(f => f.factor.label === theme.label)?.probabilidade === 'Crítico' ? 'text-black' :
                      analysisData.factors.find(f => f.factor.label === theme.label)?.probabilidade === 'Alto' ? 'text-red-600' :
                      analysisData.factors.find(f => f.factor.label === theme.label)?.probabilidade === 'Médio' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {theme.probValue.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-center">
                    <span className={`font-bold ${getRiskColor(theme.risk) === '10B981' ? 'text-green-600' : getRiskColor(theme.risk) === 'F59E0B' ? 'text-yellow-600' : getRiskColor(theme.risk) === 'F97316' ? 'text-orange-600' : 'text-black'}`}>
                      {theme.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-8 p-6 border border-gray-200 rounded-xl shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Agravos Potenciais à Saúde Mental</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
            value={localReport.agravosSaude}
            onChange={e => handleReportChange('agravosSaude', e.target.value)}
            placeholder="Descreva os agravos potenciais à saúde mental..."
          ></textarea>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Medidas de Controle e Intervenção</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
            value={localReport.medidasControle}
            onChange={e => handleReportChange('medidasControle', e.target.value)}
            placeholder="Descreva as medidas de controle e intervenção propostas..."
          ></textarea>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Conclusão</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-32"
            value={localReport.conclusao}
            onChange={e => handleReportChange('conclusao', e.target.value)}
            placeholder="Escreva a conclusão do relatório..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalysis;
