// Seller dashboard organism: TipsInsightsPanel
'use client';
import React from 'react';

export interface TipsInsightsStats {
  totalPendingBookings: number;
  totalVacantRooms: number;
  totalOccupiedRooms: number;
  totalViews: number;
  totalBookings: number;
  totalRooms: number;
}

export interface TipsInsightsPanelProps {
  stats?: TipsInsightsStats; // optional to avoid undefined access
  kosCount: number;
}

export const TipsInsightsPanel: React.FC<TipsInsightsPanelProps> = ({ stats, kosCount }) => {
  if (kosCount === 0 || !stats) return null; // guard
  const {
    totalPendingBookings = 0,
    totalVacantRooms = 0,
    totalOccupiedRooms = 0,
    totalViews = 0,
    totalBookings = 0,
    totalRooms = 0,
  } = stats;
  const highOccupancy = totalRooms > 0 && totalOccupiedRooms / totalRooms >= 0.8;
  const occupancyPct = totalRooms > 0 ? Math.round((totalOccupiedRooms / totalRooms) * 100) : 0;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips & Insights</h3>
      <div className="space-y-3">
        {totalPendingBookings > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Perlu Tindakan:</span> Anda memiliki {totalPendingBookings} booking yang menunggu perhatian Anda.
            </p>
          </div>
        )}
        {totalVacantRooms > totalOccupiedRooms && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Peluang:</span> Anda memiliki {totalVacantRooms} kamar kosong. Pertimbangkan untuk mempromosikan properti atau menyesuaikan harga.
            </p>
          </div>
        )}
        {totalViews > 0 && totalBookings === 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Tips:</span> Properti Anda mendapat banyak views tapi belum ada booking. Pertimbangkan untuk memperbaiki deskripsi atau menambah foto.
            </p>
          </div>
        )}
        {highOccupancy && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Kerja Bagus!</span> Tingkat hunian Anda {occupancyPct}%. Pertimbangkan untuk mengembangkan portofolio!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
