"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useBookings, useUpdateBooking } from '@/hooks/useApi';

type BookingItem = {
  id: number;
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
  };
  checkInDate: string;
  checkOutDate: string;
  duration: number;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function BookingsPage() {
  const { user } = useAuthGuard();
  const { data: bookingsData, isLoading, error } = useBookings();
  const updateBookingMutation = useUpdateBooking();

  // Redirect based on user role
  useEffect(() => {
    if (user?.role === 'RENTER') {
      window.location.href = '/renter/bookings';
    } else if (user?.role === 'SELLER') {
      window.location.href = '/seller/kos';
    }
  }, [user]);

  // Extract bookings from API data  
  const bookings: BookingItem[] = (bookingsData?.data as any)?.bookings || [];
  const total = bookings.reduce((sum: number, item: BookingItem) => sum + item.totalPrice, 0);

  function handleRemove(id: number) {
    updateBookingMutation.mutate({ 
      id, 
      status: 'cancelled', 
      notes: 'Booking dibatalkan oleh pengguna' 
    });
  }

  function handleConfirm() {
    alert("Booking berhasil dikonfirmasi!");
    // Tambahkan logic kirim ke backend di sini jika ada
  }

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
        <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-3xl mx-auto mt-12 bg-white rounded-xl shadow p-8">
            <div className="text-center text-gray-500">Memuat data booking...</div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
        <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-3xl mx-auto mt-12 bg-white rounded-xl shadow p-8">
            <div className="text-center text-red-500">Error memuat data: {error.message}</div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
      <div className="min-h-screen px-8 py-6 bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-3xl mx-auto mt-12 bg-white rounded-xl shadow p-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-6">Keranjang Booking</h1>
          <div className="mb-4 text-sm text-gray-600">
            Selamat datang, <span className="font-semibold text-blue-600">{user?.username}</span>!
          </div>
          {bookings.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada kos yang dipesan.</div>
          ) : (
            <>
              <ul className="divide-y">
                {bookings.map(item => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <img src="/images/profile.jpg" alt={item.kos.name} className="w-20 h-20 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <div className="font-semibold text-blue-500">{item.post.title}</div>
                      <div className="text-gray-600 text-sm">{item.kos.address}, {item.kos.city}</div>
                      <div className="text-gray-700 mt-1">Harga: <span className="font-semibold text-blue-500">Rp {item.post.price.toLocaleString()}</span></div>
                      <div className="text-sm text-gray-500 mt-1">
                        Check-in: {new Date(item.checkInDate).toLocaleDateString('id-ID')} | 
                        Durasi: {item.duration} bulan | 
                        Status: <span className={`font-semibold ${item.status === 'confirmed' ? 'text-green-600' : item.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {item.status === 'confirmed' ? 'Terkonfirmasi' : 
                           item.status === 'pending' ? 'Menunggu' : 
                           item.status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={updateBookingMutation.isPending}
                      className="text-red-500 hover:underline text-sm disabled:opacity-50"
                    >
                      {updateBookingMutation.isPending ? 'Membatalkan...' : 'Batalkan'}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-6">
                <div className="text-xl font-bold text-blue-500">Total: Rp {total.toLocaleString()}</div>
                <button
                  onClick={handleConfirm}
                  className="bg-blue-400 text-white px-6 py-2 rounded font-semibold hover:bg-blue-500 transition"
                >
                  Konfirmasi Booking
                </button>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}