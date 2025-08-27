import React from 'react';
import { RatingStars } from '../atoms/RatingStars';

export interface ReviewItemProps {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
  formatDate: (date: string) => string;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ id, rating, comment, createdAt, user, formatDate }) => (
  <div key={id} className="border-b border-gray-200 pb-4">
    <div className="flex items-start justify-between mb-2">
      <div>
        <div className="font-semibold text-gray-800">{user.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <RatingStars rating={rating} size="sm" />
          <span className="text-sm text-gray-500">{formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
    <p className="text-gray-600">{comment}</p>
  </div>
);
