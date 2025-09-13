'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { useSellerKosDetailView } from '@/hooks/seller/kos/useSellerKosDetailView';
import { SellerKosDetailLoading } from '@/components/features/seller/kos/detail/atoms/LoadingSkeleton';
import { SellerKosDetailError } from '@/components/features/seller/kos/detail/atoms/ErrorState';
import { HeaderSection } from '@/components/features/seller/kos/detail/molecules/HeaderSection';
import { TabsNav } from '@/components/features/seller/kos/detail/molecules/TabsNav';
import { OverviewTab } from '@/components/features/seller/kos/detail/organisms/OverviewTab';
import { PlaceholderTab } from '@/components/features/seller/kos/detail/organisms/PlaceholderTab';
import { SellerKosTab } from '@/hooks/seller/kos/useSellerKosDetailView';

function SellerKosDetailPage() {
  const router = useRouter();
  const { kos, isLoading, error, activeTab, setActiveTab, isRefreshing, handleRefresh, statistics, occupancyRate, formatCurrency, formatDate, getKosStatus, refetch } = useSellerKosDetailView();

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SellerKosDetailLoading />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }
  if (error || !kos) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SellerKosDetailError
              message={error ? 'Terjadi kesalahan saat mengambil detail kos.' : 'Kos tidak ditemukan atau Anda tidak memiliki akses.'}
              onRetry={() => refetch()}
              onBack={() => router.push('/seller/kos')}
            />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const status = getKosStatus();

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <HeaderSection
              kos={kos}
              status={status}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onBack={() => router.back()}
              onRefresh={handleRefresh}
              onEdit={() => router.push(`/seller/kos/${kos.id}/edit`)}
              isRefreshing={isRefreshing}
            />
            <TabsNav activeTab={activeTab} onChange={setActiveTab} />
            <div className="p-8">
              {activeTab === 'overview' && (
                <OverviewTab
                  kos={kos}
                  view={{ statistics, occupancyRate, formatCurrency, formatDate, getKosStatus }}
                  onEdit={() => router.push(`/seller/kos/${kos.id}/edit`)}
                  onPhotos={() => router.push(`/seller/kos/${kos.id}/photos`)}
                  onPublicView={() => router.push(`/kos/${kos.id}/view`)}
                />
              )}
              {activeTab !== 'overview' && activeTab !== 'settings' && (
                <PlaceholderTab type={activeTab as Exclude<SellerKosTab, 'overview'>} statistics={statistics} occupancyRate={occupancyRate} viewCount={statistics.totalViews} />
              )}
              {activeTab === 'settings' && (
                <PlaceholderTab type="settings" statistics={statistics} occupancyRate={occupancyRate} viewCount={statistics.totalViews} />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};
export default SellerKosDetailPage;
