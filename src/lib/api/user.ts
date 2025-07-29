import { createAuthHeaders, API_BASE_URL } from './utils';
import type { ApiResponse } from '@/types';

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