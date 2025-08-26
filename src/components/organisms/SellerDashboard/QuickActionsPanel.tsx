// Seller dashboard organism: QuickActionsPanel
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export interface QuickActionsPanelProps {
  hasKos: boolean;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ hasKos }) => {
  const router = useRouter();
  if (!hasKos) return null;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/seller/analytics')}
          className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 p-4 rounded-lg transition-colors"
        >
          <span>📊</span>
          <span>Lihat Analitik</span>
        </button>
        <button
          onClick={() => router.push('/seller/kos/add')}
          className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-600 p-4 rounded-lg transition-colors"
        >
          <span>➕</span>
          <span>Tambah Kos Baru</span>
        </button>
        <button
          onClick={() => router.push('/seller/bookings')}
          className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-600 p-4 rounded-lg transition-colors"
        >
          <span>📋</span>
          <span>Kelola Booking</span>
        </button>
      </div>
    </div>
  );
};
