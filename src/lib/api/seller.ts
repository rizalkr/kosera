import { createAuthHeaders, API_BASE_URL } from './utils';
import type { ApiResponse } from '@/types';

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