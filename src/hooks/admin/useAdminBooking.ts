'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminBookingsApi } from '@/lib/api/admin-bookings';
import { ApiError } from '@/lib/api/client';
import type { AdminBookingData, AdminBookingFilters } from '@/types';
/**
 * Refactored admin booking hook using unified API client
 */
export const useAdminBooking = (filters: AdminBookingFilters = {}) => {
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
      setError(null);

      const result = await adminBookingsApi.getBookings(filters);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch bookings data');
      }

      setData(result.data?.bookings || []);
      setPagination({
        currentPage: result.data?.pagination?.page || 1,
        totalPages: result.data?.pagination?.totalPages || 1,
        totalCount: result.data?.pagination?.total || 0,
        hasNextPage: result.data?.pagination?.hasNext || false,
        hasPrevPage: result.data?.pagination?.hasPrev || false,
      });
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? `${err.message} (Status: ${err.status})`
        : err instanceof Error 
        ? err.message 
        : 'Failed to load bookings data';
      
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    fetchAdminBooking();
  }, [fetchAdminBooking]);

  useEffect(() => {
    fetchAdminBooking();
  }, [fetchAdminBooking]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch,
  };
};
