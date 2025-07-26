'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// TypeScript interfaces for chart data
interface BookingData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    fill?: boolean;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointBorderWidth?: number;
    pointRadius?: number;
    pointHoverRadius?: number;
    borderWidth?: number;
  }[];
}

/**
 * VisualizationPanel displays booking trends with selectable time ranges.
 */
export const VisualizationPanel = () => {
  // Chart range state
  const [range, setRange] = useState<'7days' | 'month' | 'year'>('7days');

  // Generate last 7 days labels
  const getLast7Days = (): string[] => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  // Generate last 12 months labels
  const getLast12Months = (): string[] => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }));
    }
    return months;
  };

  // Generate last 5 years labels
  const getLast5Years = (): string[] => {
    const years: string[] = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      years.push((now.getFullYear() - i).toString());
    }
    return years;
  };

  // Chart data for each range
  const chartDataByRange: Record<'7days' | 'month' | 'year', BookingData> = {
    '7days': {
      labels: getLast7Days(),
      datasets: [
        {
          label: 'Bookings',
          data: [12, 19, 15, 25, 22, 30, 28], // Placeholder data
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    },
    'month': {
      labels: getLast12Months(),
      datasets: [
        {
          label: 'Bookings',
          data: [120, 140, 110, 180, 160, 200, 220, 210, 230, 250, 240, 260], // Placeholder data
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    },
    'year': {
      labels: getLast5Years(),
      datasets: [
        {
          label: 'Bookings',
          data: [1200, 1500, 1700, 2100, 2500], // Placeholder data
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    },
  };

  // Line chart options
  const lineOptions = {
    responsive: true,
    devicePixelRatio: 4,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Booking Trend (Last 7 Days)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        display: true,
        grid: {
          display: true,
        },
        ticks: {
          stepSize: 5,
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
      },
      line: {
        borderWidth: 3,
        tension: 0.4,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold text-gray-800">Platform Trends</h2>
        <select
          className="border text-gray-500 border-gray-300 rounded px-2 py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={range}
          onChange={e => setRange(e.target.value as '7days' | 'month' | 'year')}
        >
          <option value="7days">7 Hari Terakhir</option>
          <option value="month">12 Bulan Terakhir</option>
          <option value="year">5 Tahun Terakhir</option>
        </select>
      </div>
      {/* Line Chart - Booking Trends */}
      <div className="h-80 w-full">
        <Line data={chartDataByRange[range]} options={lineOptions} />
      </div>
    </div>
  );
};
