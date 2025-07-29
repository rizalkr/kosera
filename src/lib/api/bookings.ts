import { createAuthHeaders, API_BASE_URL } from './utils';
import type { ApiResponse, PaginatedResponse, BookingData } from '@/types';

export const bookingsApi = {
  getBookings: async (): Promise<ApiResponse<PaginatedResponse<BookingData>>> => {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },
  createBooking: async (bookingData: any): Promise<ApiResponse<BookingData>> => {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    return response.json();
  },
  updateBooking: async (id: number, status: string, notes?: string): Promise<ApiResponse<BookingData>> => {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return response.json();
  },
};