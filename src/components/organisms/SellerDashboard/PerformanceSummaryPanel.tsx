// Seller dashboard organism: PerformanceSummaryPanel
'use client';
import React from 'react';
import { formatCurrency } from '@/utils/format';

export interface PerformanceSummaryPanelProps {
  stats?: { // made optional to avoid undefined access
    totalRooms: number;
    totalOccupiedRooms: number;
    totalViews: number;
    totalRevenue: number;
  };
  kosCount: number;
}

export const PerformanceSummaryPanel: React.FC<PerformanceSummaryPanelProps> = ({ stats, kosCount }) => {
  if (!stats || kosCount === 0) return null; // guard when stats not ready or no kos
  const { totalRooms = 0, totalOccupiedRooms = 0, totalViews = 0, totalRevenue = 0 } = stats;
  const occupancyPct = totalRooms > 0 ? Math.round((totalOccupiedRooms / totalRooms) * 100) : 0;
  const avgViews = kosCount > 0 ? Math.round(totalViews / kosCount) : 0;
  const avgRevenue = kosCount > 0 ? Math.round(totalRevenue / kosCount) : 0;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Performa</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{occupancyPct}%</div>
          <p className="text-sm text-gray-600">Rata-rata Tingkat Hunian</p>
          <p className="text-xs text-gray-500 mt-1">{totalOccupiedRooms} dari {totalRooms} kamar terisi</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{avgViews}</div>
          <p className="text-sm text-gray-600">Rata-rata Dilihat per Kos</p>
          <p className="text-xs text-gray-500 mt-1">{totalViews} total dilihat</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">{avgRevenue}</div>
          <p className="text-sm text-gray-600">Rata-rata Pendapatan per Kos</p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(totalRevenue)} total</p>
        </div>
      </div>
    </div>
  );
};
