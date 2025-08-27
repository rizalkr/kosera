import React from 'react';

export interface OwnerInfoCardProps {
  owner?: { name?: string; contact?: string };
}

export const OwnerInfoCard: React.FC<OwnerInfoCardProps> = ({ owner }) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <h3 className="font-semibold text-gray-800 mb-3">Informasi Pemilik</h3>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">Nama:</span>
        <span className="text-gray-600">{owner?.name || 'Tidak tersedia'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">Kontak:</span>
        <span className="text-gray-600">{owner?.contact || 'Tidak tersedia'}</span>
      </div>
    </div>
    <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
      Hubungi Pemilik
    </button>
  </div>
);
