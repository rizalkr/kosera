"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type BookingItem = {
  id: number;
  name: string;
  address: string;
  price: number;
  nights: number;
  image: string;
};

const initialBookings: BookingItem[] = [
  {
    id: 1,
    name: "Kos Putri Mawar",
    address: "Jl. Mawar No. 12, Semarang",
    price: 500000,
    nights: 1,
    image: "/images/kos1.jpg",
  },
  {
    id: 2,
    name: "Kos Putra Melati",
    address: "Jl. Melati No. 8, Semarang",
    price: 450000,
    nights: 1,
    image: "/images/kos2.jpg",
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const { user } = useAuthGuard();

  const total = bookings.reduce((sum, item) => sum + item.price * item.nights, 0);

  function handleRemove(id: number) {
    setBookings(bookings.filter(item => item.id !== id));
  }

  function handleConfirm() {
    alert("Booking berhasil dikonfirmasi!");
    // Tambahkan logic kirim ke backend di sini jika ada
    setBookings([]);
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
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <div className="font-semibold text-blue-500">{item.name}</div>
                      <div className="text-gray-600 text-sm">{item.address}</div>
                      <div className="text-gray-700 mt-1">Harga: <span className="font-semibold">Rp {item.price.toLocaleString()}</span></div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
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