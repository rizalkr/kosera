import { apiClient } from './client';
import type { ApiResponse } from '@/types';

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userApi = {
  /**
   * Update user password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.put('/api/user/password', { currentPassword, newPassword });
  },
};