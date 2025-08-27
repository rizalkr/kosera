import React from 'react';
import clsx from 'clsx';

export interface FavoriteButtonProps {
  isFavorited: boolean;
  onClick: () => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorited, onClick }) => (
  <button
    onClick={onClick}
    className={clsx('p-3 rounded-full transition-all',
      isFavorited ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
    )}
    aria-pressed={isFavorited}
    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
  >
    <svg className="w-6 h-6" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  </button>
);
