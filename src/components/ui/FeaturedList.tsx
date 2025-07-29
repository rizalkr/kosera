'use client';

import { useMemo } from 'react';
import FeaturedCard from './FeaturedCard';
import { useKosFeatured, useFavorites } from '@/hooks/useApi';
import { FavoriteKos, PublicKosData } from '@/types';

export default function FeaturedList() {
  const { data, isLoading, error } = useKosFeatured();
  const { data: favoritesData } = useFavorites();

  // Extract favorite kos IDs - memoized to prevent infinite loops
  const favoriteKosIds = useMemo(() => {
    if (!favoritesData?.data?.favorites) return new Set();
    return new Set(favoritesData.data.favorites.map((fav: FavoriteKos) => fav.kos.id));
  }, [favoritesData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#E1F6F2] border border-blue-100 rounded-xl shadow p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-blue-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-blue-200 rounded w-24"></div>
                <div className="h-4 bg-blue-200 rounded w-full"></div>
                <div className="h-4 bg-blue-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Gagal memuat data kos. Silakan coba lagi.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-400 hover:underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  const kosList = data?.data || [];

  if (kosList.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Tidak ada kos yang tersedia saat ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {kosList.map((kos: PublicKosData) => (
        <FeaturedCard 
          key={kos.id} 
          id={kos.id}
          images={[]} // Not needed anymore, using database photos via hook
          price={kos.price.toLocaleString()}
          description={kos.description}
          area={kos.address}
          city={kos.city}
          rating={parseFloat(kos.averageRating || '0')}
          reviewCount={kos.reviewCount}
          facilities={kos.facilities ? kos.facilities.split(', ') : []}
          isFavorite={favoriteKosIds.has(kos.id)}
        />
      ))}
    </div>
  );
}