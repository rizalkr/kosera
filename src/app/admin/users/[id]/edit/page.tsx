'use client';

import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { useAdminUser } from '@/hooks/admin/useAdminUser';
import { UserLoadingState } from '@/components/features/admin/users/organisms/UserLoadingState';
import { UserErrorState } from '@/components/features/admin/users/organisms/UserErrorState';
import { UserEditForm } from '@/components/features/admin/users/molecules/UserEditForm';
import { showSuccess } from '@/lib/sweetalert';

function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { user, loading, error, refetch } = useAdminUser(userId);

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
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Edit User</h1>
              <p className="text-gray-600">Edit informasi user {user.name} (#{user.id})</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push(`/admin/users/${user.id}`)} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                ← Kembali ke Detail
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <UserEditForm
              user={user}
              onSuccess={async (u) => {
                await showSuccess('User berhasil diperbarui');
                router.push(`/admin/users/${u.id}`);
              }}
              onCancel={() => router.push(`/admin/users/${user.id}`)}
            />
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default EditUserPage;

