'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthToken } from '@/hooks/auth/useAuthToken';
// Impor tipe terpusat yang sudah kita sempurnakan
import type { 
  AdminKosData, 
  AdminKosFilters, 
  AdminKosApiResponse 
} from '@/types'; 

/**
 * Hook untuk mengambil (fetch) daftar data kos berpaginasi untuk panel admin.
 * @param filters Objek yang berisi parameter filter seperti halaman, pencarian, dll.
 * @returns State yang berisi data, status loading, error, info pagination, dan fungsi refetch.
 */
export const useAdminKos = (filters: AdminKosFilters = {}) => {
  const { getToken } = useAuthToken();
  const [data, setData] = useState<AdminKosData[]>([]);

  // State pagination ini akan terus diberikan ke komponen UI
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminKos = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Membangun query string dari objek filter
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.city && filters.city !== 'all') queryParams.set('city', filters.city);
      if (filters.ownerType && filters.ownerType !== 'all') queryParams.set('ownerType', filters.ownerType);
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
      if (filters.showDeleted !== undefined) queryParams.set('showDeleted', filters.showDeleted.toString());

      const response = await fetch(`/api/admin/kos?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Menggunakan tipe AdminKosApiResponse yang konsisten dengan PaginatedResponse
      const result: AdminKosApiResponse = await response.json();
      
      if (!result.success) {
        // Mengambil pesan error dari respons jika ada, jika tidak, gunakan pesan default
        throw new Error(result.message || 'Failed to fetch kos data');
      }

      // **BAGIAN PENTING**: Sesuaikan dengan struktur PaginatedResponse dari common.ts
      setData(result.data?.items || []);
      setPagination({
        currentPage: result.data?.pagination?.page || 1,
        totalPages: result.data?.pagination?.totalPages || 1,
        totalCount: result.data?.pagination?.total || 0,
        hasNextPage: result.data?.pagination?.hasNext || false,
        hasPrevPage: result.data?.pagination?.hasPrev || false,
      });
      setError(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setData([]); // Kosongkan data jika terjadi error
    } finally {
      setLoading(false);
    }
  }, [
      getToken, 
      filters.page, 
      filters.limit, 
      filters.search, 
      filters.city, 
      filters.ownerType, 
      filters.sortBy, 
      filters.showDeleted
  ]);

  const refetch = useCallback(() => {
    fetchAdminKos();
  }, [fetchAdminKos]);

  useEffect(() => {
    fetchAdminKos();
  }, [fetchAdminKos]);

  return {
    data,
    pagination,
    loading,
    error,
    refetch,
  };
};