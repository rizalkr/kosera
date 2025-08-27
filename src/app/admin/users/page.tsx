'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useSearchDebounce } from '@/hooks/useDebounce';
import { showConfirm, showSuccess, showError } from '@/lib/sweetalert';
import { useAdminUsersList } from '@/hooks/admin/useAdminUsersList';
import { UsersFiltersBar } from '@/components/features/admin/users/molecules/UsersFiltersBar';
import { UsersTable } from '@/components/features/admin/users/molecules/UsersTable';
import { UsersPagination } from '@/components/features/admin/users/molecules/UsersPagination';
import { UsersEmptyState } from '@/components/features/admin/users/organisms/UsersEmptyState';
import { UsersErrorState } from '@/components/features/admin/users/organisms/UsersErrorState';
import { UsersLoadingState } from '@/components/features/admin/users/organisms/UsersLoadingState';
import { adminApi } from '@/lib/api/admin';

export const AdminUsersPageComponent = () => {
  useAuthGuard();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const { debouncedSearchTerm, isSearching } = useSearchDebounce(searchTerm, 400);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const { users, page, limit, totalPages, loading, error, refetch, setParams } = useAdminUsersList({ page: 1, limit: 10, search: '', role: '', showDeleted });

  // sync debounced search & role changes
  // update params when debounced term or role or showDeleted changes
  useEffect(() => {
    setParams(prev => ({ ...prev, search: debouncedSearchTerm, role: filterRole === 'all' ? '' : filterRole, showDeleted }));
  }, [debouncedSearchTerm, filterRole, showDeleted, setParams]);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };
  const handleSelectAll = () => {
    setSelectedUsers(prev => prev.length === users.length ? [] : users.map(u => u.id));
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await showConfirm('User yang dihapus akan dipindahkan ke arsip dan dapat dipulihkan kembali.', 'Hapus User?', 'Ya, Hapus', 'Batal');
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteUser(userId);
      await showSuccess('User berhasil dihapus dan dipindahkan ke arsip');
      refetch();
    } catch {
      await showError('Gagal menghapus user');
    }
  };
  const handleRestoreUser = async (userId: number) => {
    const result = await showConfirm('User akan dipulihkan dan dapat digunakan kembali.', 'Pulihkan User?', 'Ya, Pulihkan', 'Batal');
    if (!result.isConfirmed) return;
    try {
      await adminApi.restoreUser(userId);
      await showSuccess('User berhasil dipulihkan');
      refetch();
    } catch {
      await showError('Gagal memulihkan user');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    const result = await showConfirm(`${selectedUsers.length} user yang dipilih akan dihapus dan dipindahkan ke arsip.`, `Hapus ${selectedUsers.length} User?`, 'Ya, Hapus Semua', 'Batal');
    if (!result.isConfirmed) return;
    for (const id of selectedUsers) {
      try { await adminApi.deleteUser(id); } catch { /* ignore each */ }
    }
    await showSuccess('User terpilih telah dihapus');
    setSelectedUsers([]);
    refetch();
  };

  const hasFilters = !!debouncedSearchTerm || filterRole !== 'all';

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">{showDeleted ? 'Arsip Users' : 'Kelola Users'}</h1>
              <p className="text-gray-700">{showDeleted ? 'Users yang telah dihapus' : 'Manage all users in the system'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push('/admin/dashboard')} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">← Dashboard</button>
            </div>
          </div>

          <UsersFiltersBar
            search={searchTerm}
            onSearch={(t) => { setSearchTerm(t); }}
            isSearching={isSearching}
            role={filterRole}
            onRoleChange={(r) => setFilterRole(r)}
            onRefresh={refetch}
            loading={loading}
            selectedCount={selectedUsers.length}
            onBulkDelete={handleBulkDelete}
            showDeleted={showDeleted}
            toggleShowDeleted={() => setShowDeleted(s => !s)}
            onCreate={!showDeleted ? () => router.push('/admin/users/create') : undefined}
          />

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {error ? (
              <UsersErrorState error={error} onRetry={refetch} />
            ) : loading && users.length === 0 ? (
              <UsersLoadingState />
            ) : users.length === 0 ? (
              <UsersEmptyState
                hasFilters={hasFilters}
                onReset={() => { setSearchTerm(''); setFilterRole('all'); }}
                onCreate={!showDeleted ? () => router.push('/admin/users/create') : undefined}
              />
            ) : (
              <>
                <UsersTable
                  users={users}
                  showDeleted={showDeleted}
                  selected={selectedUsers}
                  onToggleSelect={handleSelectUser}
                  onToggleSelectAll={handleSelectAll}
                  onView={(id) => router.push(`/admin/users/${id}`)}
                  onEdit={(id) => router.push(`/admin/users/${id}/edit`)}
                  onDelete={handleDeleteUser}
                  onRestore={handleRestoreUser}
                />
                <UsersPagination
                  page={page}
                  totalPages={totalPages}
                  perPage={limit}
                  currentCount={users.length}
                  onPrev={() => setParams(prev => ({ ...prev, page: (page - 1) < 1 ? 1 : page - 1 }))}
                  onNext={() => setParams(prev => ({ ...prev, page: page + 1 > totalPages ? totalPages : page + 1 }))}
                />
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

const AdminUsersPage = AdminUsersPageComponent;
export default AdminUsersPage;
