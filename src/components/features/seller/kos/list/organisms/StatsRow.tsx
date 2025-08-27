import React from 'react';

export interface StatsRowProps {
  counts: { totalKos: number; activeKos: number; pendingKos: number; totalPrice: number };
  formatTotalPrice: () => string;
}

export const StatsRow: React.FC<StatsRowProps> = ({ counts, formatTotalPrice }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-blue-600">{counts.totalKos}</div>
      <div className="text-sm text-gray-600">Total Kos</div>
    </div>
    <div className="bg-green-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-green-600">{counts.activeKos}</div>
      <div className="text-sm text-gray-600">Kos Aktif</div>
    </div>
    <div className="bg-yellow-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-yellow-600">{counts.pendingKos}</div>
      <div className="text-sm text-gray-600">Menunggu Verifikasi</div>
    </div>
    <div className="bg-purple-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-purple-600">{formatTotalPrice()}</div>
      <div className="text-sm text-gray-600">Total Harga</div>
    </div>
  </div>
);
