'use client';

import { useState } from 'react';
import { userApi } from '@/lib/api/utils';
import { showSuccess, showError } from '@/lib/sweetalert';

interface UpdatePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdatePasswordModal({ onClose, onSuccess }: UpdatePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('Kata sandi baru tidak cocok.', 'Validasi Gagal');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await userApi.updatePassword(currentPassword, newPassword);
      if (response.success) {
        await showSuccess('Kata sandi berhasil diperbarui!', 'Berhasil');
        onSuccess();
        onClose();
      } else {
        showError(response.message || 'Gagal memperbarui kata sandi.', 'Gagal Memperbarui');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      showError(error.message || 'Terjadi kesalahan jaringan.', 'Kesalahan Jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ubah Kata Sandi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kata Sandi Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kata Sandi Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Batal</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
              {isLoading ? 'Memperbarui...' : 'Perbarui'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
