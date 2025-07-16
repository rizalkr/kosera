'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import FeaturedCard from './FeaturedCard';
import { useKosRecommendations } from '@/hooks/useApi';
import { KosData } from '@/lib/api';

export default function RecommendationCarousel() {
  const { data, isLoading, error } = useKosRecommendations({ limit: 6 });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-black">Rekomendasi</h2>
        <div className="animate-pulse">
          <div className="bg-[#E1F6F2] border border-blue-100 rounded-xl p-4">
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-blue-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-blue-200 rounded w-24"></div>
                <div className="h-4 bg-blue-200 rounded w-full"></div>
                <div className="h-4 bg-blue-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-black">Rekomendasi</h2>
        <div className="text-center text-red-500 py-4">
          <p className="text-sm">Gagal memuat rekomendasi</p>
        </div>
      </div>
    );
  }

  const recommendations = data?.data?.data || [];

  if (recommendations.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-black">Rekomendasi</h2>
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">Belum ada rekomendasi tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-black">Rekomendasi</h2>
      <Swiper 
        spaceBetween={16} 
        slidesPerView={1} 
        loop={recommendations.length > 1}
        autoplay={recommendations.length > 1 ? { delay: 5000 } : false}
      >
        {recommendations.map((kos: KosData) => (
          <SwiperSlide key={kos.id}>
            <FeaturedCard 
              id={kos.id}
              images={[]} // Not needed anymore, using database photos via hook
              price={kos.price.toLocaleString()}
              description={kos.description}
              area={kos.address}
              city={kos.city}
              rating={parseFloat(kos.averageRating || '0')}
              reviewCount={kos.reviewCount}
              facilities={kos.facilities ? kos.facilities.split(', ') : []}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}