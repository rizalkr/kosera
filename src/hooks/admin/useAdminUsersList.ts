import { useCallback, useEffect, useState } from 'react';
import { adminApi, type AdminUserListItem, type AdminUserListResponse } from '@/lib/api/admin';

export interface UseAdminUsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  showDeleted?: boolean;
}

export interface UseAdminUsersListResult {
  users: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setParams: (updater: (prev: UseAdminUsersListParams) => UseAdminUsersListParams) => void;
  params: UseAdminUsersListParams;
}

/**
 * Hook to fetch paginated admin users list with filters using validated API.
 */
export const useAdminUsersList = (initial: UseAdminUsersListParams = { page: 1, limit: 10 }): UseAdminUsersListResult => {
  const [params, setParamsState] = useState<UseAdminUsersListParams>(initial);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initial.page || 1);
  const [limit, setLimit] = useState(initial.limit || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data: AdminUserListResponse = await adminApi.getUsersList({ ...params, page, limit });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [params, page, limit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setParams = (updater: (prev: UseAdminUsersListParams) => UseAdminUsersListParams) => {
    setParamsState(prev => updater(prev));
    setPage(1); // reset page on param change
  };

  return { users, total, page, limit, totalPages, loading, error, refetch: fetchUsers, setParams, params };
};
