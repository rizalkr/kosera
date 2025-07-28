'use client';

import { FavoriteKos } from '@/types/favorites';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import KosImage from '@/components/ui/KosImage';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useFavorites, useRemoveFavorite } from '@/hooks/useApi';
import { showConfirm } from '@/lib/sweetalert';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user } = useAuthGuard();
  const { data: favoritesData, isLoading, error } = useFavorites();
  const removeFavoriteMutation = useRemoveFavorite();

  const handleRemoveFavorite = async (kosId: number) => {
    const result = await showConfirm('Apakah Anda yakin ingin menghapus dari favorit?', 'Konfirmasi Hapus', 'Ya, Hapus', 'Batal');
    if (result.isConfirmed) {
      removeFavoriteMutation.mutate(kosId);
    }
  };

  const handleBookNow = (kosId: number) => {
    // Navigate to booking page or open booking modal
    window.location.href = `/kos/${kosId}/view`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER', 'SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="animate-pulse space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex gap-4">
                      <div className="w-48 h-32 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER', 'SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Gagal Memuat Favorit</h1>
              <p className="text-gray-600 mb-6">Terjadi kesalahan saat memuat daftar favorit Anda.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const favorites = favoritesData?.data?.favorites || [];

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['RENTER', 'SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Favorit Saya</h1>
              <p className="text-gray-600">Kos-kos yang telah Anda simpan</p>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Selamat datang, <span className="font-semibold text-blue-600">{user?.username}</span>!
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada kos favorit</h3>
                <p className="text-gray-500 mb-4">
                  Mulai dengan menambahkan kos ke favorit Anda saat browsing
                </p>
                <Link 
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Jelajahi Kos
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {favorites.map((favorite: FavoriteKos) => (
                  <div key={favorite.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden relative">
                        <KosImage
                          kosId={favorite.kos.id}
                          kosName={favorite.kos.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{favorite.kos.name}</h3>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.kos.id)}
                            disabled={removeFavoriteMutation.isPending}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                            title="Hapus dari favorit"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{favorite.kos.address}, {favorite.kos.city}</p>
                        <div className="flex items-center mb-3">
                          {favorite.post.averageRating > 0 && (
                            <>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">
                                  {favorite.post.averageRating.toFixed(1)}
                                </span>
                              </div>
                              <span className="mx-2 text-gray-400">•</span>
                            </>
                          )}
                          <span className="text-sm text-gray-500">
                            Ditambahkan {new Date(favorite.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {favorite.kos.facilities.split(',').slice(0, 3).map((facility: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {facility.trim()}
                            </span>
                          ))}
                          {favorite.kos.facilities.split(',').length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{favorite.kos.facilities.split(',').length - 3} lainnya
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Harga per bulan</p>
                            <p className="text-xl font-bold text-blue-600">
                              Rp {favorite.post.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/kos/${favorite.kos.id}/view`}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm"
                            >
                              Lihat Detail
                            </Link>
                            {user?.role === 'RENTER' && (
                              <button
                                onClick={() => handleBookNow(favorite.kos.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                              >
                                Book Sekarang
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {favorites.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Total {favorites.length} kos dalam favorit Anda
                  </p>
                  <Link 
                    href="/"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Jelajahi kos lainnya
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
