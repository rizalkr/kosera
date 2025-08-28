import { apiClient } from './client';
import type { ApiResponse, BookingData, BookingListData } from '@/types';

export interface CreateBookingData {
  kosId: number;
  checkInDate: string;
  duration: number;
  notes?: string;
}

export interface UpdateBookingData {
  status: string;
  notes?: string;
}

// New: query params for bookings listing
export interface GetBookingsParams {
  page?: number;
  status?: string; // booking status (exclude 'all')
}

export const bookingsApi = {
  /**
   * Get user's bookings with optional pagination & status filter
   * @param params page (1-based) and status (pending|confirmed|cancelled|completed)
   */
  getBookings: async (params: GetBookingsParams = {}): Promise<ApiResponse<BookingListData>> => {
    const qs = new URLSearchParams();
    if (params.page && params.page > 1) qs.set('page', String(params.page));
    if (params.status && params.status !== 'all') qs.set('status', params.status);
    const query = qs.toString();
    return apiClient.get(`/api/bookings${query ? `?${query}` : ''}`);
  },

  /**
   * Create a new booking
   */
  createBooking: async (bookingData: CreateBookingData): Promise<ApiResponse<BookingData>> => {
    return apiClient.post('/api/bookings', bookingData);
  },

  /**
   * Update booking status and notes
   */
  updateBooking: async (id: number, status: string, notes?: string): Promise<ApiResponse<BookingData>> => {
    return apiClient.put(`/api/bookings/${id}`, { status, notes });
  },
};