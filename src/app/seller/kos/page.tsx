'use client';

import Header from '@/components/layouts/Header';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import KosImage from '@/components/ui/KosImage';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useMyKos } from '@/hooks/useApi';
import { useState } from 'react';
import type { BaseKosData } from '@/types/kos';

export default function SellerKosPage() {
  const { user } = useAuthGuard();
  const { data: kosResponse, isLoading, error, refetch } = useMyKos();
  const kosList = kosResponse?.data || [];
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getKosStatus = (kos: BaseKosData) => {
    // Menggunakan logika sederhana untuk menentukan status kos
    // Check if fields exist with optional chaining
    const isActive = (kos as BaseKosData & { isActive?: boolean }).isActive;
    const verified = (kos as BaseKosData & { verified?: boolean }).verified;
    
    if (isActive === false) return { label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' };
    if (verified === false) return { label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Belum diatur';
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getActiveKosCount = () => {
    return kosList.filter((kos) => getKosStatus(kos).label === 'Aktif').length;
  };

  const getPendingKosCount = () => {
    return kosList.filter((kos) => getKosStatus(kos).label === 'Menunggu Verifikasi').length;
  };

  const getTotalPrice = () => {
    return kosList.reduce((total: number, kos) => total + (kos.price || 0), 0);
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat data kos Anda...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center py-12">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Gagal Memuat Data Kos</h3>
                <p className="text-gray-500 mb-4">
                  Terjadi kesalahan saat mengambil data kos Anda. Silakan coba lagi.
                </p>
                <button 
                  onClick={() => refetch()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
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
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Daftar Kos Saya</h1>
                <p className="text-gray-600">
                  Kelola semua properti kos Anda - {kosList.length} kos terdaftar
                </p>
                {user?.username && (
                  <div className="mt-2 text-sm text-gray-500">
                    Selamat datang, <span className="font-semibold text-blue-600">{user.username}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshing ? 'Memuat...' : '🔄 Refresh'}
                </button>
                <button 
                  onClick={() => window.location.href = '/seller/kos/new'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  + Tambah Kos Baru
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {kosList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{kosList.length}</div>
                  <div className="text-sm text-gray-600">Total Kos</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {getActiveKosCount()}
                  </div>
                  <div className="text-sm text-gray-600">Kos Aktif</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {getPendingKosCount()}
                  </div>
                  <div className="text-sm text-gray-600">Menunggu Verifikasi</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice(getTotalPrice())}
                  </div>
                  <div className="text-sm text-gray-600">Total Harga</div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {kosList.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-300 text-8xl mb-6">🏠</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">Belum Ada Kos Terdaftar</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Mulai bisnis kos Anda dengan menambahkan properti pertama. Daftarkan kos Anda sekarang dan mulai menerima penyewa.
                </p>
                <button 
                  onClick={() => window.location.href = '/kos/new'}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  🏠 Tambah Kos Pertama
                </button>
              </div>
            ) : (
              /* Kos List */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kosList.map((kos) => {
                  const status = getKosStatus(kos);
                  return (
                    <div key={kos.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border">
                      {/* Kos Image */}
                      <div className="mb-4 relative">
                        <div className="w-full h-48 rounded-lg overflow-hidden relative">
                          <KosImage
                            kosId={kos.id}
                            kosName={kos.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Kos Info */}
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">{kos.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          📍 {kos.address}, {kos.city}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(kos.price)}/bulan
                          </span>
                          {(kos as BaseKosData & { roomType?: string }).roomType && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {(kos as BaseKosData & { roomType?: string }).roomType}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-white rounded p-3 text-center">
                          <div className="font-semibold text-gray-800">{(kos as BaseKosData & { totalPost?: number }).totalPost || 0}</div>
                          <div className="text-gray-500 text-xs">Total Post</div>
                        </div>
                        <div className="bg-white rounded p-3 text-center">
                          <div className="font-semibold text-gray-800">{(kos as BaseKosData & { totalPenjualan?: number }).totalPenjualan || 0}</div>
                          <div className="text-gray-500 text-xs">Penjualan</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => window.location.href = `/seller/kos/${kos.id}`}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          📊 Lihat Detail
                        </button>
                        <button 
                          onClick={() => window.location.href = `/seller/kos/${kos.id}/edit`}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Help Section */}
            {kosList.length > 0 && (
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Tips Pengelolaan Kos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-800 mb-2">📸 Update Foto Rutin</div>
                    <div className="text-gray-600">Foto yang menarik meningkatkan minat penyewa hingga 70%</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-800 mb-2">💰 Harga Kompetitif</div>
                    <div className="text-gray-600">Sesuaikan harga dengan kondisi pasar di sekitar lokasi</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="font-medium text-gray-800 mb-2">⚡ Respons Cepat</div>
                    <div className="text-gray-600">Balas pertanyaan calon penyewa dalam 24 jam</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
