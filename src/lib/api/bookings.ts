import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse, BookingData } from '@/types';

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

export const bookingsApi = {
  /**
   * Get user's bookings with pagination
   */
  getBookings: async (): Promise<ApiResponse<PaginatedResponse<BookingData>>> => {
    return apiClient.get('/api/bookings');
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