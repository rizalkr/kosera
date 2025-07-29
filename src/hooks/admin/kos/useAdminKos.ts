'use client';

import { useState, useEffect, useCallback } from 'react';
// Impor apiClient 
import {adminApi} from '@/lib/api';
// Impor tipe terpusat yang sudah kita sempurnakan
import type { 
  AdminKosData, 
  AdminKosFilters, 
} from '@/types'; 

/**
 * Hook untuk mengambil (fetch) daftar data kos berpaginasi untuk panel admin.
 * @param filters Objek yang berisi parameter filter seperti halaman, pencarian, dll.
 * @returns State yang berisi data, status loading, error, info pagination, dan fungsi refetch.
 */
export const useAdminKos = (filters: AdminKosFilters = {}) => {
  const [data, setData] = useState<AdminKosData[]>([]);
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
    setError(null);
    try {
      // **PERUBAHAN UTAMA:** Semua logika fetch digantikan oleh satu baris ini.
      const result = await adminApi.getAllKos(filters);

      if (!result.success) {
        throw new Error(result.message || 'Gagal mengambil data kos');
      }

      // Sesuaikan dengan struktur PaginatedResponse dari common.ts Anda
      setData(result.data?.kos || []);
      setPagination({
        currentPage: result.data?.pagination?.page || 1,
        totalPages: result.data?.pagination?.totalPages || 1,
        totalCount: result.data?.pagination?.total || 0,
        hasNextPage: result.data?.pagination?.hasNext || false,
        hasPrevPage: result.data?.pagination?.hasPrev || false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui');
      setData([]); // Kosongkan data jika terjadi error
    } finally {
      setLoading(false);
    }
  }, [filters]); // Use filters directly instead of JSON.stringify

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