import React from 'react';

export const SellerKosListError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <div className="text-center py-12">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">Gagal Memuat Data Kos</h3>
      <p className="text-gray-500 mb-4">Terjadi kesalahan saat mengambil data kos Anda. Silakan coba lagi.</p>
      <button onClick={onRetry} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Coba Lagi</button>
    </div>
  </div>
);
