'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface UserCompositionData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export const UserCompositionChart = () => {
  // Pie chart data - user composition
  const userCompositionData: UserCompositionData = {
    labels: ['Renters', 'Property Owners'],
    datasets: [
      {
        label: 'Users',
        data: [267, 89], // Placeholder data
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Pie chart options
  const pieOptions = {
    responsive: true,
    devicePixelRatio: 4,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    elements: {
      arc: {
        borderWidth: 3,
      },
    },
  };

  return (
    <div className="h-64 w-full flex justify-center items-center">
      <div className="w-64 h-64">
        <Pie data={userCompositionData} options={pieOptions} />
      </div>
    </div>
  );
};
