'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function SellerKosPage() {
  const [kosList, setKosList] = useState([
    {
      id: 1,
      name: "Kos Mawar Putih",
      address: "Jl. Mawar No. 15, Semarang",
      price: 500000,
      status: "Tersedia",
      rooms: 12,
      occupiedRooms: 8,
      image: "/images/kos1.jpg"
    },
    {
      id: 2,
      name: "Kos Melati Indah",
      address: "Jl. Melati No. 22, Semarang",
      price: 450000,
      status: "Tersedia",
      rooms: 10,
      occupiedRooms: 6,
      image: "/images/kos2.jpg"
    }
  ]);

  const { user } = useAuthGuard();

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-600">Kos Saya</h1>
                <p className="text-gray-600 mt-2">Kelola properti kos Anda</p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                + Tambah Kos Baru
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Selamat datang, <span className="font-semibold text-blue-600">{user?.username}</span>!
            </div>

            {kosList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada kos yang terdaftar</h3>
                <p className="text-gray-500 mb-4">Mulai dengan menambahkan kos pertama Anda</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Tambah Kos Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kosList.map((kos) => (
                  <div key={kos.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <img
                        src={kos.image}
                        alt={kos.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{kos.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{kos.address}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-blue-600">
                        Rp {kos.price.toLocaleString()}/bulan
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        kos.status === 'Tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {kos.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Kamar: {kos.occupiedRooms}/{kos.rooms} terisi
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm">
                        Edit
                      </button>
                      <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors text-sm">
                        Lihat Detail
                      </button>
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
