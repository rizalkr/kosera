import React from 'react';
import { SellerKosTab } from '@/hooks/seller/kos/useSellerKosDetailView';

export interface TabsNavProps {
  activeTab: SellerKosTab;
  onChange: (t: SellerKosTab) => void;
}

const tabs: { id: SellerKosTab; label: string }[] = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'bookings', label: '📋 Booking' },
  { id: 'analytics', label: '📈 Analitik' },
  { id: 'settings', label: '⚙️ Pengaturan' },
];

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onChange }) => (
  <div className="border-b border-gray-200">
    <nav className="flex space-x-8 px-8">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{tab.label}</button>
      ))}
    </nav>
  </div>
);
