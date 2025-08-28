import React from 'react';
import { SellerKosDetail } from '@/types/seller-kos';

export interface PropertyInfoPanelProps {
  kos: SellerKosDetail;
  formatCurrency: (n: number) => string;
  formatDate: (d: string) => string;
  status: { label: string; color: string };
  totalRoomsRentedOut: number;
  totalRevenue: number;
  avgPerRoom: number;
}

export const PropertyInfoPanel: React.FC<PropertyInfoPanelProps> = ({ kos, formatCurrency, formatDate, status, totalRoomsRentedOut, totalRevenue, avgPerRoom }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Properti</h3>
        <div className="space-y-4">
          <InfoRow label="Nama Kos" value={kos.name} />
          <InfoRow label="Tipe Kamar" value="Standar" />
            <InfoRow label="Harga per Bulan" value={formatCurrency(kos.price)} />
          <InfoRow label="Kota" value={kos.city} />
          <InfoRow label="Status" value={<span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>} />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Performa</h3>
        <div className="space-y-4">
          <InfoRow label="Total Kamar Tersewa" value={totalRoomsRentedOut} />
          <InfoRow label="Total Pendapatan" value={<span className="text-green-600 font-medium">{formatCurrency(totalRevenue)}</span>} />
          <InfoRow label="Rata-rata per Kamar" value={formatCurrency(avgPerRoom)} />
          <InfoRow label="Dibuat" value={formatDate(kos.createdAt as string)} />
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);
