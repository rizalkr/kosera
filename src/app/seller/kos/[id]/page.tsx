'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSellerKosDetail } from '@/hooks/useApi';

export default function SellerKosDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kosId = params.id as string;
  
  const { data: kosResponse, isLoading, error, refetch } = useSellerKosDetail(parseInt(kosId));
  const kosData = kosResponse?.data;
  
  // Debug logging
  console.log('🔍 Seller Kos Detail Debug:', {
    kosId,
    kosResponse,
    kosData,
    isLoading,
    error
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'analytics' | 'settings'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getKosStatus = () => {
    if (!kosData) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    // Since isActive and verified don't exist in SellerKosData, we'll use a simple active status
    // In the future, these fields can be added to the database schema if needed
    return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-6 w-64"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-gray-300 rounded-lg"></div>
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-300 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-300 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error || !kosData) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center py-12">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Gagal Memuat Detail Kos</h3>
                <p className="text-gray-500 mb-4">
                  {error ? 'Terjadi kesalahan saat mengambil detail kos.' : 'Kos tidak ditemukan atau Anda tidak memiliki akses.'}
                </p>
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => refetch()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Coba Lagi
                  </button>
                  <button 
                    onClick={() => router.push('/seller/kos')}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Kembali ke Daftar Kos
                  </button>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const status = getKosStatus();
  const statistics = kosData.statistics || {
    totalBookings: 0,
    totalViews: 0,
    totalRevenue: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    totalRooms: 0,
    pendingBookings: 0,
    totalRoomsRentedOut: 0
  };

  const occupancyRate = statistics.totalRooms > 0 
    ? Math.round((statistics.occupiedRooms / statistics.totalRooms) * 100)
    : 0;

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <button 
                      onClick={() => router.back()}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-500 p-2 rounded-lg transition-colors"
                    >
                      ← Kembali
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{kosData.name}</h1>
                  <p className="text-blue-100 mb-1">📍 {kosData.address}, {kosData.city}</p>
                  <p className="text-blue-100 text-sm">Dibuat pada {formatDate(kosData.createdAt)}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{formatCurrency(kosData.price)}</div>
                  <div className="text-blue-100 text-sm">per bulan</div>
                  <div className="mt-4 flex space-x-3">
                    <button 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {isRefreshing ? 'Memuat...' : '🔄 Refresh'}
                    </button>
                    <button 
                      onClick={() => router.push(`/seller/kos/${kosData.id}/edit`)}
                      className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                      ✏️ Edit Kos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8">
                {[
                  { id: 'overview', label: '📊 Overview', icon: '📊' },
                  { id: 'bookings', label: '📋 Booking', icon: '📋' },
                  { id: 'analytics', label: '📈 Analitik', icon: '📈' },
                  { id: 'settings', label: '⚙️ Pengaturan', icon: '⚙️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Key Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">{statistics.totalBookings}</div>
                      <div className="text-sm text-blue-600 mt-1">Total Booking</div>
                      {statistics.pendingBookings > 0 && (
                        <div className="text-xs text-yellow-600 mt-2">
                          {statistics.pendingBookings} menunggu
                        </div>
                      )}
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="text-3xl font-bold text-green-600">{kosData.viewCount || 0}</div>
                      <div className="text-sm text-green-600 mt-1">Total Dilihat</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">{occupancyRate}%</div>
                      <div className="text-sm text-purple-600 mt-1">Tingkat Hunian</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {statistics.occupiedRooms}/{statistics.totalRooms} kamar
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <div className="text-3xl font-bold text-yellow-600">{formatCurrency(statistics.totalRevenue)}</div>
                      <div className="text-sm text-yellow-600 mt-1">Total Pendapatan</div>
                    </div>
                  </div>

                  {/* Room Status */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Kamar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🛏️</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{statistics.totalRooms}</div>
                        <div className="text-sm text-gray-600">Total Kamar</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✅</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{statistics.occupiedRooms}</div>
                        <div className="text-sm text-gray-600">Kamar Terisi</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🆓</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{statistics.vacantRooms}</div>
                        <div className="text-sm text-gray-600">Kamar Kosong</div>
                      </div>
                    </div>
                    
                    {/* Occupancy Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Tingkat Hunian</span>
                        <span className="text-sm font-semibold text-gray-900">{occupancyRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Properti</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nama Kos:</span>
                          <span className="font-medium text-gray-900">{kosData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipe Kamar:</span>
                          <span className="font-medium text-gray-900">Standar</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Harga per Bulan:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(kosData.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kota:</span>
                          <span className="font-medium text-gray-900">{kosData.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Performa</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Kamar Tersewa:</span>
                          <span className="font-medium text-gray-900">{statistics.totalRoomsRentedOut}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Pendapatan:</span>
                          <span className="font-medium text-green-600">{formatCurrency(statistics.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rata-rata per Kamar:</span>
                          <span className="font-medium text-gray-900">
                            {statistics.totalRooms > 0 ? formatCurrency(statistics.totalRevenue / statistics.totalRooms) : formatCurrency(0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dibuat:</span>
                          <span className="font-medium text-gray-900">{formatDate(kosData.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => router.push(`/kos/${kosData.id}/view`)}
                        className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-lg transition-colors border border-gray-200"
                      >
                        <span>👁️</span>
                        <span>Lihat Sebagai Pengunjung</span>
                      </button>
                      <button 
                        onClick={() => router.push(`/seller/kos/${kosData.id}/edit`)}
                        className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"
                      >
                        <span>✏️</span>
                        <span>Edit Informasi</span>
                      </button>
                      <button 
                        onClick={() => router.push(`/seller/kos/${kosData.id}/photos`)}
                        className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors"
                      >
                        <span>📸</span>
                        <span>Kelola Foto</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="text-gray-300 text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Fitur Booking Sedang Dikembangkan</h3>
                    <p className="text-gray-500 mb-4">
                      Halaman manajemen booking akan segera tersedia untuk membantu Anda mengelola reservasi.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Info:</span> Saat ini Anda memiliki {statistics.totalBookings} total booking 
                        {statistics.pendingBookings > 0 && ` dengan ${statistics.pendingBookings} menunggu perhatian Anda`}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="text-gray-300 text-6xl mb-4">📈</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Analitik Mendalam Segera Hadir</h3>
                    <p className="text-gray-500 mb-4">
                      Dapatkan insights mendalam tentang performa kos Anda dengan grafik dan statistik lengkap.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{kosData.viewCount || 0}</div>
                        <div className="text-sm text-gray-600">Total Views</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{occupancyRate}%</div>
                        <div className="text-sm text-gray-600">Tingkat Hunian</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="text-gray-300 text-6xl mb-4">⚙️</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Pengaturan Kos</h3>
                    <p className="text-gray-500 mb-6">
                      Kelola pengaturan dan preferensi untuk kos Anda.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <button 
                        onClick={() => router.push(`/seller/kos/${kosData.id}/edit`)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-6 rounded-lg transition-colors"
                      >
                        <div className="text-2xl mb-2">✏️</div>
                        <div className="font-medium">Edit Informasi</div>
                        <div className="text-sm opacity-75">Perbarui detail kos</div>
                      </button>
                      <button 
                        onClick={() => router.push(`/seller/kos/${kosData.id}/photos`)}
                        className="bg-green-50 hover:bg-green-100 text-green-600 p-6 rounded-lg transition-colors"
                      >
                        <div className="text-2xl mb-2">📸</div>
                        <div className="font-medium">Kelola Foto</div>
                        <div className="text-sm opacity-75">Tambah atau hapus foto</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
