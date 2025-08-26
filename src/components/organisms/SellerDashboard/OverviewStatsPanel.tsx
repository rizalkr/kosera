// Seller dashboard organism: OverviewStatsPanel
'use client';
import React from 'react';
import { StatCard } from '@/components/molecules';
import { formatCurrency } from '@/utils/format';

export interface OverviewStatsValues {
  totalKos: number;
  totalBookings: number;
  totalPendingBookings: number;
  totalOccupiedRooms: number;
  totalRooms: number;
  totalVacantRooms: number;
  totalRevenue: number;
  totalViews: number;
  totalFavorites: number;
}

export interface OverviewStatsPanelProps {
  stats?: OverviewStatsValues; // made optional to avoid runtime error when undefined
}

export const OverviewStatsPanel: React.FC<OverviewStatsPanelProps> = ({ stats }) => {
  if (!stats) return null; // guard when data not yet available
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Kos" value={stats.totalKos ?? 0} icon="🏠" color="blue" />
        <StatCard title="Total Booking" value={stats.totalBookings ?? 0} subtitle={`${stats.totalPendingBookings ?? 0} menunggu`} icon="📋" color="green" />
        <StatCard title="Kamar Terisi" value={`${stats.totalOccupiedRooms ?? 0}/${stats.totalRooms ?? 0}`} subtitle={`${stats.totalVacantRooms ?? 0} kosong`} icon="🛏️" color="yellow" />
        <StatCard title="Total Pendapatan" value={formatCurrency(stats.totalRevenue ?? 0)} icon="💰" color="purple" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="Total Dilihat" value={(stats.totalViews ?? 0).toLocaleString()} subtitle="di semua properti" icon="👁️" color="blue" />
        <StatCard title="Total Favorit" value={(stats.totalFavorites ?? 0).toLocaleString()} subtitle="disimpan pengguna" icon="❤️" color="red" />
      </div>
    </>
  );
};
