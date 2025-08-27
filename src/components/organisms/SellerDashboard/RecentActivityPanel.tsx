// Seller dashboard organism: RecentActivityPanel
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { getActivityIcon } from '@/utils/icons';
import { formatCurrency } from '@/utils/format';

// Minimal shared fields needed for rendering recent activity
interface RecentActivityKosItem {
  id: number; name: string; viewCount: number;
}
export interface RecentActivityPanelProps {
  kos: RecentActivityKosItem[];
}

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({ kos }) => {
  const router = useRouter();
  if (kos.length === 0) return null;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
      <div className="space-y-3">
        {kos.slice(0, 3).map((k) => (
          <div key={`activity-${k.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">{getActivityIcon('kos')}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{k.name}</p>
                <p className="text-xs text-gray-500">0 booking total • {k.viewCount} kali dilihat</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-600">{formatCurrency(0)}</p>
              <p className="text-xs text-gray-500">Pendapatan</p>
            </div>
          </div>
        ))}
        {kos.length > 3 && (
          <button
            onClick={() => router.push('/seller/kos')}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
          >
            Lihat semua properti →
          </button>
        )}
      </div>
    </div>
  );
};
