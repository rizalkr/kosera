import React from 'react';

interface QuickAction {
  label: string;
  icon: string;
  href: string;
  color: string;
  hover: string;
}

export interface QuickActionsPanelProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { label: 'Kelola Users', icon: '👤', href: '/admin/users', color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
  { label: 'Kelola Kos', icon: '🏠', href: '/admin/kos', color: 'bg-green-600', hover: 'hover:bg-green-700' },
  { label: 'Kelola Booking', icon: '📅', href: '/admin/bookings', color: 'bg-purple-600', hover: 'hover:bg-purple-700' },
  { label: 'Lihat Laporan', icon: '📊', href: '/admin/reports', color: 'bg-orange-600', hover: 'hover:bg-orange-700' },
];

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ actions = defaultActions }) => (
  <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map(action => (
        <button
          key={action.href}
            onClick={() => (window.location.href = action.href)}
          className={`${action.color} text-white px-6 py-3 rounded-lg ${action.hover} transition-colors text-center`}
        >
          <div className="text-2xl mb-2" aria-hidden>{action.icon}</div>
          <div className="text-sm">{action.label}</div>
        </button>
      ))}
    </div>
  </div>
);
