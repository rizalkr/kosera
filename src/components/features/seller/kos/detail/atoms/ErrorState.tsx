import React from 'react';

export interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onBack: () => void;
}

export const SellerKosDetailError: React.FC<ErrorStateProps> = ({ message, onRetry, onBack }) => (
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <div className="text-center py-12">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">Gagal Memuat Detail Kos</h3>
      <p className="text-gray-500 mb-4">{message || 'Terjadi kesalahan saat mengambil detail kos.'}</p>
      <div className="flex justify-center space-x-4">
        <button onClick={onRetry} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Coba Lagi</button>
        <button onClick={onBack} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium">Kembali ke Daftar Kos</button>
      </div>
    </div>
  </div>
);
