import React from 'react';
import { RatingStars } from '../atoms/RatingStars';
import { FavoriteButton } from '../atoms/FavoriteButton';
import { PriceTag } from '../atoms/PriceTag';

export interface HeaderSectionProps {
  name: string;
  address: string;
  city: string;
  averageRating?: string | number;
  totalReviews?: number;
  viewCount: number;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onOpenBooking: () => void;
  isAuthenticated: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  name,
  address,
  city,
  averageRating,
  totalReviews,
  viewCount,
  isFavorited,
  onToggleFavorite,
  onOpenBooking,
  isAuthenticated
}) => (
  <div className="p-8 pb-4">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{name}</h1>
        <p className="text-gray-600 text-lg mb-2">{address}, {city}</p>
        <div className="flex items-center gap-4 mb-4">
          {averageRating && Number(averageRating) > 0 && (
            <div className="flex items-center gap-1">
              <RatingStars rating={Math.round(Number(averageRating))} />
              <span className="text-gray-600 ml-2">
                {Number(averageRating).toFixed(1)} ({totalReviews} ulasan)
              </span>
            </div>
          )}
          <div className="text-sm text-gray-500">
            {viewCount} dilihat
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FavoriteButton isFavorited={isFavorited} onClick={onToggleFavorite} />
        <div className="text-right">
          <PriceTag price={0} />
          {/* Price will be replaced at usage site if needed */}
          <button
            onClick={onOpenBooking}
            className="mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {isAuthenticated ? 'Booking Sekarang' : 'Login untuk Booking'}
          </button>
        </div>
      </div>
    </div>
  </div>
);
