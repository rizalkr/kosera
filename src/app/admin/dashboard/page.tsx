'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type UserStats = {
  totalUsers: number;
  activeUsers: number;
  totalKos: number;
  totalBookings: number;
  totalRevenue: number;
};

type RecentActivity = {
  id: number;
  type: 'user_register' | 'kos_added' | 'booking_made' | 'payment_received';
  message: string;
  time: string;
  user: string;
};

const mockStats: UserStats = {
  totalUsers: 1547,
  activeUsers: 892,
  totalKos: 234,
  totalBookings: 1893,
  totalRevenue: 45678900
};

const mockActivities: RecentActivity[] = [
  {
    id: 1,
    type: 'user_register',
    message: 'Pengguna baru mendaftar',
    time: '2 menit yang lalu',
    user: 'john_doe'
  },
  {
    id: 2,
    type: 'kos_added',
    message: 'Kos baru ditambahkan',
    time: '15 menit yang lalu',
    user: 'seller_abc'
  },
  {
    id: 3,
    type: 'booking_made',
    message: 'Booking baru dibuat',
    time: '1 jam yang lalu',
    user: 'jane_smith'
  },
  {
    id: 4,
    type: 'payment_received',
    message: 'Pembayaran diterima',
    time: '2 jam yang lalu',
    user: 'renter_xyz'
  }
];

export default function AdminDashboard() {
  const [stats] = useState<UserStats>(mockStats);
  const [activities] = useState<RecentActivity[]>(mockActivities);
  const { user } = useAuthGuard();

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_register':
        return '👤';
      case 'kos_added':
        return '🏠';
      case 'booking_made':
        return '📅';
      case 'payment_received':
        return '💰';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_register':
        return 'bg-green-100 text-green-700';
      case 'kos_added':
        return 'bg-blue-100 text-blue-700';
      case 'booking_made':
        return 'bg-purple-100 text-purple-700';
      case 'payment_received':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Kelola platform Kosera</p>
          </div>

          <div className="mb-6 text-sm text-gray-600 bg-white rounded-lg p-4">
            Selamat datang, <span className="font-semibold text-blue-600">{user?.username}</span>!
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Kos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalKos.toLocaleString()}</p>
                </div>
                <div className="text-3xl">🏠</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalBookings.toLocaleString()}</p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500">oleh {activity.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Pendapatan</h2>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  Rp {stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mb-4">Total pendapatan bulan ini</p>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg inline-block">
                  ↗ +12.5% dari bulan lalu
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-sm">Kelola Users</div>
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center">
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-sm">Kelola Kos</div>
              </button>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-sm">Kelola Booking</div>
              </button>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm">Lihat Laporan</div>
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
