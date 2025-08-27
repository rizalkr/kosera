import React from 'react';

export interface StatItemProps {
  label: string;
  value: string | number;
}

export const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-500">{value}</span>
  </div>
);
