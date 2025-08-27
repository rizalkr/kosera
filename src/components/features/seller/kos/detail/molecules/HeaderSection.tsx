import React from 'react';
import { SellerKosDetail } from '@/hooks/seller/kos/useSellerKosDetailView';

export interface HeaderSectionProps {
  kos: SellerKosDetail;
  status: { label: string; color: string };
  formatCurrency: (n: number) => string;
  formatDate: (d: string) => string;
  onBack: () => void;
  onRefresh: () => void;
  onEdit: () => void;
  isRefreshing: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ kos, status, formatCurrency, formatDate, onBack, onRefresh, onEdit, isRefreshing }) => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-500 p-2 rounded-lg transition-colors">← Kembali</button>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{kos.name}</h1>
        <p className="text-blue-100 mb-1">📍 {kos.address}, {kos.city}</p>
        {kos.createdAt && <p className="text-blue-100 text-sm">Dibuat pada {formatDate(kos.createdAt as string)}</p>}
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold mb-1">{formatCurrency(kos.price)}</div>
        <div className="text-blue-100 text-sm">per bulan</div>
        <div className="mt-4 flex space-x-3">
          <button onClick={onRefresh} disabled={isRefreshing} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50">{isRefreshing ? 'Memuat...' : '🔄 Refresh'}</button>
          <button onClick={onEdit} className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium">✏️ Edit Kos</button>
        </div>
      </div>
    </div>
  </div>
);
