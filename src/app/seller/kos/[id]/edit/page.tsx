'use client';

import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import Header from '@/components/layouts/Header';
import { useEditKos } from '@/hooks/seller/kos/useEditKos';
import { EditKosForm } from '@/components/features/seller/kos/edit/organisms/EditKosForm';

// Cities & facilities static lists (could be moved to constants file later)
const CITIES = [
  'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bekasi', 'Semarang',
  'Makassar', 'Palembang', 'Tangerang', 'Bogor', 'Batam', 'Pekanbaru',
  'Bandar Lampung', 'Yogyakarta', 'Malang', 'Solo', 'Denpasar', 'Balikpapan'
];

const FACILITIES = [
  'WiFi', 'AC', 'Parkir', 'Kamar Mandi Dalam', 'Kamar Mandi Luar',
  'Dapur Bersama', 'Ruang Tamu', 'Laundry', 'Security 24 Jam',
  'CCTV', 'Kasur', 'Lemari', 'Meja Belajar', 'Kursi', 'TV',
  'Kulkas', 'Dispenser', 'Jemuran', 'Taman', 'Musholla'
];

function EditKosPage() {
  const { kosId, formData, errors, isLoading, isSubmitting, handleChange, handleSubmit, handleCancel } = useEditKos();

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-6 w-64" />
                <div className="space-y-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32" />
                      <div className="h-10 bg-gray-300 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => window.location.assign(`/seller/kos/${kosId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Detail Kos
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Kos</h1>
            <p className="text-gray-600 mt-2">Perbarui informasi kos Anda untuk menarik lebih banyak penyewa</p>
          </div>

          {/* Error General */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                  <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg">
            <EditKosForm
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              isSubmitting={isSubmitting}
              cities={CITIES}
              facilitiesOptions={FACILITIES}
            />
          </div>

          {/* Tips */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Tips Penting untuk Edit Kos</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0" /><span>Pastikan semua informasi yang diubah akurat dan terbaru</span></li>
              <li className="flex items-start"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0" /><span>Perubahan harga atau fasilitas dapat mempengaruhi minat penyewa</span></li>
              <li className="flex items-start"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0" /><span>Update status kamar terisi secara berkala untuk transparansi</span></li>
              <li className="flex items-start"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0" /><span>Jika mengubah lokasi atau alamat, pastikan koordinat juga diperbarui</span></li>
              <li className="flex items-start"><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0" /><span>Perubahan akan langsung terlihat oleh calon penyewa setelah disimpan</span></li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};
export default EditKosPage;
