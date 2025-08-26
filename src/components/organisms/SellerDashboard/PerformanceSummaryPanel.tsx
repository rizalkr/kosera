// Seller dashboard organism: PerformanceSummaryPanel
'use client';
import React from 'react';
import { formatCurrency } from '@/utils/format';

export interface PerformanceSummaryPanelProps {
  stats: {
    totalRooms: number;
    totalOccupiedRooms: number;
    totalViews: number;
    totalRevenue: number;
  };
  kosCount: number;
}

export const PerformanceSummaryPanel: React.FC<PerformanceSummaryPanelProps> = ({ stats, kosCount }) => {
  if (kosCount === 0) return null;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Performa</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.totalRooms > 0 ? Math.round((stats.totalOccupiedRooms / stats.totalRooms) * 100) : 0}%
          </div>
          <p className="text-sm text-gray-600">Rata-rata Tingkat Hunian</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalOccupiedRooms} dari {stats.totalRooms} kamar terisi
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {kosCount > 0 ? Math.round(stats.totalViews / kosCount) : 0}
          </div>
          <p className="text-sm text-gray-600">Rata-rata Dilihat per Kos</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalViews} total dilihat
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {kosCount > 0 ? Math.round(stats.totalRevenue / kosCount) : 0}
          </div>
          <p className="text-sm text-gray-600">Rata-rata Pendapatan per Kos</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(stats.totalRevenue)} total
          </p>
        </div>
      </div>
    </div>
  );
};
