// src/components/molecules/KosCard.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardFooter } from '@/components/atoms';
import type { AdminKosData } from '@/types/kos';
import { formatCurrency } from '@/utils/format';

export interface KosCardProps {
  kosData: AdminKosData;
  formatCurrency?: (amount: number) => string; // optional override
}

/**
 * Molecule: KosCard - summary card for a kos property.
 */
export const KosCard: React.FC<KosCardProps> = ({ kosData, formatCurrency: formatFn = formatCurrency }) => {
  const router = useRouter();

  // --- Safe numeric normalization to prevent NaN rendering ---
  const totalRooms = Number.isFinite((kosData as any).totalRooms) ? (kosData as any).totalRooms as number : 0;
  const occupiedRooms = Number.isFinite((kosData as any).occupiedRooms) ? (kosData as any).occupiedRooms as number : 0;
  const viewCount = Number.isFinite((kosData as any).viewCount) ? (kosData as any).viewCount as number : 0;
  const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  // -----------------------------------------------------------

  return (
    <Card className="border border-gray-200 overflow-hidden" padding="lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{kosData.name}</h3>
          <p className="text-sm text-gray-600">{kosData.city}</p>
          <p className="text-xs text-gray-500 mt-1">{kosData.address}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">{formatFn(Number.isFinite((kosData as any).price) ? (kosData as any).price : 0)}</p>
          <p className="text-xs text-gray-500">per month</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xl font-bold text-blue-600">0</p>
          <p className="text-xs text-blue-600">Total Booking</p>
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
            {formatFn(0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Kamar Tersewa (Historis)</span>
          <span className="text-sm font-semibold text-gray-500">{occupiedRooms}</span>
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
