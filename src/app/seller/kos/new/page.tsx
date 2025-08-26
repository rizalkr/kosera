'use client';

import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { KosFormShell } from '@/components/kos/create/KosFormShell';
import { useRouter } from 'next/navigation';

export default function NewKosPage() {
  const router = useRouter();
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Kos Baru</h1>
            <p className="text-gray-600 mt-2">
              Lengkapi informasi kos Anda untuk menarik lebih banyak penyewa
            </p>
          </div>
          <KosFormShell />
        </div>
      </div>
    </ProtectedRoute>
  );
}
