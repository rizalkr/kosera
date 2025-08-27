import React, { useState, useCallback } from 'react';
import { AdminUser, adminApi, type AdminUserUpdateResponse } from '@/lib/api/admin';

export interface UserEditFormValues {
  name: string;
  username: string;
  contact: string;
  role: 'ADMIN' | 'SELLER' | 'RENTER';
  password?: string;
  confirmPassword?: string;
}

export interface UserEditFormProps {
  user: AdminUser;
  onSuccess: (updated: AdminUser) => void;
  onCancel: () => void;
}

export const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSuccess, onCancel }) => {
  const [values, setValues] = useState<UserEditFormValues>({
    name: user.name,
    username: user.username,
    contact: user.contact,
    role: user.role,
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (values.password) {
      if (values.password !== values.confirmPassword) { setError('Password dan konfirmasi password tidak cocok'); return; }
      if (values.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    }
    try {
      setSaving(true); setError(null);
      const payload: Partial<UserEditFormValues> = {
        name: values.name,
        username: values.username,
        contact: values.contact,
        role: values.role,
      };
      if (values.password) payload.password = values.password;
      const resp: AdminUserUpdateResponse = await adminApi.updateUser(user.id, payload);
      if (resp.error) throw new Error(resp.error);
      if (resp.user) onSuccess(resp.user as AdminUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal update user');
    } finally { setSaving(false); }
  }, [user.id, values, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0"><span className="text-red-400 text-xl">❌</span></div>
            <div className="ml-3"><p className="text-red-800">{error}</p></div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
          <input type="text" name="name" value={values.name} onChange={handleChange} required className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan nama lengkap" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username <span className="text-red-500">*</span></label>
          <input type="text" name="username" value={values.username} onChange={handleChange} required className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan username (unique)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kontak <span className="text-red-500">*</span></label>
          <input type="text" name="contact" value={values.contact} onChange={handleChange} required className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="No. HP atau email" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
          <select name="role" value={values.role} onChange={handleChange} required className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="RENTER">Renter (Pencari Kos)</option>
            <option value="SELLER">Seller (Pemilik Kos)</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru <span className="text-gray-500">(opsional)</span></label>
          <input type="password" name="password" value={values.password} onChange={handleChange} minLength={6} className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Kosongkan jika tidak ingin mengubah" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
          <input type="password" name="confirmPassword" value={values.confirmPassword} onChange={handleChange} minLength={6} disabled={!values.password} className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" placeholder="Ulangi password baru" />
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Catatan:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Username harus unik di seluruh sistem</li>
          <li>• Password baru minimal 6 karakter</li>
          <li>• Kosongkan field password jika tidak ingin mengubah password</li>
          <li>• Perubahan role mempengaruhi akses user ke sistem</li>
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <button type="submit" disabled={saving} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Menyimpan...</>) : (<>💾 Update User</>)}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">Batal</button>
      </div>
    </form>
  );
};
