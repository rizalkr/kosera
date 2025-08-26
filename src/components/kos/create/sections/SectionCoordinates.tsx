import React from 'react';
import { inputBase } from '../styles';

export interface SectionCoordinatesProps {
  latitude?: number; longitude?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SectionCoordinates: React.FC<SectionCoordinatesProps> = ({ latitude, longitude, onChange }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Koordinat (Opsional)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
          <input type="number" id="latitude" name="latitude" value={latitude || ''} onChange={onChange} placeholder="-7.250445" step="any" className={`${inputBase} border-gray-300`} />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
          <input type="number" id="longitude" name="longitude" value={longitude || ''} onChange={onChange} placeholder="112.768845" step="any" className={`${inputBase} border-gray-300`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Koordinat membantu penyewa menemukan lokasi kos dengan mudah. Anda bisa mendapatkan koordinat dari Google Maps.</p>
    </div>
  );
};
