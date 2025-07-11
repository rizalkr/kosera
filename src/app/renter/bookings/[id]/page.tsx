'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

type BookingDetail = {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  duration: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  kos: {
    id: number;
    name: string;
    address: string;
    city: string;
    facilities: string;
  };
  post: {
    id: number;
    title: string;
    price: number;
    userId: number;
  };
  user: {
    id: number;
    name: string;
    username: string;
    contact: string;
  };
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthGuard();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = params.id as string;

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch booking detail');
      }

      if (data.success) {
        setBooking(data.data.booking);
      } else {
        throw new Error(data.error || 'Failed to load booking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'cancelled':
        return 'Dibatalkan';
      case 'completed':
        return 'Selesai';
      default:
        return 'Unknown';
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          notes: 'Booking dibatalkan oleh pengguna'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh booking data
        fetchBookingDetail();
        alert('Booking berhasil dibatalkan');
      } else {
        throw new Error(data.error || 'Failed to cancel booking');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membatalkan booking');
    }
  };

  const handleContactOwner = () => {
    if (booking) {
      const message = `Halo, saya ingin menanyakan tentang booking kos ${booking.post.title} dengan ID #${booking.id}`;
      const phoneNumber = booking.user.contact.replace(/[^\d]/g, '');
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center text-gray-500">Memuat detail booking...</div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !booking) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  {error || 'Booking tidak ditemukan'}
                </h2>
                <button
                  onClick={() => router.back()}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Kembali
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Detail Booking</h1>
                  <p className="text-blue-100">ID Booking: #{booking.id}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Kos Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Kos</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">{booking.post.title}</h3>
                    <p className="text-gray-600 mb-2">{booking.kos.address}, {booking.kos.city}</p>
                    <p className="text-sm text-gray-500 mb-3">Fasilitas: {booking.kos.facilities}</p>
                    <button
                      onClick={() => router.push(`/kos/${booking.kos.id}/view`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Lihat Detail Kos →
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Kontak Pemilik</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-800">{booking.user.name}</p>
                    <p className="text-gray-600 text-sm mb-3">@{booking.user.username}</p>
                    <p className="text-gray-600 text-sm mb-3">{booking.user.contact}</p>
                    <button
                      onClick={handleContactOwner}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      Chat WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Booking</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Check-in:</span>
                      <span className="font-medium text-gray-500">{new Date(booking.checkInDate).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Check-out:</span>
                      <span className="font-medium text-gray-500">{new Date(booking.checkOutDate).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi Sewa:</span>
                      <span className="font-medium text-gray-500">{booking.duration} bulan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Booking:</span>
                      <span className="font-medium text-gray-500">{new Date(booking.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Rincian Biaya</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga per bulan:</span>
                      <span className="font-medium text-gray-500">Rp {booking.post.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi:</span>
                      <span className="font-medium text-gray-500">{booking.duration} bulan</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold text-blue-600">
                      <span>Total Harga:</span>
                      <span>Rp {booking.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Catatan</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Timeline Status</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${booking.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <span className={booking.status === 'pending' ? 'font-semibold text-yellow-700' : 'text-gray-500'}>
                      Menunggu Konfirmasi
                    </span>
                  </div>
                  <div className="ml-1.5 w-0.5 h-6 bg-gray-300"></div>
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={booking.status === 'confirmed' ? 'font-semibold text-green-700' : 'text-gray-500'}>
                      Dikonfirmasi
                    </span>
                  </div>
                  <div className="ml-1.5 w-0.5 h-6 bg-gray-300"></div>
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${booking.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className={booking.status === 'completed' ? 'font-semibold text-blue-700' : 'text-gray-500'}>
                      Selesai
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {booking.status === 'pending' && (
                  <button
                    onClick={handleCancelBooking}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Batalkan Booking
                  </button>
                )}
                
                {booking.status === 'completed' && (
                  <button className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700 transition-colors">
                    Beri Review
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cetak Invoice
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
