'use client';

import Header from '@/components/layouts/Header';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { useSellerKosListView } from '@/hooks/seller/kos/useSellerKosListView';
import { StatsRow } from '@/components/features/seller/kos/list/organisms/StatsRow';
import { KosGrid } from '@/components/features/seller/kos/list/organisms/KosGrid';
import { KosTips } from '@/components/features/seller/kos/list/organisms/KosTips';
import { SellerKosListLoading } from '@/components/features/seller/kos/list/atoms/LoadingState';
import { SellerKosListError } from '@/components/features/seller/kos/list/atoms/ErrorState';

export const SellerKosPage = () => {
  const { user, kosList, isLoading, error, refetch, isRefreshing, handleRefresh, counts, formatPrice, getKosStatus } = useSellerKosListView();

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SellerKosListLoading />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SellerKosListError onRetry={refetch} />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Daftar Kos Saya</h1>
                <p className="text-gray-600">Kelola semua properti kos Anda - {counts.totalKos} kos terdaftar</p>
                {user?.username && <div className="mt-2 text-sm text-gray-500">Selamat datang, <span className="font-semibold text-blue-600">{user.username}</span></div>}
              </div>
              <div className="flex space-x-3">
                <button onClick={handleRefresh} disabled={isRefreshing} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{isRefreshing ? 'Memuat...' : '🔄 Refresh'}</button>
                <button onClick={() => window.location.href = '/seller/kos/new'} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">+ Tambah Kos Baru</button>
              </div>
            </div>
            {counts.totalKos > 0 && (
              <StatsRow counts={counts} formatTotalPrice={() => formatPrice(counts.totalPrice)} />
            )}
            {counts.totalKos === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-300 text-8xl mb-6">🏠</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">Belum Ada Kos Terdaftar</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Mulai bisnis kos Anda dengan menambahkan properti pertama. Daftarkan kos Anda sekarang dan mulai menerima penyewa.</p>
                <button onClick={() => window.location.href = '/kos/new'} className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">🏠 Tambah Kos Pertama</button>
              </div>
            ) : (
              <KosGrid kosList={kosList} formatPrice={formatPrice} getKosStatus={getKosStatus} />
            )}
            {counts.totalKos > 0 && <KosTips />}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export { SellerKosPage as default };
