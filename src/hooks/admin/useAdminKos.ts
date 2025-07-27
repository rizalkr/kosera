'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthToken } from '../auth/useAuthToken';

export interface AdminKosData {
  id: number;
  postId: number;
  name: string;
  address: string;
  city: string;
  facilities: string;
  totalRooms: number;
  occupiedRooms: number;
  latitude?: number;
  longitude?: number;
  title: string;
  description: string;
  price: number;
  isFeatured: boolean;
  viewCount: number;
  favoriteCount: number;
  averageRating: string;
  reviewCount: number;
  photoCount: number;
  totalPost: number;
  totalPenjualan: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    username: string;
    contact: string;
    role: string;
  };
}

export interface AdminKosFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  ownerType?: string;
  sortBy?: string;
  showDeleted?: boolean; // New parameter for archive view
}

export interface AdminKosResponse {
  data: {
    kos: AdminKosData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

export const useAdminKos = (filters: AdminKosFilters = {}) => {
  const { getToken } = useAuthToken();
  const [data, setData] = useState<AdminKosData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchAdminKos = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.city && filters.city !== 'all') queryParams.set('city', filters.city);
      if (filters.ownerType && filters.ownerType !== 'all') queryParams.set('ownerType', filters.ownerType);
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
      if (filters.showDeleted !== undefined) queryParams.set('showDeleted', filters.showDeleted.toString());

      const response = await fetch(`/api/admin/kos?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch kos data');
      }

      const result = await response.json();
      
      // Handle different response formats
      if (result.success === false) {
        throw new Error(result.error || 'Failed to fetch kos data');
      }
      
      setData(result.data?.kos || []);
      setPagination({
        currentPage: result.data?.pagination?.page || 1,
        totalPages: result.data?.pagination?.totalPages || 1,
        totalCount: result.data?.pagination?.total || 0,
        hasNextPage: result.data?.pagination?.hasNext || false,
        hasPrevPage: result.data?.pagination?.hasPrev || false,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kos data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, filters.page, filters.limit, filters.search, filters.city, filters.ownerType, filters.sortBy, filters.showDeleted]);

  const refetch = () => {
    fetchAdminKos();
  };

  useEffect(() => {
    fetchAdminKos();
  }, [
    fetchAdminKos,
    filters.page,
    filters.limit,
    filters.search,
    filters.city,
    filters.ownerType,
    filters.sortBy,
    filters.showDeleted,
  ]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch,
  };
};

// Hook untuk toggle featured status
export const useToggleFeatured = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const toggleFeatured = async (kosId: number, isFeatured: boolean) => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/${kosId}/featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update featured status');
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleFeatured,
    loading,
  };
};

// Hook untuk soft delete kos (move to archive)
export const useDeleteKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const deleteKos = async (kosId: number) => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/${kosId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete kos');
      }

      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete kos');
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteKos,
    loading,
  };
};

// Hook for permanent delete (only in archive)
export const usePermanentDeleteKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const permanentDeleteKos = async (kosId: number) => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/${kosId}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to permanently delete kos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { permanentDeleteKos, loading };
};

// Hook for restore kos from archive
export const useRestoreKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const restoreKos = async (kosId: number) => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/${kosId}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore kos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { restoreKos, loading };
};

// Hook for bulk cleanup (permanent delete all archived kos)
export const useBulkCleanupKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const bulkCleanupKos = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/cleanup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cleanup archived kos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { bulkCleanupKos, loading };
};

// Hook for bulk archive (soft delete multiple kos)
export const useBulkArchiveKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const bulkArchiveKos = async (kosIds: number[]) => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kosIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive selected kos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { bulkArchiveKos, loading };
};

// Hook for bulk permanent delete (permanently delete multiple archived kos)
export const useBulkPermanentDeleteKos = () => {
  const { getToken } = useAuthToken();
  const [loading, setLoading] = useState(false);

  const bulkPermanentDeleteKos = async (kosIds: number[]) => {
    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/kos/bulk`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kosIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to permanently delete selected kos');
      }

      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { bulkPermanentDeleteKos, loading };
};
