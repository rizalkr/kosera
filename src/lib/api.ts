import type {
  AdminKosApiResponse,
  AdminKosFilters,
  AdminKosData,
  BookingData,
  FavoritesResponse,
  User,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

// --- Admin API ---
export const adminApi = {
  getAllKos: async (params: AdminKosFilters = {}): Promise<AdminKosApiResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    const response = await fetch(`${API_BASE_URL}/api/admin/kos?${searchParams.toString()}`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  toggleFeatured: async (kosId: number, isFeatured: boolean): Promise<ApiResponse<{ kos: AdminKosData }>> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/kos/${kosId}/featured`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify({ isFeatured }),
    });
    return response.json();
  },
  
  deleteKos: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/kos/${kosId}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  restoreKos: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/kos/${kosId}/restore`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  permanentDeleteKos: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/kos/${kosId}/permanent`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    return response.json();
  },

  bulkArchiveKos: async (kosIds: number[]): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/kos/bulk`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ kosIds }),
    });
    return response.json();
  },

  bulkPermanentDeleteKos: async (kosIds: number[]): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/kos/bulk`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
      body: JSON.stringify({ kosIds }),
    });
    return response.json();
  },

  bulkCleanupKos: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/kos/cleanup`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    return response.json();
  },
};

// --- Sisa API Client Anda ---
// (Disalin dari file Anda, tanpa perubahan signifikan untuk saat ini)

export const kosApi = {
  getFeatured: async () => {
    const response = await fetch(`${API_BASE_URL}/api/kos/featured`);
    return response.json();
  },
  getRecommendations: async (params: any = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/kos/recommendations?${searchParams}`);
    return response.json();
  },
  search: async (params: any = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/kos/search?${searchParams}`);
    return response.json();
  },
  getNearby: async (lat: number, lng: number, radius = 5) => {
    const response = await fetch(
      `${API_BASE_URL}/api/kos/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`
    );
    return response.json();
  },
  getDetails: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/kos/${id}`);
    return response.json();
  },
  getMyKos: async (): Promise<ApiResponse<AdminKosData[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/kos/my`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },
  trackView: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/kos/${id}/view`, {
      method: 'POST',
      headers: createAuthHeaders(),
    });
    return response.json();
  },
  getPhotos: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/kos/${id}/photos`);
    return response.json();
  },
};

export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
  register: async (userData: any): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  verify: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.json();
  },
  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No token found', data: { user: null as unknown as User }, error: 'No token found' };
    }
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    return response.json();
  },
};

export const favoritesApi = {
  getFavorites: async (): Promise<FavoritesResponse> => {
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

export const userApi = {
  updatePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/api/user/password`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },
};

export const sellerApi = {
  getDashboard: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/seller/dashboard`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },
  getKosDetail: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/seller/kos/${kosId}`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },
};

const apiClient = {
  kos: kosApi,
  auth: authApi,
  favorites: favoritesApi,
  bookings: bookingsApi,
  user: userApi,
  seller: sellerApi,
  admin: adminApi,
};

export default apiClient;