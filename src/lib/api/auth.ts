import { apiClient } from './client';
import type { ApiResponse, User } from '@/types';
import { loginResponseSchema, registerResponseSchema } from '@/lib/validation/authSchemas';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  contact: string;
  password: string;
  role?: 'ADMIN' | 'SELLER' | 'RENTER';
}

export const authApi = {
  /**
   * Authenticate user with username and password using validated schema
   */
  login: async (username: string, password: string) => {
    return apiClient.postValidated('/api/auth/login', loginResponseSchema, { username, password }, { requireAuth: false });
  },

  /**
   * Register a new user (validated)
   */
  register: async (userData: RegisterData) => {
    return apiClient.postValidated('/api/auth/register', registerResponseSchema, userData, { requireAuth: false });
  },

  /**
   * Verify a specific token
   */
  verify: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get('/api/auth/verify', undefined, {
      headers: { Authorization: `Bearer ${token}` },
      requireAuth: false,
    });
  },

  /**
   * Verify current stored token
   */
  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      return await apiClient.get('/api/auth/verify');
    } catch {
      return { 
        success: false, 
        message: 'No token found or invalid token', 
        data: { user: null as unknown as User }, 
        error: 'Authentication failed' 
      };
    }
  },
};