import React from 'react';

export interface UsersPaginationProps {
  page: number;
  totalPages: number;
  perPage: number;
  currentCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export const UsersPagination: React.FC<UsersPaginationProps> = ({ page, totalPages, perPage, currentCount, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Halaman {page} dari {totalPages}{currentCount > 0 && (<span className="ml-2">(Menampilkan {( (page - 1) * perPage) + 1}-{Math.min(page * perPage, (page - 1) * perPage + currentCount)} users)</span>)}</div>
        <div className="flex space-x-2">
          <button onClick={onPrev} disabled={page === 1} className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">← Sebelumnya</button>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">{page}</span>
          <button onClick={onNext} disabled={page === totalPages} className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Selanjutnya →</button>
        </div>
      </div>
    </div>
  );
};
