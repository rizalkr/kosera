import React from 'react';

export interface LocationCardProps {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({ address, city, latitude, longitude }) => {
  if (!latitude || !longitude) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-3">Lokasi</h3>
      <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Peta akan ditampilkan di sini</span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{address}, {city}</p>
    </div>
  );
};
