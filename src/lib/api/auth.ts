import { createAuthHeaders, getAuthToken, API_BASE_URL } from './utils';
import type { ApiResponse, User } from '@/types';

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