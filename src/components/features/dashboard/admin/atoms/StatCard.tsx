import React from 'react';

export interface StatCardProps {
  label: string;
  value: number | string | undefined;
  icon: string;
  colorClass: string; // e.g. text-blue-600
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{(typeof value === 'number' ? value.toLocaleString() : value) || '0'}</p>
      </div>
      <div className="text-3xl" aria-hidden>{icon}</div>
    </div>
  </div>
);
