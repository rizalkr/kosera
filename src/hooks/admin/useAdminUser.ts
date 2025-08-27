import { useState, useCallback, useEffect } from 'react';
import { adminApi, type AdminUser, type AdminUserDetailResponse } from '@/lib/api/admin';

export interface UseAdminUserResult {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleting: boolean;
  deleteUser: () => Promise<boolean>;
}

/**
 * Hook to manage fetching and deleting a single admin user using validated API client.
 */
export const useAdminUser = (id: string | number | undefined): UseAdminUserResult => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data: AdminUserDetailResponse = await adminApi.getUserById(id);
      if (!data.user) {
        setError(data.error || 'User tidak ditemukan');
        setUser(null);
        return;
      }
      setUser(data.user);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const deleteUser = useCallback(async () => {
    if (!id) return false;
    try {
      setDeleting(true);
      const resp = await adminApi.deleteUser(id);
      if ('error' in resp && resp.error) throw new Error(resp.error);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus user');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser, deleting, deleteUser };
};
