'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSearchDebounce } from '@/hooks/useDebounce';
import { useAdminKos, useToggleFeatured, useDeleteKos, usePermanentDeleteKos, useRestoreKos, useBulkCleanupKos, useBulkArchiveKos, useBulkPermanentDeleteKos, type AdminKosData } from '@/hooks/useAdminKos';
import { showConfirm, showSuccess, showError } from '@/lib/sweetalert';

export default function AdminKosPage() {
  const router = useRouter();
  const { user } = useAuthGuard();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterOwnerType, setFilterOwnerType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKos, setSelectedKos] = useState<number[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  // Use debounced search with 400ms delay
  const { debouncedSearchTerm, isSearching } = useSearchDebounce(searchTerm, 400);

  const kosPerPage = 10;

  // Use hooks for data fetching
  const { data: kosList, loading, error, pagination, refetch } = useAdminKos({
    page: currentPage,
    limit: kosPerPage,
    search: debouncedSearchTerm,
    city: filterCity,
    ownerType: filterOwnerType,
    sortBy: sortBy,
    showDeleted: showDeleted,
  });

  const { toggleFeatured, loading: toggleLoading } = useToggleFeatured();
  const { deleteKos, loading: deleteLoading } = useDeleteKos();
  const { permanentDeleteKos, loading: permanentDeleteLoading } = usePermanentDeleteKos();
  const { restoreKos, loading: restoreLoading } = useRestoreKos();
  const { bulkCleanupKos, loading: bulkCleanupLoading } = useBulkCleanupKos();
  const { bulkArchiveKos, loading: bulkArchiveLoading } = useBulkArchiveKos();
  const { bulkPermanentDeleteKos, loading: bulkPermanentDeleteLoading } = useBulkPermanentDeleteKos();

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle filter
  const handleFilterChange = (type: string, value: string) => {
    if (type === 'city') {
      setFilterCity(value);
    } else if (type === 'ownerType') {
      setFilterOwnerType(value);
    } else if (type === 'sort') {
      setSortBy(value);
    }
    setCurrentPage(1);
  };

  // Handle kos selection
  const handleSelectKos = (kosId: number) => {
    setSelectedKos(prev => 
      prev.includes(kosId) 
        ? prev.filter(id => id !== kosId)
        : [...prev, kosId]
    );
  };

  const handleSelectAll = () => {
    if (selectedKos.length === kosList.length) {
      setSelectedKos([]);
    } else {
      setSelectedKos(kosList.map(kos => kos.id));
    }
  };

  // Handle kos actions using hooks
  const handleDeleteKos = async (kosId: number) => {
    const result = await showConfirm(
      showDeleted 
        ? 'Kos akan dihapus PERMANEN dari sistem. Tindakan ini tidak dapat dibatalkan.'
        : 'Kos akan dipindahkan ke arsip dan dapat dipulihkan kembali.',
      showDeleted ? 'Hapus Permanen?' : 'Hapus Kos?',
      showDeleted ? 'Ya, Hapus Permanen' : 'Ya, Pindah ke Arsip',
      'Batal'
    );
    
    if (!result.isConfirmed) return;

    try {
      if (showDeleted) {
        await permanentDeleteKos(kosId);
        await showSuccess('Kos berhasil dihapus permanen');
      } else {
        await deleteKos(kosId);
        await showSuccess('Kos berhasil dipindahkan ke arsip');
      }
      refetch();
    } catch (err) {
      await showError('Gagal menghapus kos: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleRestoreKos = async (kosId: number) => {
    const result = await showConfirm(
      'Kos akan dipulihkan dari arsip dan dapat diakses kembali.',
      'Pulihkan Kos?',
      'Ya, Pulihkan',
      'Batal'
    );
    
    if (!result.isConfirmed) return;

    try {
      await restoreKos(kosId);
      await showSuccess('Kos berhasil dipulihkan dari arsip');
      refetch();
    } catch (err) {
      await showError('Gagal memulihkan kos: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleBulkCleanup = async () => {
    const result = await showConfirm(
      'SEMUA kos yang ada di arsip akan dihapus PERMANEN. Tindakan ini tidak dapat dibatalkan.',
      'Cleanup Semua Arsip?',
      'Ya, Hapus Semua',
      'Batal'
    );
    
    if (!result.isConfirmed) return;

    try {
      const response = await bulkCleanupKos();
      await showSuccess(`${response.deletedCount} kos berhasil dihapus permanen dari arsip`);
      refetch();
    } catch (err) {
      await showError('Gagal cleanup arsip: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleToggleFeatured = async (kosId: number, currentStatus: boolean) => {
    try {
      await toggleFeatured(kosId, !currentStatus);
      await showSuccess(`Kos ${!currentStatus ? 'ditambahkan ke' : 'dihapus dari'} featured`);
      refetch();
    } catch (err) {
      await showError('Gagal update status featured: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getStatusBadge = (kos: AdminKosData) => {
    const occupancyRate = kos.totalRooms > 0 ? (kos.occupiedRooms / kos.totalRooms) * 100 : 0;
    
    if (occupancyRate === 100) {
      return 'bg-red-100 text-red-800';
    } else if (occupancyRate >= 80) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && kosList.length === 0) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data kos...</p>
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
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                {showDeleted ? 'Arsip Kos' : 'Kelola Kos'}
              </h1>
              <p className="text-gray-700">
                {showDeleted ? 'Kos yang telah dihapus' : 'Manage all kos listings in the system'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showDeleted 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <span>{showDeleted ? '🏠' : '🗂️'}</span>
                {showDeleted ? 'Kos Aktif' : 'Arsip Kos'}
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Dashboard
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Cari Kos {isSearching && <span className="text-blue-500 text-xs">(mencari...)</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama, alamat, atau kota..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter by City */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Filter Kota
                </label>
                <select
                  value={filterCity}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                >
                  <option value="all">Semua Kota</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Semarang">Semarang</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Surabaya">Surabaya</option>
                </select>
              </div>

              {/* Filter by Owner Type */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Filter Owner
                </label>
                <select
                  value={filterOwnerType}
                  onChange={(e) => handleFilterChange('ownerType', e.target.value)}
                  className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                >
                  <option value="all">Semua Owner</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Urutkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                  <option value="popular">Terpopuler</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={refetch}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              {selectedKos.length > 0 && (
                <button
                  onClick={async () => {
                    const result = await showConfirm(
                      showDeleted 
                        ? `${selectedKos.length} kos yang dipilih akan dihapus PERMANEN.`
                        : `${selectedKos.length} kos yang dipilih akan dipindahkan ke arsip.`,
                      `${showDeleted ? 'Hapus Permanen' : 'Pindah ke Arsip'} ${selectedKos.length} Kos?`,
                      showDeleted ? 'Ya, Hapus Permanen' : 'Ya, Pindah ke Arsip',
                      'Batal'
                    );
                    if (result.isConfirmed) {
                      try {
                        if (showDeleted) {
                          const response = await bulkPermanentDeleteKos(selectedKos);
                          await showSuccess(`${response.deletedCount} kos berhasil dihapus permanen`);
                        } else {
                          const response = await bulkArchiveKos(selectedKos);
                          await showSuccess(`${response.archivedCount} kos berhasil dipindahkan ke arsip`);
                        }
                        setSelectedKos([]);
                        refetch();
                      } catch (err) {
                        await showError('Gagal melakukan operasi: ' + (err instanceof Error ? err.message : 'Unknown error'));
                      }
                    }
                  }}
                  disabled={bulkArchiveLoading || bulkPermanentDeleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  🗑️ {showDeleted ? 'Hapus Permanen' : 'Pindah ke Arsip'} ({selectedKos.length})
                </button>
              )}
              {showDeleted && kosList.length > 0 && (
                <button
                  onClick={handleBulkCleanup}
                  disabled={bulkCleanupLoading}
                  className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
                >
                  🧹 Cleanup Semua Arsip
                </button>
              )}
            </div>
          </div>

          {/* Kos Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {error ? (
              <div className="p-6 text-center">
                <div className="text-red-700 text-xl mb-4">❌</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedKos.length === kosList.length && kosList.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-700"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Kos Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status Kamar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {kosList.map((kos) => (
                        <tr key={kos.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedKos.includes(kos.id)}
                              onChange={() => handleSelectKos(kos.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-700"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{kos.id}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{kos.name}</div>
                              <div className="text-sm text-gray-700">{kos.title}</div>
                              {kos.isFeatured && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mt-1">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{kos.city}</div>
                            <div className="text-sm text-gray-700">{kos.address}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(kos.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(kos)}`}>
                                {kos.occupiedRooms}/{kos.totalRooms} Terisi
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {kos.totalRooms > 0 ? Math.round((kos.occupiedRooms / kos.totalRooms) * 100) : 0}% Occupancy
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{kos.owner.name}</div>
                              <div className="text-sm text-gray-700">@{kos.owner.username}</div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                kos.owner.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {kos.owner.role}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-500 text-xs space-y-1">
                              <div>👁️ {kos.viewCount} views</div>
                              <div>❤️ {kos.favoriteCount} favorites</div>
                              <div>⭐ {kos.averageRating} ({kos.reviewCount} reviews)</div>
                              <div>📸 {kos.photoCount} photos</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => router.push(`/kos/${kos.id}/view`)}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                                title="Lihat Detail"
                              >
                                👁️ View
                              </button>
                              {!showDeleted ? (
                                <>
                                  <button
                                    onClick={() => handleToggleFeatured(kos.id, kos.isFeatured)}
                                    className={`px-2 py-1 rounded text-xs ${
                                      kos.isFeatured 
                                        ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                    title={kos.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                                  >
                                    {kos.isFeatured ? '⭐ Unfeature' : '☆ Feature'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKos(kos.id)}
                                    className="text-orange-600 hover:text-orange-900 px-2 py-1 rounded hover:bg-orange-50"
                                    title="Pindah ke Arsip"
                                  >
                                    📦 Archive
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRestoreKos(kos.id)}
                                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                                    title="Pulihkan dari Arsip"
                                  >
                                    ♻️ Restore
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKos(kos.id)}
                                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                                    title="Hapus Permanen"
                                  >
                                    🗑️ Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {kosList.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🏠</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada kos ditemukan</h3>
                    <p className="text-gray-700 mb-4">
                      {searchTerm || filterCity !== 'all' || filterOwnerType !== 'all'
                        ? 'Tidak ditemukan kos dengan kriteria pencarian tersebut'
                        : 'Belum ada kos yang terdaftar'
                      }
                    </p>
                    {(searchTerm || filterCity !== 'all' || filterOwnerType !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterCity('all');
                          setFilterOwnerType('all');
                          setSortBy('newest');
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Reset filter
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Halaman {currentPage} dari {pagination.totalPages}
                        {kosList.length > 0 && (
                          <span className="ml-2">
                            (Menampilkan {((currentPage - 1) * kosPerPage) + 1}-{Math.min(currentPage * kosPerPage, kosList.length + ((currentPage - 1) * kosPerPage))} kos)
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          ← Sebelumnya
                        </button>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                          {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                          disabled={currentPage === pagination.totalPages}
                          className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Selanjutnya →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
