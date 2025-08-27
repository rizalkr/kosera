import React from 'react';
import { StatItem } from '../atoms/StatItem';

export interface QuickStatsCardProps {
  viewCount: number;
  favoriteCount: number;
  reviewCount: number;
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ viewCount, favoriteCount, reviewCount }) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <h3 className="font-semibold text-gray-800 mb-3">Statistik</h3>
    <div className="space-y-2 text-sm">
      <StatItem label="Dilihat" value={viewCount} />
      <StatItem label="Favorit" value={favoriteCount} />
      <StatItem label="Ulasan" value={reviewCount} />
    </div>
  </div>
);
