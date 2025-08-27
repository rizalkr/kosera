import React from 'react';
import { SellerKosTab } from '@/hooks/seller/kos/useSellerKosDetailView';

export interface PlaceholderTabProps {
  type: Exclude<SellerKosTab, 'overview'>;
  statistics: { totalBookings: number; pendingBookings: number; totalViews: number; };
  occupancyRate: number;
  viewCount: number;
}

const placeholderContent = {
  bookings: {
    icon: '📋',
    title: 'Fitur Booking Sedang Dikembangkan',
    desc: 'Halaman manajemen booking akan segera tersedia untuk membantu Anda mengelola reservasi.',
    extra: (stats: PlaceholderTabProps['statistics']) => (
      <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Info:</span> Saat ini Anda memiliki {stats.totalBookings} total booking {stats.pendingBookings > 0 && ` dengan ${stats.pendingBookings} menunggu perhatian Anda`}.
        </p>
      </div>
    )
  },
  analytics: {
    icon: '📈',
    title: 'Analitik Mendalam Segera Hadir',
    desc: 'Dapatkan insights mendalam tentang performa kos Anda dengan grafik dan statistik lengkap.',
    extra: (_: PlaceholderTabProps['statistics'], viewCount: number, occupancyRate: number) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{viewCount}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{occupancyRate}%</div>
          <div className="text-sm text-gray-600">Tingkat Hunian</div>
        </div>
      </div>
    )
  },
  settings: {
    icon: '⚙️',
    title: 'Pengaturan Kos',
    desc: 'Kelola pengaturan dan preferensi untuk kos Anda.',
    extra: () => null
  }
} as const;

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ type, statistics, occupancyRate, viewCount }) => {
  const item = placeholderContent[type];
  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-gray-300 text-6xl mb-4">{item.icon}</div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">{item.title}</h3>
      <p className="text-gray-500 mb-4">{item.desc}</p>
      {type === 'bookings' && placeholderContent.bookings.extra(statistics)}
      {type === 'analytics' && placeholderContent.analytics.extra(statistics, viewCount, occupancyRate)}
    </div>
  );
};
