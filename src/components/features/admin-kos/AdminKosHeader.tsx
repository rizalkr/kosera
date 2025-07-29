'use client';

import { useRouter } from 'next/navigation';

interface AdminKosHeaderProps {
  showDeleted: boolean;
  onToggleView: () => void;
}

export function AdminKosHeader({ showDeleted, onToggleView }: AdminKosHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {showDeleted ? 'Arsip Kos' : 'Manajemen Kos'}
        </h1>
        <p className="text-gray-600">
          {showDeleted ? 'Kelola kos yang telah dihapus atau diarsipkan.' : 'Kelola semua properti kos yang ada di sistem.'}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onToggleView}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            showDeleted
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          <span>{showDeleted ? '🏠' : '🗂️'}</span>
          {showDeleted ? 'Lihat Kos Aktif' : 'Lihat Arsip'}
        </button>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ← Dashboard
        </button>
      </div>
    </div>
  );
}