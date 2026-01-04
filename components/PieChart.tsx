// src/components/PieChart.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  title: string;
  labels: string[];
  data: number[];
  colors: string[];
}

const PieChart: React.FC<PieChartProps> = ({ title, labels, data, colors }) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: '#1a1a1a',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: '#000',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 p-6 shadow-2xl">
      <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-6">{title}</h3>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart;