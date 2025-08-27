import React from 'react';
import { OwnerInfoCard } from '../molecules/OwnerInfoCard';
import { LocationCard } from '../molecules/LocationCard';
import { QuickStatsCard } from '../molecules/QuickStatsCard';

export interface SidebarPanelProps {
  owner?: { name?: string; contact?: string };
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  viewCount: number;
  favoriteCount: number;
  reviewCount: number;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({ owner, latitude, longitude, address, city, viewCount, favoriteCount, reviewCount }) => (
  <div className="space-y-6">
    <OwnerInfoCard owner={owner} />
    {latitude && longitude && (
      <LocationCard address={address} city={city} latitude={latitude} longitude={longitude} />
    )}
    <QuickStatsCard viewCount={viewCount} favoriteCount={favoriteCount} reviewCount={reviewCount} />
  </div>
);
