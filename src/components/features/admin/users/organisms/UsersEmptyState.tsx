import React from 'react';

export interface UsersEmptyStateProps {
  hasFilters: boolean;
  onReset: () => void;
  onCreate?: () => void;
}

export const UsersEmptyState: React.FC<UsersEmptyStateProps> = ({ hasFilters, onReset, onCreate }) => (
  <div className="text-center py-12">
    <div className="text-gray-400 text-6xl mb-4">👥</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada users</h3>
    <p className="text-gray-700 mb-4">{hasFilters ? 'Tidak ditemukan users dengan kriteria pencarian tersebut' : 'Belum ada users yang terdaftar'}</p>
    {hasFilters ? (
      <button onClick={onReset} className="text-blue-600 hover:text-blue-700">Reset filter</button>
    ) : (
      onCreate && <button onClick={onCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Tambah User Pertama</button>
    )}
  </div>
);
