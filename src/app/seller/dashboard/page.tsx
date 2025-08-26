'use client';

import { useSellerDashboard } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { StatCard, KosCard, EmptyState } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { formatCurrency } from '@/utils/format';
import { OverviewStatsPanel } from '@/components/organisms/SellerDashboard/OverviewStatsPanel';
import { PerformanceSummaryPanel } from '@/components/organisms/SellerDashboard/PerformanceSummaryPanel';
import { RecentActivityPanel } from '@/components/organisms/SellerDashboard/RecentActivityPanel';
import { TipsInsightsPanel } from '@/components/organisms/SellerDashboard/TipsInsightsPanel';
import { QuickActionsPanel } from '@/components/organisms/SellerDashboard/QuickActionsPanel';
import type { SellerDashboardKosItem } from '@/types/dashboard';

const SellerDashboard = () => {
  const { data, isLoading, error, refetch } = useSellerDashboard();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Gagal Memuat Dashboard</h2>
            <p className="text-red-600">Gagal memuat data dashboard seller. Silakan coba lagi nanti.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.success || !data.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Data Tidak Tersedia</h2>
            <p className="text-yellow-600">Data dashboard tidak ditemukan. Silakan cek kembali nanti.</p>
          </div>
        </div>
      </div>
    );
  }

  const { kos, stats } = data.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Seller</h1>
              <p className="text-gray-600">Kelola properti kos Anda dan lihat metrik performa</p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button
                onClick={() => router.push('/seller/kos')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>🏠</span>
                <span>Kelola Kos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Statistics Panel */}
        <OverviewStatsPanel stats={stats} />

        {/* Kos Properties */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Properti Anda</h2>
          {kos.length === 0 ? (
            <EmptyState
              title="Belum Ada Properti"
              description="Mulai dengan menambahkan properti kos pertama Anda untuk mulai mengelola booking."
              icon="🏠"
              actions={(
                <Button onClick={() => router.push('/add-kos')} variant="primary" size="md">
                  Tambah Kos Pertama
                </Button>
              )}
              variant="onboarding"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {kos.map((kosData: SellerDashboardKosItem) => (
                <KosCard key={kosData.id} kosData={kosData} formatCurrency={formatCurrency} />
              ))}
            </div>
          )}
        </div>

        <PerformanceSummaryPanel stats={stats} kosCount={kos.length} />

        <RecentActivityPanel kos={kos as any} />

        <TipsInsightsPanel stats={stats} kosCount={kos.length} />

        <QuickActionsPanel hasKos={kos.length > 0} />
      </div>
    </div>
  );
};

export default SellerDashboard;
