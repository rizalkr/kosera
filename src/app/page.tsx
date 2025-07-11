'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import FeaturedList from '@/components/FeaturedList';
import MapSection from '@/components/maps/MapSection';
import RecommendationCarousel from '@/components/RecommendationCarousel';
import Footer from '@/components/Footer';
import { useKosSearch } from '@/hooks/useApi';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAddFavorite, useRemoveFavorite, useFavorites } from '@/hooks/useApi';
import { SearchParams, KosData } from '@/lib/api';

export default function HomePage() {
  const [searchFilters, setSearchFilters] = useState<SearchParams>({});
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: searchResults, isLoading: isSearchLoading } = useKosSearch(searchFilters);
  const { checkFavoritePermission, isAuthenticated } = useAuthGuard();
  
  // Favorites hooks
  const { data: favoritesData } = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  
  // Extract favorites list for checking if kos is favorited
  const favoriteKosIds = new Set(
    favoritesData?.data?.favorites?.map((fav: any) => fav.kos.id) || []
  );

  const handleFilter = (filters: SearchParams) => {
    setSearchFilters(filters);
    setIsSearching(Object.keys(filters).length > 0);
  };

  const handleToggleFavorite = (kosId: number) => {
    if (!checkFavoritePermission()) {
      return; // Permission check will show appropriate message
    }

    const isFavorited = favoriteKosIds.has(kosId);
    
    if (isFavorited) {
      removeFavoriteMutation.mutate(kosId, {
        onError: (error) => {
          console.error('Failed to remove from favorites:', error);
        }
      });
    } else {
      addFavoriteMutation.mutate(kosId, {
        onError: (error) => {
          console.error('Failed to add to favorites:', error);
        }
      });
    }
  };

  const renderContent = () => {
    if (isSearching && isSearchLoading) {
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

    if (isSearching && searchResults) {
      const kosList = searchResults.data?.results || [];
      
      if (kosList.length === 0) {
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada hasil ditemukan</h3>
            <p className="text-gray-500 mb-4">Coba ubah filter pencarian Anda</p>
            <button
              onClick={() => {
                setSearchFilters({});
                setIsSearching(false);
              }}
              className="text-blue-500 hover:underline"
            >
              Lihat semua kos
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-400">
              Hasil Pencarian ({kosList.length} kos ditemukan)
            </h2>
            <button
              onClick={() => {
                setSearchFilters({});
                setIsSearching(false);
              }}
              className="text-blue-500 hover:underline text-sm"
            >
              Lihat semua kos
            </button>
          </div>
          
          <div className="space-y-6">
            {kosList.map((kos: KosData) => (
              <div key={kos.id} className="bg-[#E1F6F2] border border-blue-100 rounded-xl shadow hover:shadow-lg transition-all duration-200 relative group">
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(kos.id);
                  }}
                  disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all z-20 disabled:opacity-50"
                >
                  <svg 
                    className={`w-5 h-5 transition-colors ${
                      favoriteKosIds.has(kos.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                    fill={favoriteKosIds.has(kos.id) ? "currentColor" : "none"}
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                
                <div className="flex gap-4 p-4">
                  <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center">
                    <img
                      src="/images/rooms/room1.jpg"
                      alt="room"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-1">
                        <div className="text-blue-400 font-bold text-lg">Rp {kos.price.toLocaleString()}/bulan</div>
                      </div>
                      
                      <div className="text-gray-600 font-semibold mb-1">{kos.description}</div>
                      <div className="text-gray-500 mb-2">{kos.address}, {kos.city}</div>
                      
                      {/* Rating di tengah */}
                      {kos.averageRating && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600">{parseFloat(kos.averageRating).toFixed(1)} ({kos.reviewCount})</span>
                        </div>
                      )}
                      
                      {/* Facilities */}
                      {kos.facilities && kos.facilities.trim() && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {kos.facilities.split(',').slice(0, 3).map((facility, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                            >
                              {facility.trim()}
                            </span>
                          ))}
                          {kos.facilities.split(',').length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{kos.facilities.split(',').length - 3} lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <Link 
                        href={`/kos/${kos.id}/view`} 
                        className="text-blue-400 hover:underline font-medium text-sm transition-all relative z-10 cursor-pointer"
                        onClick={(e) => {
                          console.log('Link clicked:', `/kos/${kos.id}/view`);
                        }}
                      >
                        Lihat selengkapnya →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default content (featured + recommendations)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">Featured Rooms</h2>
          <FeaturedList />
        </div>
        <div className="space-y-8">
          <MapSection />
          <section>
            <RecommendationCarousel />
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20">
      <Header />
      <main className="mt-8">
        <h1 className="text-5xl font-bold mb-6 text-blue-400">Temukan Kos Idealmu!</h1>
        <FilterBar onFilter={handleFilter} initialFilters={searchFilters} />
        <div className="mt-8">
          {renderContent()}
        </div>
      </main>
      <Footer/>
    </div>
  );
}