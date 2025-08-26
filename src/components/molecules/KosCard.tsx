// src/components/molecules/KosCard.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardFooter } from '@/components/atoms';
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

// Minimal shape required by the card (works for both AdminKosData & SellerDashboardKosItem)
export interface KosCardBase {
  id: number;
  name: string;
  city: string;
  address: string;
  price: number;
  viewCount: number;
  createdAt: string;
  // Optional flattened metrics (some APIs may surface these at root)
  totalRooms?: number;
  occupiedRooms?: number;
  vacantRooms?: number;
  totalBookings?: number;
  pendingBookings?: number;
  totalRevenue?: number;
  totalRoomsRentedOut?: number;
  statistics?: KosStatistics; // Nested statistics block (preferred)
}

export interface KosCardProps {
  kosData: KosCardBase;
  formatCurrency?: (amount: number) => string; // optional override
}

/**
 * Molecule: KosCard - summary card for a kos property.
 * Supports both flattened and nested (statistics) metrics.
 */
export const KosCard: React.FC<KosCardProps> = ({ kosData, formatCurrency: formatFn = formatCurrency }) => {
  const router = useRouter();
  const stats = kosData.statistics; // may be undefined if API flattened later
  // Helper for safe numeric extraction (handles number | string | bigint)
  const num = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  };

  // Prefer flattened root then fallback to nested statistics
  const totalRooms = num(kosData.totalRooms ?? stats?.totalRooms);
  // Ambil nilai terbesar antara root & statistics agar tidak ter-reset ke 0 jika salah satu sumber belum ter-update
  const occupiedRoomsRawRoot = kosData.occupiedRooms;
  const occupiedRoomsRawStats = stats?.occupiedRooms;
  const occupiedRooms = num(
    occupiedRoomsRawRoot === undefined && occupiedRoomsRawStats === undefined
      ? 0
      : Math.max(num(occupiedRoomsRawRoot, 0), num(occupiedRoomsRawStats, 0))
  );
  const vacantRooms = num(
    kosData.vacantRooms ?? stats?.vacantRooms ?? (totalRooms - occupiedRooms)
  );
  const totalBookings = num(kosData.totalBookings ?? stats?.totalBookings);
  const pendingBookings = num(kosData.pendingBookings ?? stats?.pendingBookings);
  const totalRevenue = num(kosData.totalRevenue ?? stats?.totalRevenue);
  const totalRoomsRentedOut = num(kosData.totalRoomsRentedOut ?? stats?.totalRoomsRentedOut);
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
