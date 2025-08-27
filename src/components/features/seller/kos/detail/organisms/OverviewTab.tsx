import React from 'react';
import { SellerKosDetail, UseSellerKosDetailViewResult } from '@/hooks/seller/kos/useSellerKosDetailView';
import { StatCard } from '../atoms/StatCard';
import { RoomStatusPanel } from '../molecules/RoomStatusPanel';
import { PropertyInfoPanel } from '../molecules/PropertyInfoPanel';

export interface OverviewTabProps {
  kos: SellerKosDetail;
  view: Pick<UseSellerKosDetailViewResult, 'statistics' | 'occupancyRate' | 'formatCurrency' | 'formatDate' | 'getKosStatus'>;
  onEdit: () => void;
  onPhotos: () => void;
  onPublicView: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ kos, view, onEdit, onPhotos, onPublicView }) => {
  const { statistics, occupancyRate, formatCurrency, formatDate, getKosStatus } = view;
  const avgPerRoom = statistics.totalRooms > 0 ? statistics.totalRevenue / statistics.totalRooms : 0;
  const status = getKosStatus();
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard value={statistics.totalBookings} label="Total Booking" color="blue" extra={statistics.pendingBookings > 0 && `${statistics.pendingBookings} menunggu`} />
        <StatCard value={statistics.totalViews} label="Total Dilihat" color="green" />
        <StatCard value={`${occupancyRate}%`} label="Tingkat Hunian" color="purple" extra={`${statistics.occupiedRooms}/${statistics.totalRooms} kamar`} />
        <StatCard value={formatCurrency(statistics.totalRevenue)} label="Total Pendapatan" color="yellow" />
      </div>
      <RoomStatusPanel totalRooms={statistics.totalRooms} occupiedRooms={statistics.occupiedRooms} vacantRooms={statistics.vacantRooms} occupancyRate={occupancyRate} />
      <PropertyInfoPanel kos={kos} formatCurrency={formatCurrency} formatDate={formatDate} status={status} totalRoomsRentedOut={statistics.totalRoomsRentedOut} totalRevenue={statistics.totalRevenue} avgPerRoom={avgPerRoom} />
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={onPublicView} className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-lg transition-colors border border-gray-200"><span>👁️</span><span>Lihat Sebagai Pengunjung</span></button>
          <button onClick={onEdit} className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"><span>✏️</span><span>Edit Informasi</span></button>
          <button onClick={onPhotos} className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors"><span>📸</span><span>Kelola Foto</span></button>
        </div>
      </div>
    </div>
  );
};
