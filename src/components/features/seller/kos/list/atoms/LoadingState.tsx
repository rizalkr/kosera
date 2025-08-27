import React from 'react';

export const SellerKosListLoading: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Memuat data kos Anda...</p>
      </div>
    </div>
  </div>
);
