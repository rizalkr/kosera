'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import FeaturedCard from './FeaturedCard';

const recommendations = [
  { id: 1, images: ['/images/room1.jpg', '/images/room2.jpg'], price: '500K', description: 'Double kos...', area: 'Tlogosari', city: 'Semarang' },
  { id: 2, images: ['/images/room3.jpg', '/images/room1.jpg'], price: '600K', description: 'Single kos...', area: 'Tlogosari', city: 'Semarang' },
];

export default function RecommendationCarousel() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Rekomendasi</h2>
      <Swiper spaceBetween={16} slidesPerView={1} loop>
        {recommendations.map(room => (
          <SwiperSlide key={room.id}>
            <FeaturedCard {...room} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}