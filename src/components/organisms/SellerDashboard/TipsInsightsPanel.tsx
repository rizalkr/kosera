// Seller dashboard organism: TipsInsightsPanel
'use client';
import React from 'react';

export interface TipsInsightsPanelProps {
  stats: {
    totalPendingBookings: number;
    totalVacantRooms: number;
    totalOccupiedRooms: number;
    totalViews: number;
    totalBookings: number;
    totalRooms: number;
  };
  kosCount: number;
}

export const TipsInsightsPanel: React.FC<TipsInsightsPanelProps> = ({ stats, kosCount }) => {
  if (kosCount === 0) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips & Insights</h3>
      <div className="space-y-3">
        {stats.totalPendingBookings > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Perlu Tindakan:</span> Anda memiliki {stats.totalPendingBookings} booking yang menunggu perhatian Anda.
            </p>
          </div>
        )}
        {stats.totalVacantRooms > stats.totalOccupiedRooms && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Peluang:</span> Anda memiliki {stats.totalVacantRooms} kamar kosong. Pertimbangkan untuk mempromosikan properti atau menyesuaikan harga.
            </p>
          </div>
        )}
        {stats.totalViews > 0 && stats.totalBookings === 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Tips:</span> Properti Anda mendapat banyak views tapi belum ada booking. Pertimbangkan untuk memperbaiki deskripsi atau menambah foto.
            </p>
          </div>
        )}
        {stats.totalRooms > 0 && stats.totalOccupiedRooms / stats.totalRooms >= 0.8 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Kerja Bagus!</span> Tingkat hunian Anda {Math.round((stats.totalOccupiedRooms / stats.totalRooms) * 100)}%. Pertimbangkan untuk mengembangkan portofolio!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
