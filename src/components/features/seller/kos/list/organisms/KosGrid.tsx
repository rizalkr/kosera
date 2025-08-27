import React from 'react';
import KosImage from '@/components/ui/KosImage';
import { SellerKosListItem } from '@/hooks/seller/kos/useSellerKosListView';

export interface KosGridProps {
  kosList: SellerKosListItem[];
  formatPrice: (p: number | null | undefined) => string;
  getKosStatus: (k: SellerKosListItem) => { label: string; color: string };
}

export const KosGrid: React.FC<KosGridProps> = ({ kosList, formatPrice, getKosStatus }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {kosList.map(kos => {
      const status = getKosStatus(kos);
      const roomType = (kos as SellerKosListItem & { roomType?: string }).roomType;
      const totalPost = (kos as SellerKosListItem & { totalPost?: number }).totalPost || 0;
      const totalPenjualan = (kos as SellerKosListItem & { totalPenjualan?: number }).totalPenjualan || 0;
      return (
        <div key={kos.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border">
          <div className="mb-4 relative">
            <div className="w-full h-48 rounded-lg overflow-hidden relative">
              <KosImage kosId={kos.id} kosName={kos.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">{kos.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">📍 {kos.address}, {kos.city}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-blue-600">{formatPrice(kos.price)}/bulan</span>
              {roomType && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{roomType}</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="bg-white rounded p-3 text-center">
              <div className="font-semibold text-gray-800">{totalPost}</div>
              <div className="text-gray-500 text-xs">Total Post</div>
            </div>
            <div className="bg-white rounded p-3 text-center">
              <div className="font-semibold text-gray-800">{totalPenjualan}</div>
              <div className="text-gray-500 text-xs">Penjualan</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => window.location.href = `/seller/kos/${kos.id}`} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">📊 Lihat Detail</button>
            <button onClick={() => window.location.href = `/seller/kos/${kos.id}/edit`} className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">✏️ Edit</button>
          </div>
        </div>
      );
    })}
  </div>
);
