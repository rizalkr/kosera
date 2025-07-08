'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type FavoriteItem = {
  id: number;
  name: string;
  address: string;
  price: number;
  rating: number;
  image: string;
  facilities: string[];
  addedDate: string;
};

const mockFavorites: FavoriteItem[] = [
  {
    id: 1,
    name: "Kos Putri Mawar",
    address: "Jl. Mawar No. 12, Semarang",
    price: 500000,
    rating: 4.5,
    image: "/images/kos1.jpg",
    facilities: ["WiFi", "AC", "Kamar Mandi Dalam"],
    addedDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Kos Putra Melati",
    address: "Jl. Melati No. 8, Semarang",
    price: 450000,
    rating: 4.2,
    image: "/images/kos2.jpg",
    facilities: ["WiFi", "Parkir", "Dapur Bersama"],
    addedDate: "2024-01-20"
  }
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(mockFavorites);
  const { user } = useAuthGuard();

  const handleRemoveFavorite = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus dari favorit?')) {
      setFavorites(favorites.filter(item => item.id !== id));
    }
  };

  const handleBookNow = (id: number) => {
    // Implementasi booking logic
    alert(`Booking kos dengan ID: ${id}`);
  };

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
                <button 
                  onClick={() => window.location.href = '/list'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Jelajahi Kos
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={favorite.image}
                        alt={favorite.name}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{favorite.name}</h3>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Hapus dari favorit"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{favorite.address}</p>
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span className="text-sm font-medium text-gray-700">{favorite.rating}</span>
                          </div>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            Ditambahkan {new Date(favorite.addedDate).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {favorite.facilities.map((facility, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Harga per bulan</p>
                            <p className="text-xl font-bold text-blue-600">
                              Rp {favorite.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm">
                              Lihat Detail
                            </button>
                            {user?.role === 'RENTER' && (
                              <button
                                onClick={() => handleBookNow(favorite.id)}
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
                  <button 
                    onClick={() => window.location.href = '/list'}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Jelajahi kos lainnya
                  </button>
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
