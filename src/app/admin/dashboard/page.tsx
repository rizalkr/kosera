'use client';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { VisualizationPanel } from '@/components/dashboard/VisualizationPanel';
import { UserCompositionChart } from '@/components/dashboard/UserCompositionChart';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboard() {
  const { user } = useAuthGuard();
  const { 
    stats, 
    recentActivities, 
    loading, 
    error, 
    refreshData,
    analytics 
  } = useAdminDashboard();

  // Utility functions for activity display
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_register':
        return '👤';
      case 'kos_added':
      case 'kos_updated':
        return '🏠';
      case 'booking_made':
        return '📅';
      case 'payment_received':
        return '💰';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data dashboard...</p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-4">❌</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Kelola platform Kosera</p>
            </div>
            <button
              onClick={refreshData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <span>🔄</span>
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
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
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.totalUsers?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.activeUsers?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Kos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.totalKos?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-3xl">🏠</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats?.totalBookings?.toLocaleString() || '0'}
                  </p>
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
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
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
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p>Belum ada aktivitas terbaru</p>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Platform</h2>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {analytics?.overview?.totalViews?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-blue-500">Total Views</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats?.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'}⭐
                  </div>
                  <div className="text-sm text-green-500">Rata-rata Rating</div>
                </div>
              </div>

              {/* User Composition Chart */}
              <div className="mt-25">
                <UserCompositionChart />
              </div>
            </div>
          </div>

          {/* Platform Trends Chart */}
          <div className="mt-8">
            <VisualizationPanel />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => window.location.href = '/admin/users'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">👤</div>
                <div className="text-sm">Kelola Users</div>
              </button>
              <button 
                onClick={() => window.location.href = '/admin/kos'}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
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
