import React from 'react';
import clsx from 'clsx';

export interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-2xl'
};

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 'md' }) => {
  return (
    <div className="flex" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={clsx(sizeMap[size], i < rating ? 'text-yellow-400' : 'text-gray-300')}
        >
          ★
        </span>
      ))}
    </div>
  );
};
