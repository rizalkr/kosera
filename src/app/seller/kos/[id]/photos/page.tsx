'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthToken } from '@/hooks/useAuthToken';
import { useKosDetails } from '@/hooks/useApi';
import { showSuccess, showError, showConfirm, showLoading, showToast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';

export default function SellerKosPhotosPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthGuard();
  const { getToken, hasValidToken } = useAuthToken();
  const kosId = params.id as string;
  
  const { data: kosResponse, isLoading, error, refetch } = useKosDetails(parseInt(kosId));
  const kosData = kosResponse?.data;
  
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  // Fetch photos
  const fetchPhotos = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`/api/kos/${kosId}/photos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setPhotos(data.data.photos || []);
      } else {
        console.error('Failed to fetch photos:', data.error);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    if (kosId) {
      fetchPhotos();
    }
  }, [kosId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    validateAndSetFiles(files);
  };

  const validateAndSetFiles = (files: FileList | null) => {
    if (files) {
      // Validate file count
      if (files.length > 10) {
        showError('Maksimal 10 foto dapat diupload sekaligus');
        return;
      }

      // Validate each file
      let hasError = false;
      Array.from(files).forEach(file => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          showError(`File ${file.name} bukan format gambar yang didukung`);
          hasError = true;
          return;
        }

        // Check file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          showError(`File ${file.name} terlalu besar. Maksimal 5MB per foto`);
          hasError = true;
          return;
        }
      });

      if (!hasError) {
        setSelectedFiles(files);
      }
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    validateAndSetFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    showLoading('Mengupload foto...');
    setIsUploading(true);
    
    try {
      const token = getToken();
      if (!token) {
        Swal.close();
        setIsUploading(false);
        return;
      }
      
      const formData = new FormData();
      
      Array.from(selectedFiles).forEach(file => {
        formData.append('photos', file);
      });

      // Set first photo as primary if no photos exist yet
      const isFirstUpload = photos.length === 0;
      if (isFirstUpload) {
        formData.append('isPrimary', 'true');
      }

      const response = await fetch(`/api/kos/${kosId}/photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        Swal.close();
        showSuccess(data.message || 'Foto berhasil diupload');
        setSelectedFiles(null);
        // Reset file input
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Refresh photos
        await fetchPhotos();
        // Refresh kos data to update photo count
        refetch();
      } else {
        Swal.close();
        showError(data.error || 'Gagal mengupload foto');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Swal.close();
      showError('Terjadi kesalahan saat mengupload foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number, photoUrl: string) => {
    const result = await showConfirm(
      'Foto yang dihapus tidak dapat dikembalikan',
      'Hapus foto ini?',
      'Ya, Hapus',
      'Batal'
    );

    if (result.isConfirmed) {
      showLoading('Menghapus foto...');
      
      try {
        const token = getToken();
        if (!token) {
          Swal.close();
          return;
        }

        const response = await fetch(`/api/kos/${kosId}/photos`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photoId }),
        });

        const data = await response.json();
        
        if (data.success) {
          Swal.close();
          showToast('Foto berhasil dihapus', 'success');
          // Refresh photos
          await fetchPhotos();
          // Refresh kos data to update photo count
          refetch();
        } else {
          Swal.close();
          showError(data.error || 'Gagal menghapus foto');
        }
      } catch (error) {
        console.error('Delete error:', error);
        Swal.close();
        showError('Terjadi kesalahan saat menghapus foto');
      }
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    const result = await showConfirm(
      'Foto ini akan menjadi foto utama yang ditampilkan pertama kali',
      'Jadikan foto utama?',
      'Ya, Jadikan Utama',
      'Batal'
    );

    if (result.isConfirmed) {
      showLoading('Mengatur foto utama...');
      
      try {
        const token = getToken();
        if (!token) {
          Swal.close();
          return;
        }
        
        const response = await fetch(`/api/kos/${kosId}/photos/${photoId}/primary`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (data.success) {
          Swal.close();
          showToast('Foto utama berhasil diatur', 'success');
          // Refresh photos
          await fetchPhotos();
        } else {
          Swal.close();
          showError(data.error || 'Gagal mengatur foto utama');
        }
      } catch (error) {
        console.error('Set primary error:', error);
        Swal.close();
        showError('Terjadi kesalahan saat mengatur foto utama');
      }
    }
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
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-blue-300 hover:border-blue-400 hover:bg-blue-25'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="relative mb-2">
                            <img 
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-16 object-cover rounded"
                              onLoad={(e) => {
                                // Clean up object URL after image loads
                                URL.revokeObjectURL(e.currentTarget.src);
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                      {isUploading ? 'Mengupload...' : 'Upload Foto'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Current Photos */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Foto Saat Ini ({photos.length} foto)
              </h3>
              
              {loadingPhotos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
                  ))}
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <div className="relative">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Foto kos ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/profile.jpg";
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <button 
                            onClick={() => handleDeletePhoto(photo.id, photo.url)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                            title="Hapus foto"
                          >
                            🗑️
                          </button>
                        </div>
                        {photo.isPrimary && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                              Foto Utama
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {photo.caption || `Foto ${index + 1}`}
                          </span>
                          <div className="flex space-x-2">
                            {!photo.isPrimary && (
                              <button 
                                onClick={() => handleSetPrimary(photo.id)}
                                className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                              >
                                Jadikan Utama
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Upload: {new Date(photo.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
