import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  value: React.ReactNode;
  label: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow';
  extra?: React.ReactNode;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
};

export const StatCard: React.FC<StatCardProps> = ({ value, label, color = 'blue', extra }) => (
  <div className={cn('rounded-xl p-6 border', colorMap[color])}>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm mt-1">{label}</div>
    {extra && <div className="text-xs mt-2">{extra}</div>}
  </div>
);
