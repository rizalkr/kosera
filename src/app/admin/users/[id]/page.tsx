'use client';

import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { useAdminUser } from '@/hooks/admin/useAdminUser';
import { showConfirm, showSuccess, showError } from '@/lib/sweetalert';
import { UserLoadingState } from '@/components/features/admin/users/organisms/UserLoadingState';
import { UserErrorState } from '@/components/features/admin/users/organisms/UserErrorState';
import { UserDetailCard } from '@/components/features/admin/users/organisms/UserDetailCard';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { user, loading, error, refetch, deleteUser, deleting } = useAdminUser(userId);

  const handleDeleteUser = async () => {
    if (!user) return;
    const result = await showConfirm(
      `User "${user.name}" akan dihapus dan dipindahkan ke arsip. Aksi ini dapat dibatalkan dengan memulihkan user dari arsip.`,
      'Hapus User?',
      'Ya, Hapus',
      'Batal'
    );
    if (!result.isConfirmed) return;
    const ok = await deleteUser();
    if (ok) {
      await showSuccess('User berhasil dihapus dan dipindahkan ke arsip');
      router.push('/admin/users');
    } else {
      await showError('Gagal menghapus user');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
        <UserLoadingState />
      </ProtectedRoute>
    );
  }

  if (error || !user) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
        <UserErrorState error={error} onRetry={refetch} onBack={() => router.push('/admin/users')} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Detail User</h1>
              <p className="text-gray-600">Informasi lengkap user #{user.id}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push(`/admin/users/${user.id}/edit`)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"><span>✏️</span>Edit User</button>
              <button onClick={() => router.push('/admin/users')} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">← Kembali</button>
            </div>
          </div>
          <UserDetailCard
            user={user}
            onEdit={() => router.push(`/admin/users/${user.id}/edit`)}
            onDelete={handleDeleteUser}
            onBack={() => router.push('/admin/users')}
            deleting={deleting}
          />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default UserDetailPage;
