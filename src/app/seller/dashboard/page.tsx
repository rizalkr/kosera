'use client';

import { useSellerDashboard } from '@/hooks/useApi';
import { SellerKosData } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

  const { kos, overallStats } = data.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200',
    };

    return (
      <div className={`${colorClasses[color]} border rounded-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
          </div>
          <div className="text-3xl opacity-50">{icon}</div>
        </div>
      </div>
    );
  };

  const KosCard = ({ kosData }: { kosData: SellerKosData }) => {
    const { statistics } = kosData;
    const occupancyRate = statistics.totalRooms > 0 
      ? Math.round((statistics.occupiedRooms / statistics.totalRooms) * 100)
      : 0;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{kosData.name}</h3>
              <p className="text-sm text-gray-600">{kosData.city}</p>
              <p className="text-xs text-gray-500 mt-1">{kosData.address}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">{formatCurrency(kosData.price)}</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xl font-bold text-blue-600">{statistics.totalBookings}</p>
              <p className="text-xs text-blue-600">Total Booking</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xl font-bold text-green-600">{kosData.viewCount}</p>
              <p className="text-xs text-green-600">Dilihat</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-xl font-bold text-yellow-600">{statistics.occupiedRooms}</p>
              <p className="text-xs text-yellow-600">Terisi</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xl font-bold text-purple-600">{statistics.vacantRooms}</p>
              <p className="text-xs text-purple-600">Kosong</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tingkat Hunian</span>
              <span className="text-sm font-semibold text-gray-500">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-600">Total Pendapatan</span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(statistics.totalRevenue)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kamar Tersewa (Historis)</span>
              <span className="text-sm font-semibold text-gray-500">{statistics.totalRoomsRentedOut}</span>
            </div>

            {statistics.pendingBookings > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold text-gray-500">{statistics.pendingBookings}</span> booking menunggu 
                  perhatian Anda
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-500">
                Dibuat {new Date(kosData.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/kos/${kosData.id}/view`)}
                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  Lihat
                </button>
                <button
                  onClick={() => router.push(`/seller/kos/${kosData.id}/edit`)}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Kos"
            value={overallStats.totalKos}
            icon="🏠"
            color="blue"
          />
          <StatCard
            title="Total Booking"
            value={overallStats.totalBookings}
            subtitle={`${overallStats.totalPendingBookings} menunggu`}
            icon="📋"
            color="green"
          />
          <StatCard
            title="Kamar Terisi"
            value={`${overallStats.totalOccupiedRooms}/${overallStats.totalRooms}`}
            subtitle={`${overallStats.totalVacantRooms} kosong`}
            icon="🛏️"
            color="yellow"
          />
          <StatCard
            title="Total Pendapatan"
            value={formatCurrency(overallStats.totalRevenue)}
            icon="💰"
            color="purple"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Total Dilihat"
            value={overallStats.totalViews.toLocaleString()}
            subtitle="di semua properti"
            icon="👁️"
            color="blue"
          />
          <StatCard
            title="Total Favorit"
            value={overallStats.totalFavorites.toLocaleString()}
            subtitle="disimpan pengguna"
            icon="❤️"
            color="red"
          />
        </div>

        {/* Kos Properties */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Properti Anda</h2>
          {kos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Properti</h3>
              <p className="text-gray-600 mb-4">Mulai dengan menambahkan properti kos pertama Anda untuk mulai mengelola booking.</p>
              <button 
                onClick={() => router.push('/add-kos')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tambah Kos Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {kos.map((kosData) => (
                <KosCard key={kosData.id} kosData={kosData} />
              ))}
            </div>
          )}
        </div>

        {/* Performance Summary */}
        {kos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Performa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {overallStats.totalRooms > 0 ? Math.round((overallStats.totalOccupiedRooms / overallStats.totalRooms) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600">Rata-rata Tingkat Hunian</p>
                <p className="text-xs text-gray-500 mt-1">
                  {overallStats.totalOccupiedRooms} dari {overallStats.totalRooms} kamar terisi
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {kos.length > 0 ? Math.round(overallStats.totalViews / kos.length) : 0}
                </div>
                <p className="text-sm text-gray-600">Rata-rata Dilihat per Kos</p>
                <p className="text-xs text-gray-500 mt-1">
                  {overallStats.totalViews} total dilihat
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {kos.length > 0 ? Math.round(overallStats.totalRevenue / kos.length) : 0}
                </div>
                <p className="text-sm text-gray-600">Rata-rata Pendapatan per Kos</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(overallStats.totalRevenue)} total
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {kos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
            <div className="space-y-3">
              {kos.slice(0, 3).map((kosData) => (
                <div key={`activity-${kosData.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🏠</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{kosData.name}</p>
                      <p className="text-xs text-gray-500">
                        {kosData.statistics.totalBookings} booking total • {kosData.viewCount} kali dilihat
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(kosData.statistics.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500">Pendapatan</p>
                  </div>
                </div>
              ))}
              {kos.length > 3 && (
                <button 
                  onClick={() => router.push('/seller/kos')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                >
                  Lihat semua properti →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tips & Insights */}
        {kos.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips & Insights</h3>
            <div className="space-y-3">
              {overallStats.totalPendingBookings > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Perlu Tindakan:</span> Anda memiliki {overallStats.totalPendingBookings} booking yang menunggu perhatian Anda.
                  </p>
                </div>
              )}
              
              {overallStats.totalVacantRooms > overallStats.totalOccupiedRooms && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Peluang:</span> Anda memiliki {overallStats.totalVacantRooms} kamar kosong. Pertimbangkan untuk mempromosikan properti atau menyesuaikan harga.
                  </p>
                </div>
              )}
              
              {overallStats.totalViews > 0 && overallStats.totalBookings === 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">Tips:</span> Properti Anda mendapat banyak views tapi belum ada booking. Pertimbangkan untuk memperbaiki deskripsi atau menambah foto.
                  </p>
                </div>
              )}
              
              {overallStats.totalOccupiedRooms / overallStats.totalRooms >= 0.8 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Kerja Bagus!</span> Tingkat hunian Anda {Math.round((overallStats.totalOccupiedRooms / overallStats.totalRooms) * 100)}%. Pertimbangkan untuk mengembangkan portofolio!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {kos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/seller/analytics')}
                className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 p-4 rounded-lg transition-colors"
              >
                <span>📊</span>
                <span>Lihat Analitik</span>
              </button>
              <button 
                onClick={() => router.push('/seller/kos/add')}
                className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-600 p-4 rounded-lg transition-colors"
              >
                <span>➕</span>
                <span>Tambah Kos Baru</span>
              </button>
              <button 
                onClick={() => router.push('/seller/bookings')}
                className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-600 p-4 rounded-lg transition-colors"
              >
                <span>📋</span>
                <span>Kelola Booking</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
