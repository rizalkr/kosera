import type { KosPhoto } from './kos';

// Shared Booking Status Type
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Booking Types
export interface BookingData {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: BookingStatus;
  kos: {
    id: number;
    name: string;
    address: string;
    photos: KosPhoto[];
  };
  user: {
    id: number;
    username: string;
    fullName: string;
    contact: string;
  };
  createdAt: string;
  updatedAt: string;
}

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

export interface BookingSearchParams {
  page?: string;
  limit?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface BookingAdminClientProps {
  searchParams: BookingSearchParams;
}

export interface BookingPagination {
  page: number;
  limit: number;
  totalBookings: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BookingListData {
  bookings: BookingData[];
  pagination: BookingPagination;
}
