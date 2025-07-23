'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@/hooks/useAuthToken';
import ProtectedRoute from '@/components/ProtectedRoute';
import { showSuccess, showError, showLoading } from '@/lib/sweetalert';
import { AppError } from '@/types/common';

interface KosFormData {
  title: string;
  description: string;
  price: number;
  name: string;
  address: string;
  city: string;
  facilities: string;
  totalRooms: number;
  occupiedRooms?: number;
  latitude?: number;
  longitude?: number;
}

// Helper function to create kos
const createKos = async (formData: KosFormData, getToken: () => string | null, hasValidToken: () => boolean) => {
  if (!hasValidToken()) {
    throw new Error('Authentication required');
  }
  
  const token = getToken();
  if (!token) {
    throw new Error('No valid token available');
  }
  
  const response = await fetch('/api/kos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      name: formData.name,
      address: formData.address,
      city: formData.city,
      facilities: formData.facilities,
      totalRooms: formData.totalRooms,
      occupiedRooms: formData.occupiedRooms,
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create kos');
  }
  
  return result;
};

export default function NewKosPage() {
  const router = useRouter();
  const { getToken, hasValidToken } = useAuthToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<KosFormData>({
    title: '',
    description: '',
    price: 0,
    name: '',
    address: '',
    city: '',
    facilities: '',
    totalRooms: 0,
    occupiedRooms: undefined,
    latitude: undefined,
    longitude: undefined,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'totalRooms' || name === 'occupiedRooms' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul kos wajib diisi';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi kos wajib diisi';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Harga harus lebih dari 0';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Nama kos wajib diisi';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Alamat kos wajib diisi';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Kota wajib dipilih';
    }
    if (!formData.facilities.trim()) {
      newErrors.facilities = 'Fasilitas kos wajib diisi';
    }
    if (!formData.totalRooms || formData.totalRooms <= 0) {
      newErrors.totalRooms = 'Total kamar harus lebih dari 0';
    }
    if (formData.occupiedRooms && formData.occupiedRooms > formData.totalRooms) {
      newErrors.occupiedRooms = 'Kamar terisi tidak boleh lebih dari total kamar';
    }
    if (formData.occupiedRooms && formData.occupiedRooms < 0) {
      newErrors.occupiedRooms = 'Kamar terisi tidak boleh negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Show loading alert
    showLoading('Menyimpan kos baru...');

    try {
      const response = await createKos({
        ...formData,
        price: Number(formData.price),
      }, getToken, hasValidToken);

      if (response.data) {
        // Close loading and show success
        await showSuccess(
          'Kos baru berhasil dibuat! Anda akan dialihkan ke halaman detail kos.',
          'Berhasil!'
        );
        
        // Redirect ke halaman detail kos yang baru dibuat
        const newKosId = response.data.id;
        if (newKosId) {
          router.push(`/seller/kos/${newKosId}`);
        } else {
          router.push('/seller/kos');
        }
      } else {
        await showError('Gagal membuat kos baru. Silakan coba lagi.');
        setErrors({ general: 'Gagal membuat kos baru' });
      }
    } catch (error: unknown) {
      const appError = error as AppError;
      console.error('Error creating kos:', appError);
      await showError(
        appError.message || 'Terjadi kesalahan saat membuat kos baru. Silakan coba lagi.',
        'Gagal Menyimpan'
      );
      setErrors({ 
        general: appError.message || 'Terjadi kesalahan saat membuat kos baru' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cities = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bekasi', 'Semarang',
    'Makassar', 'Palembang', 'Tangerang', 'Bogor', 'Batam', 'Pekanbaru',
    'Bandar Lampung', 'Yogyakarta', 'Malang', 'Solo', 'Denpasar', 'Balikpapan'
  ];

  const facilitiesOptions = [
    'WiFi', 'AC', 'Parkir', 'Kamar Mandi Dalam', 'Kamar Mandi Luar',
    'Dapur Bersama', 'Ruang Tamu', 'Laundry', 'Security 24 Jam',
    'CCTV', 'Kasur', 'Lemari', 'Meja Belajar', 'Kursi', 'TV',
    'Kulkas', 'Dispenser', 'Jemuran', 'Taman', 'Musholla'
  ];

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
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

          {/* Error Message */}
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

          {/* Form */}
          <div className="bg-white shadow-sm rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informasi Dasar */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Kos *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Contoh: Kos Putri Nyaman di Pusat Kota"
                      className={`text-gray-900 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Kos *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Contoh: Kos Putri Mawar"
                      className={`text-gray-900 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Kos *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Jelaskan secara detail tentang kos Anda, kondisi kamar, lingkungan sekitar, dan keunggulan lainnya..."
                      className={`text-gray-900 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label htmlFor="totalRooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Kamar *
                    </label>
                    <input
                      type="number"
                      id="totalRooms"
                      name="totalRooms"
                      value={formData.totalRooms || ''}
                      onChange={handleInputChange}
                      placeholder="10"
                      min="1"
                      className={`text-gray-900 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.totalRooms ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.totalRooms && <p className="text-red-500 text-xs mt-1">{errors.totalRooms}</p>}
                  </div>

                  <div>
                    <label htmlFor="occupiedRooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Kamar Terisi (Opsional)
                    </label>
                    <input
                      type="number"
                      id="occupiedRooms"
                      name="occupiedRooms"
                      value={formData.occupiedRooms || ''}
                      onChange={handleInputChange}
                      placeholder="2"
                      min="0"
                      max={formData.totalRooms || undefined}
                      className={`text-gray-900 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.occupiedRooms ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.occupiedRooms && <p className="text-red-500 text-xs mt-1">{errors.occupiedRooms}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Jumlah kamar yang sudah dihuni saat ini
                    </p>
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lokasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-gray-500 md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Contoh: Jl. Merdeka No. 123, RT 02/RW 05, Kelurahan Sumber, Kecamatan Banjarsari"
                      className={`text-gray-500 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Kota *
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`text-gray-500 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Kota</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Harga per Bulan *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price || ''}
                        onChange={handleInputChange}
                        placeholder="500000"
                        min="0"
                        className={`text-gray-500 w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                </div>
              </div>
              {/* Fasilitas */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fasilitas</h2>
                <div>
                  <label htmlFor="facilities" className="block text-sm font-medium text-gray-700 mb-2">
                    Fasilitas yang Tersedia *
                  </label>
                  <textarea
                    id="facilities"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Contoh: WiFi, AC, Kamar Mandi Dalam, Kasur, Lemari, Meja Belajar, Parkir, Security 24 Jam"
                    className={`text-gray-900 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.facilities ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.facilities && <p className="text-red-500 text-xs mt-1">{errors.facilities}</p>}
                  
                  {/* Fasilitas Suggestions */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Saran fasilitas (klik untuk menambahkan):</p>
                    <div className="flex flex-wrap gap-2">
                      {facilitiesOptions.map(facility => (
                        <button
                          key={facility}
                          type="button"
                          onClick={() => {
                            const current = formData.facilities;
                            if (!current.includes(facility)) {
                              setFormData(prev => ({
                                ...prev,
                                facilities: current ? `${current}, ${facility}` : facility
                              }));
                            }
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-200 transition-colors"
                        >
                          {facility}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Koordinat (Opsional) */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Koordinat (Opsional)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude || ''}
                      onChange={handleInputChange}
                      placeholder="-7.250445"
                      step="any"
                      className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude || ''}
                      onChange={handleInputChange}
                      placeholder="112.768845"
                      step="any"
                      className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Koordinat membantu penyewa menemukan lokasi kos dengan mudah. Anda bisa mendapatkan koordinat dari Google Maps.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </div>
                  ) : (
                    'Simpan Kos'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips untuk Kos yang Menarik</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Gunakan judul yang menarik dan deskriptif seperti &ldquo;Kos Putri Nyaman Dekat Kampus&rdquo;</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Sertakan fasilitas lengkap dan kondisi kamar secara detail</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Tentukan total kamar dan kamar terisi dengan akurat untuk transparansi</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Tentukan harga yang kompetitif sesuai lokasi dan fasilitas</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Setelah membuat kos, jangan lupa upload foto untuk menarik lebih banyak penyewa</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
