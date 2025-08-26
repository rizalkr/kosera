'use client';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { VisualizationPanel } from '@/components/features/dashboard/VisualizationPanel';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';
import { StatCard } from '@/components/features/dashboard/admin/atoms/StatCard';
import { RecentActivitiesPanel } from '@/components/features/dashboard/admin/organisms/RecentActivitiesPanel';
import { PlatformOverviewPanel } from '@/components/features/dashboard/admin/organisms/PlatformOverviewPanel';
import { QuickActionsPanel } from '@/components/features/dashboard/admin/organisms/QuickActionsPanel';

export default function AdminDashboard() {
  const { user } = useAuthGuard();
  const { stats, recentActivities, loading, error, refreshData, analytics } = useAdminDashboard();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_register': return '👤';
      case 'kos_added':
      case 'kos_updated': return '🏠';
      case 'booking_made': return '📅';
      case 'payment_received': return '💰';
      default: return '📋';
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
                <button onClick={refreshData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Coba Lagi</button>
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
            <button onClick={refreshData} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" disabled={loading}>
              <span>🔄</span>
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>

          <div className="mb-6 text-sm text-gray-600 bg-white rounded-lg p-4">
            Selamat datang, <span className="font-semibold text-blue-600">{user?.username}</span>!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Users" value={stats?.totalUsers} icon="👥" colorClass="text-blue-600" />
            <StatCard label="Active Users" value={stats?.activeUsers} icon="📊" colorClass="text-green-600" />
            <StatCard label="Total Kos" value={stats?.totalKos} icon="🏠" colorClass="text-purple-600" />
            <StatCard label="Total Bookings" value={stats?.totalBookings} icon="📅" colorClass="text-orange-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivitiesPanel activities={recentActivities} getIcon={getActivityIcon} />
            <PlatformOverviewPanel totalViews={analytics?.overview?.totalViews} averageRating={stats?.averageRating ? Number(stats.averageRating) : undefined} />
          </div>

          <div className="mt-8">
            <VisualizationPanel />
          </div>

          <QuickActionsPanel />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
