import { apiClient } from './client';
import type { ApiResponse } from '@/types';
import type { AdminBookingData, AdminBookingFilters } from '@/types';

export interface AdminBookingResponse {
  bookings: AdminBookingData[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UpdateBookingStatusData {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export const adminBookingsApi = {
  /**
   * Get all bookings for admin with filtering and pagination
   */
  getBookings: async (filters: AdminBookingFilters = {}): Promise<ApiResponse<AdminBookingResponse>> => {
    const queryParams: Record<string, unknown> = {};
    
    if (filters.page) queryParams.page = filters.page;
    if (filters.limit) queryParams.limit = filters.limit;
    if (filters.status) queryParams.status = filters.status;
    if (filters.startDate) queryParams.startDate = filters.startDate;
    if (filters.endDate) queryParams.endDate = filters.endDate;
    if (filters.searchQuery) queryParams.searchQuery = filters.searchQuery;

    return apiClient.get('/api/admin/bookings', queryParams);
  },

  /**
   * Update booking status as admin
   */
  updateBookingStatus: async (
    bookingId: number, 
    data: UpdateBookingStatusData
  ): Promise<ApiResponse<AdminBookingData>> => {
    return apiClient.patch(`/api/admin/bookings/${bookingId}`, data);
  },
};
