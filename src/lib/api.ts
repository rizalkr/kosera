// API Client utilities for Kosera frontend
import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types based on backend API responses
export interface KosData {
  id: number;
  postId: number;
  name: string;
  address: string;
  city: string;
  facilities: string; // API returns comma-separated string
  latitude?: number;
  longitude?: number;
  title: string;
  description: string;
  price: number;
  averageRating: string; // API returns string like "4.5"
  reviewCount: number;
  viewCount: number;
  favoriteCount: number;
  photoCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    username: string;
    contact: string;
  };
  qualityScore?: string; // Only in recommendations
}

export interface SearchParams {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  facilities?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

// Auth utilities
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// HTTP client with auth headers
const createAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API functions
export const kosApi = {
  // Get featured kos
  getFeatured: async () => {
    const response = await fetch(`${API_BASE_URL}/api/kos/featured`);
    const result = await response.json();
    
    // Transform the featured API response to match our expected format
    return {
      ...result,
      data: {
        data: result.data || [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: result.count || 0,
          limit: result.data?.length || 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        }
      }
    };
  },

  // Get recommendations
  getRecommendations: async (params: SearchParams = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/kos/recommendations?${searchParams}`);
    const result = await response.json();
    
    // Transform the recommendations API response
    return {
      ...result,
      data: {
        data: result.data?.recommendations || [],
        pagination: result.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        }
      }
    };
  },

  // Advanced search
  search: async (params: SearchParams = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/kos/search?${searchParams}`);
    return response.json();
  },

  // Get nearby kos
  getNearby: async (lat: number, lng: number, radius = 5) => {
    const response = await fetch(
      `${API_BASE_URL}/api/kos/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`
    );
    return response.json();
  },

  // Get kos details
  getDetails: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/kos/${id}`);
    return response.json();
  },

  // Get seller's own kos
  getMyKos: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/kos/my`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  // Track view
  trackView: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/kos/${id}/view`, {
      method: 'POST',
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  // Get kos photos
  getPhotos: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/kos/${id}/photos`);
    return response.json();
  },
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const result = await response.json();
    
    // Transform response to match expected format
    if (response.ok && result.token) {
      return {
        success: true,
        message: result.message || 'Login successful',
        data: {
          token: result.token,
          user: result.user
        }
      };
    } else {
      return {
        success: false,
        message: result.message || 'Login failed',
        data: { token: '', user: null },
        error: result.error || 'Login failed'
      };
    }
  },

  register: async (userData: {
    name: string;
    username: string;
    password: string;
    contact: string;
    role?: 'ADMIN' | 'SELLER' | 'RENTER';
  }): Promise<ApiResponse<{ token: string; user: any }>> => {
    // Map RENTER to USER for API compatibility
    const apiUserData = {
      ...userData,
      role: userData.role === 'RENTER' ? 'USER' : userData.role
    };
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiUserData),
    });
    return response.json();
  },

  verify: async (token: string): Promise<ApiResponse<{ user: any }>> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.json();
  },

  verifyToken: async (): Promise<ApiResponse<{ user: any }>> => {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No token found', data: { user: null }, error: 'No token found' };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    return response.json();
  },
};

// Favorites API
export const favoritesApi = {
  getFavorites: async (): Promise<ApiResponse<{ favorites: any[]; pagination: any }>> => {
    const response = await fetch(`${API_BASE_URL}/api/user/favorites`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  addFavorite: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/user/favorites`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ kosId }),
    });
    return response.json();
  },

  removeFavorite: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/user/favorites`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
      body: JSON.stringify({ kosId }),
    });
    return response.json();
  },
};

// Bookings API
export const bookingsApi = {
  getBookings: async (): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  createBooking: async (bookingData: {
    kosId: number;
    checkInDate: string;
    duration: number;
    notes?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    return response.json();
  },

  updateBooking: async (id: number, status: string, notes?: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return response.json();
  },
};

// User API
export const userApi = {
  // ...existing user API functions

  updatePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/user/password`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },
};

// Seller API types
export interface SellerKosStats {
  totalBookings: number;
  pendingBookings: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalRooms: number;
  totalRevenue: number;
  totalRoomsRentedOut: number;
}

export interface SellerKosData extends KosData {
  statistics: SellerKosStats;
}

export interface SellerDashboardData {
  kos: SellerKosData[];
  overallStats: {
    totalKos: number;
    totalBookings: number;
    totalPendingBookings: number;
    totalOccupiedRooms: number;
    totalVacantRooms: number;
    totalRooms: number;
    totalRevenue: number;
    totalViews: number;
    totalFavorites: number;
  };
}

// Seller API
export const sellerApi = {
  getDashboard: async (): Promise<ApiResponse<SellerDashboardData>> => {
    const response = await fetch(`${API_BASE_URL}/api/seller/dashboard`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  getKosDetail: async (kosId: number): Promise<ApiResponse<SellerKosData>> => {
    const response = await fetch(`${API_BASE_URL}/api/seller/kos/${kosId}`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },
};

export default {
  kos: kosApi,
  auth: authApi,
  favorites: favoritesApi,
  bookings: bookingsApi,
  user: userApi,
  seller: sellerApi,
};
