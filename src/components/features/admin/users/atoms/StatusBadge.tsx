import React from 'react';

export interface StatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const active = status === 'ACTIVE';
  return (
    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  );
};
