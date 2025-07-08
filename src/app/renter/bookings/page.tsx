'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

type BookingItem = {
  id: number;
  kosName: string;
  address: string;
  price: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  image: string;
  bookingDate: string;
};

const mockBookings: BookingItem[] = [
  {
    id: 1,
    kosName: "Kos Putri Mawar",
    address: "Jl. Mawar No. 12, Semarang",
    price: 500000,
    checkIn: "2024-01-15",
    checkOut: "2024-02-15",
    status: "confirmed",
    image: "/images/kos1.jpg",
    bookingDate: "2024-01-10"
  },
  {
    id: 2,
    kosName: "Kos Putra Melati",
    address: "Jl. Melati No. 8, Semarang",
    price: 450000,
    checkIn: "2024-02-01",
    checkOut: "2024-03-01",
    status: "pending",
    image: "/images/kos2.jpg",
    bookingDate: "2024-01-25"
  }
];

export default function RenterBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>(mockBookings);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
  const { user } = useAuthGuard();

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedStatus);

  const handleCancelBooking = (id: number) => {
    if (confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: 'cancelled' } : booking
      ));
    }
  };

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Booking Saya</h1>
              <p className="text-gray-600">Kelola semua booking kos Anda</p>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Selamat datang, <span className="font-semibold text-blue-600">{user?.username}</span>!
            </div>

            {/* Filter Status */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semua ({bookings.length})
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Menunggu ({bookings.filter(b => b.status === 'pending').length})
              </button>
              <button
                onClick={() => setSelectedStatus('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'confirmed' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Dikonfirmasi ({bookings.filter(b => b.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setSelectedStatus('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'completed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Selesai ({bookings.filter(b => b.status === 'completed').length})
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {selectedStatus === 'all' ? 'Belum ada booking' : `Tidak ada booking ${getStatusText(selectedStatus as BookingStatus)}`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedStatus === 'all' 
                    ? 'Mulai dengan mencari kos yang Anda sukai' 
                    : 'Coba filter status lain untuk melihat booking Anda'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={booking.image}
                        alt={booking.kosName}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{booking.kosName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{booking.address}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Check-in</p>
                            <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Check-out</p>
                            <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Total Harga</p>
                            <p className="text-xl font-bold text-blue-600">
                              Rp {booking.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                              >
                                Batalkan
                              </button>
                            )}
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                              Lihat Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
