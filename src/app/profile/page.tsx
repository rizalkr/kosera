'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoginRequired from '../../components/LoginRequired';
import UpdatePasswordModal from '../../components/UpdatePasswordModal';
import { showSuccess } from '../../lib/sweetalert';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <LoginRequired>
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200">
                  <Image
                    src="/images/profile.jpg" // Placeholder image
                    alt="Profile Picture"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-800">{user?.username}</h1>
                  <p className="text-md text-gray-500 capitalize">{user?.role}</p>
                  <p className="text-md text-gray-500">User ID: {user?.userId}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-6 border-t">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Aksi</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Ubah Kata Sandi
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <UpdatePasswordModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            // Optionally, show a success message
            showSuccess('Kata sandi berhasil diperbarui!');
          }}
        />
      )}
    </LoginRequired>
  );
}
