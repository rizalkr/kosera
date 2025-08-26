// src/components/molecules/KosCard.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardFooter } from '@/components/atoms';
import type { AdminKosData } from '@/types/kos';
import { formatCurrency } from '@/utils/format';

// Extended statistics interface (API nested object)
export interface KosStatistics {
  totalBookings: number;
  pendingBookings: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalRooms: number;
  totalRevenue: number;
  totalRoomsRentedOut: number;
}

// Allow kosData to optionally carry a nested statistics block from API
export interface KosWithStatistics extends AdminKosData {
  statistics?: KosStatistics;
}

export interface KosCardProps {
  kosData: KosWithStatistics;
  formatCurrency?: (amount: number) => string; // optional override
}

/**
 * Molecule: KosCard - summary card for a kos property.
 * Supports both flattened and nested (statistics) metrics.
 */
export const KosCard: React.FC<KosCardProps> = ({ kosData, formatCurrency: formatFn = formatCurrency }) => {
  const router = useRouter();
  const stats = kosData.statistics; // may be undefined if API flattened later

  // Helper for safe numeric extraction
  const num = (value: unknown, fallback = 0) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

  // Prefer flattened root (if later we decide to flatten API) then fallback to nested statistics
  const totalRooms = num((kosData as any).totalRooms ?? stats?.totalRooms);
  const occupiedRooms = num((kosData as any).occupiedRooms ?? stats?.occupiedRooms);
  const vacantRooms = num((kosData as any).vacantRooms ?? stats?.vacantRooms ?? (totalRooms - occupiedRooms));
  const totalBookings = num((kosData as any).totalBookings ?? stats?.totalBookings);
  const pendingBookings = num((kosData as any).pendingBookings ?? stats?.pendingBookings);
  const totalRevenue = num((kosData as any).totalRevenue ?? stats?.totalRevenue);
  const totalRoomsRentedOut = num((kosData as any).totalRoomsRentedOut ?? stats?.totalRoomsRentedOut);
  const viewCount = num(kosData.viewCount);
  const price = num(kosData.price);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <Card className="border border-gray-200 overflow-hidden" padding="lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{kosData.name}</h3>
          <p className="text-sm text-gray-600">{kosData.city}</p>
          <p className="text-xs text-gray-500 mt-1">{kosData.address}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">{formatFn(price)}</p>
          <p className="text-xs text-gray-500">per bulan</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xl font-bold text-blue-600">{totalBookings}</p>
          <p className="text-xs text-blue-600">Total Booking</p>
          {pendingBookings > 0 && (
            <p className="text-[10px] text-blue-500 mt-1">{pendingBookings} pending</p>
          )}
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xl font-bold text-green-600">{viewCount}</p>
          <p className="text-xs text-green-600">Dilihat</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-xl font-bold text-yellow-600">{occupiedRooms}</p>
          <p className="text-xs text-yellow-600">Terisi</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xl font-bold text-purple-600">{vacantRooms}</p>
          <p className="text-xs text-purple-600">Kosong</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tingkat Hunian</span>
          <span className="text-sm font-semibold text-gray-500">{occupancyRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-gray-600">Total Pendapatan</span>
          <span className="text-sm font-semibold text-green-600">
            {formatFn(totalRevenue)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Kamar Tersewa (Historis)</span>
          <span className="text-sm font-semibold text-gray-500">{totalRoomsRentedOut}</span>
        </div>
      </div>

      <CardFooter className="flex justify-between items-center mt-6">
        <p className="text-xs text-gray-500">
          Dibuat {new Date(kosData.createdAt).toLocaleDateString()}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/seller/kos/${kosData.id}`)}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Lihat
          </button>
          <button
            onClick={() => router.push(`/seller/kos/${kosData.id}/edit`)}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};
