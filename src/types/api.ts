// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  contact: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  contact: string;
  role?: 'USER' | 'SELLER';
}

// Kos Types
export interface KosPhoto {
  id: number;
  url: string;
  isPrimary: boolean;
  kosId: number;
}

export interface KosData {
  id: number;
  name: string;
  description: string;
  price: number;
  address: string;
  city: string;
  facilities: string;
  totalRooms: number;
  occupiedRooms: number;
  averageRating: number;
  reviewCount: number;
  photos: KosPhoto[];
  owner: {
    id: number;
    username: string;
    fullName: string;
    contact: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface BookingData {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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

// SweetAlert Types
export interface SweetAlertResult {
  isConfirmed: boolean;
  isDenied?: boolean;
  isDismissed?: boolean;
  value?: any;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

// Form Data Types
export interface KosFormData {
  name: string;
  description: string;
  price: number;
  address: string;
  city: string;
  facilities: string;
  totalRooms: number;
  occupiedRooms?: number;
  latitude?: number;
  longitude?: number;
}

export interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  contact: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  password?: string;
}
