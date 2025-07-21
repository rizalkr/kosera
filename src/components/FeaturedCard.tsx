'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTrackView, useAddFavorite, useRemoveFavorite } from '../hooks/useApi';
import { useProtectedAction } from '../hooks/useProtectedAction';
import { useKosImage } from '../hooks/useKosImage';

interface FeaturedCardProps {
  id: number;
  images: string[];
  price: string;
  description: string;
  area: string;
  city: string;
  rating?: number;
  reviewCount?: number;
  facilities?: string[];
  isFavorite?: boolean;
}

export default function FeaturedCard({ 
  id,
  price, 
  description, 
  area, 
  city,
  rating,
  reviewCount = 0,
  facilities = [],
  isFavorite = false
}: FeaturedCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorite);
  const trackView = useTrackView();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { executeProtectedAction } = useProtectedAction();
  const { imageUrl, hasPhotos } = useKosImage(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    executeProtectedAction(() => {
      if (isLiked) {
        removeFavorite.mutate(id, {
          onSuccess: () => setIsLiked(false),
        });
      } else {
        addFavorite.mutate(id, {
          onSuccess: () => setIsLiked(true),
        });
      }
    }, {
      message: 'Login untuk menambahkan kos ke favorit'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">☆</span>
      );
    }

    return stars;
  };

  return (
    <div 
      className="bg-[#E1F6F2] border border-blue-100 rounded-xl shadow hover:shadow-lg transition-all duration-200 cursor-pointer relative group"
    >
      {/* Favorite button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-all"
        disabled={addFavorite.isPending || removeFavorite.isPending}
      >
        <span className={`text-lg ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
          {isLiked ? '❤️' : '🤍'}
        </span>
      </button>

      <div className="flex gap-4 p-4">
        <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center relative">
          <Image
            src={imageUrl}
            alt={description}
            width={128}
            height={128}
            className="object-cover w-full h-full"
            onError={() => {
              console.log('Image failed to load for featured kos:', id);
            }}
          />
          {!hasPhotos && (
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
              Sample
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-1">
              <div className="text-blue-400 font-bold text-lg">Rp {price}/bulan</div>
            </div>
            
            <div className="text-gray-600 font-semibold mb-1">{description}</div>
            <div className="text-gray-500 mb-2">{area}, {city}</div>
            
            {/* Rating di tengah */}
            {rating && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">{renderStars(rating)}</div>
                <span className="text-sm text-gray-500">({reviewCount})</span>
              </div>
            )}
            
            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {facilities.slice(0, 3).map((facility, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                  >
                    {facility}
                  </span>
                ))}
                {facilities.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{facilities.length - 3} lainnya
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Link
              href={`/kos/${id}/view`}
              className="text-blue-400 hover:underline font-medium text-sm transition-all relative z-10"
              onClick={(e) => {
                e.stopPropagation();
                trackView.mutate(id);
                console.log('Navigate to kos detail:', id);
              }}
            >
              Lihat selengkapnya →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}