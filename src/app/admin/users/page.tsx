'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthToken } from '@/hooks/useAuthToken';
import { showConfirm, showSuccess, showError } from '@/lib/sweetalert';

interface User {
  id: number;
  name: string;
  username: string;
  contact: string;
  role: 'ADMIN' | 'SELLER' | 'RENTER';
  createdAt: string;
  deletedAt?: string;
  createdBy?: number;
  deletedBy?: number;
  creatorInfo?: {
    id: number;
    name: string;
    username: string;
    contact: string;
  };
  deleterInfo?: {
    id: number;
    name: string;
    username: string;
    contact: string;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthGuard();
  const { getToken } = useAuthToken();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const usersPerPage = 10;

  // Check URL params for showDeleted
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShowDeleted(urlParams.get('showDeleted') === 'true');
  }, []);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        role: filterRole === 'all' ? '' : filterRole,
        showDeleted: showDeleted.toString(),
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(Math.ceil((data.total || 0) / usersPerPage));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, showDeleted]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle filter
  const handleFilterChange = (role: string) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  // Handle user selection
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // Handle user actions
  const handleDeleteUser = async (userId: number) => {
    const result = await showConfirm(
      'User yang dihapus akan dipindahkan ke arsip dan dapat dipulihkan kembali.',
      'Hapus User?',
      'Ya, Hapus',
      'Batal'
    );
    
    if (!result.isConfirmed) return;

    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await showSuccess('User berhasil dihapus dan dipindahkan ke arsip');
      fetchUsers();
    } catch (err) {
      await showError('Gagal menghapus user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleRestoreUser = async (userId: number) => {
    const result = await showConfirm(
      'User akan dipulihkan dan dapat digunakan kembali.',
      'Pulihkan User?',
      'Ya, Pulihkan',
      'Batal'
    );
    
    if (!result.isConfirmed) return;

    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to restore user');
      }

      await showSuccess('User berhasil dipulihkan');
      fetchUsers();
    } catch (err) {
      await showError('Gagal memulihkan user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-red-100 text-red-800',
      SELLER: 'bg-blue-100 text-blue-800',
      RENTER: 'bg-green-100 text-green-800',
    };
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && users.length === 0) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data users...</p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                {showDeleted ? 'Arsip Users' : 'Kelola Users'}
              </h1>
              <p className="text-gray-700">
                {showDeleted ? 'Users yang telah dihapus' : 'Manage all users in the system'}
              </p>
            </div>
            <div className="flex gap-3">
              {!showDeleted && (
                <button
                  onClick={() => router.push('/admin/users/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  Tambah User
                </button>
              )}
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showDeleted 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <span>{showDeleted ? '👥' : '🗂️'}</span>
                {showDeleted ? 'Users Aktif' : 'Arsip Users'}
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Dashboard
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari User
                </label>
                <input
                  type="text"
                  placeholder="Cari nama atau username..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                />
              </div>

              {/* Filter by Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="text-gray-500 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                >
                  <option value="all">Semua Role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SELLER">Seller</option>
                  <option value="RENTER">Renter</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
                {selectedUsers.length > 0 && (
                  <button
                    onClick={async () => {
                      const result = await showConfirm(
                        `${selectedUsers.length} user yang dipilih akan dihapus dan dipindahkan ke arsip.`,
                        `Hapus ${selectedUsers.length} User?`,
                        'Ya, Hapus Semua',
                        'Batal'
                      );
                      if (result.isConfirmed) {
                        // Implement bulk delete
                        console.log('Bulk delete:', selectedUsers);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🗑️ Hapus ({selectedUsers.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {error ? (
              <div className="p-6 text-center">
                <div className="text-red-700 text-xl mb-4">❌</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-700"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          {showDeleted ? 'Tanggal Dihapus' : 'Tanggal Daftar'}
                        </th>
                        {showDeleted ? (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Dihapus Oleh
                          </th>
                        ) : (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Dibuat Oleh
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-700"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-700">@{user.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.contact}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {showDeleted && user.deletedAt ? formatDate(user.deletedAt) : formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {showDeleted ? (
                              user.deleterInfo ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.deleterInfo.name}</div>
                                  <div className="text-sm text-gray-700">@{user.deleterInfo.username}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )
                            ) : (
                              user.creatorInfo ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.creatorInfo.name}</div>
                                  <div className="text-sm text-gray-700">@{user.creatorInfo.username}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">System</span>
                              )
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                                title="Lihat Detail"
                              >
                                👁️
                              </button>
                              {!showDeleted ? (
                                <>
                                  <button
                                    onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                                    title="Edit User"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                                    title="Hapus User"
                                  >
                                    🗑️
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRestoreUser(user.id)}
                                  className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                                  title="Pulihkan User"
                                >
                                  ♻️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada users</h3>
                    <p className="text-gray-700 mb-4">
                      {searchTerm || filterRole !== 'all' 
                        ? 'Tidak ditemukan users dengan kriteria pencarian tersebut'
                        : 'Belum ada users yang terdaftar'
                      }
                    </p>
                    {searchTerm || filterRole !== 'all' ? (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterRole('all');
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Reset filter
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/admin/users/create')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Tambah User Pertama
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Halaman {currentPage} dari {totalPages} 
                        {users.length > 0 && (
                          <span className="ml-2">
                            (Menampilkan {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, users.length + ((currentPage - 1) * usersPerPage))} users)
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          ← Sebelumnya
                        </button>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                          {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="text-gray-500 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Selanjutnya →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
