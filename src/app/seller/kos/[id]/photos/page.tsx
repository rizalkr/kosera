'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useKosDetails } from '@/hooks/useApi';

export default function SellerKosPhotosPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthGuard();
  const kosId = params.id as string;
  
  const { data: kosResponse, isLoading, error, refetch } = useKosDetails(parseInt(kosId));
  const kosData = kosResponse?.data;
  
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    // TODO: Implement photo upload logic
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFiles(null);
      // Refresh data setelah upload
      refetch();
    }, 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-6 w-64"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error || !kosData) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center py-12">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Gagal Memuat Data Kos</h3>
                <p className="text-gray-500 mb-4">
                  Terjadi kesalahan saat mengambil data kos untuk mengelola foto.
                </p>
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => refetch()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Coba Lagi
                  </button>
                  <button 
                    onClick={() => router.push(`/seller/kos/${kosId}`)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Kembali ke Detail
                  </button>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <button 
                    onClick={() => router.push(`/seller/kos/${kosId}`)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                  >
                    ← Kembali
                  </button>
                  <h1 className="text-3xl font-bold text-blue-600">Kelola Foto Kos</h1>
                </div>
                <p className="text-gray-600">
                  Atur foto untuk <span className="font-semibold">{kosData.name}</span>
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📸 Upload Foto Baru</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label 
                    htmlFor="photo-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-blue-600 text-4xl mb-4">📷</div>
                    <div className="text-blue-600 font-medium mb-2">
                      Klik untuk pilih foto atau drag & drop
                    </div>
                    <div className="text-blue-500 text-sm">
                      Maksimal 10 foto, format JPG/PNG, ukuran maksimal 5MB per foto
                    </div>
                  </label>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      {selectedFiles.length} foto dipilih:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Mengupload...' : 'Upload Foto'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Current Photos */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto Saat Ini</h3>
              
              {/* Demo photos - in real implementation, this would come from API */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  '/images/rooms/room1.jpg',
                  '/images/rooms/room2.jpg', 
                  '/images/rooms/room3.jpg',
                  '/images/profile.jpg'
                ].map((photo, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    <div className="relative">
                      <img
                        src={photo}
                        alt={`Foto kos ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/profile.jpg";
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors">
                          🗑️
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            Foto Utama
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Foto {index + 1}</span>
                        <div className="flex space-x-2">
                          {index !== 0 && (
                            <button className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                              Jadikan Utama
                            </button>
                          )}
                          <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state if no photos */}
              {false && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-gray-300 text-6xl mb-4">📷</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Foto</h3>
                  <p className="text-gray-500 mb-4">
                    Upload foto pertama untuk membuat kos Anda lebih menarik bagi calon penyewa.
                  </p>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">💡 Tips Foto yang Menarik</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-900">Pencahayaan yang Baik</div>
                      <div className="text-yellow-700">Gunakan cahaya alami atau lampu yang cukup terang</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-900">Sudut yang Menampilkan Ruang</div>
                      <div className="text-yellow-700">Ambil foto dari sudut yang memperlihatkan ukuran ruangan</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-900">Ruangan yang Rapi</div>
                      <div className="text-yellow-700">Pastikan ruangan bersih dan tertata rapi</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-900">Foto Fasilitas</div>
                      <div className="text-yellow-700">Sertakan foto kamar mandi, dapur, dan area bersama</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-900">Kualitas Tinggi</div>
                      <div className="text-yellow-700">Upload foto dengan resolusi tinggi dan tidak blur</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">6</div>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-900">Urutan yang Logis</div>
                      <div className="text-yellow-700">Atur foto mulai dari kamar utama hingga fasilitas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <button 
                onClick={() => router.push(`/seller/kos/${kosId}`)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Kembali ke Detail
              </button>
              <button 
                onClick={() => router.push(`/kos/${kosId}`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Lihat Sebagai Pengunjung
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
