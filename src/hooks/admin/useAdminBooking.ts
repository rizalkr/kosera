'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthToken } from '../auth/useAuthToken';

export interface AdminBookingData {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
  kos: {
    id: number;
    name: string;
    city: string;
  };
  status: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBookingFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export const useAdminBooking = (filters: AdminBookingFilters = {}) => {
  const { getToken } = useAuthToken();
  const [data, setData] = useState<AdminBookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchAdminBooking = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.set('page', filters.page.toString());
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      if (filters.searchQuery) queryParams.set('searchQuery', filters.searchQuery);

      const response = await fetch(`/api/admin/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings data');
      const result = await response.json();
      if (result.success === false) throw new Error(result.error || 'Failed to fetch bookings data');

      setData(result.data?.bookings || []);
      setPagination({
        currentPage: result.data?.pagination?.page || 1,
        totalPages: result.data?.pagination?.totalPages || 1,
        totalCount: result.data?.pagination?.total || 0,
        hasNextPage: result.data?.pagination?.hasNext || false,
        hasPrevPage: result.data?.pagination?.hasPrev || false,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, filters.page, filters.limit, filters.status, filters.startDate, filters.endDate, filters.searchQuery]);

  const refetch = () => {
    fetchAdminBooking();
  };

  useEffect(() => {
    fetchAdminBooking();
  }, [fetchAdminBooking, filters.page, filters.limit, filters.status, filters.startDate, filters.endDate, filters.searchQuery]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch,
  };
};