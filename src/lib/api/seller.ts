import { apiClient } from './client';
import type { ApiResponse } from '@/types';
import type { AdminKosData } from '@/types/kos';

export const sellerApi = {
  /**
   * Get seller dashboard data
   */
  getDashboard: async (): Promise<ApiResponse<{ kos: AdminKosData[]; stats: unknown }>> => {
    return apiClient.get('/api/seller/dashboard');
  },

  /**
   * Get detailed information about a specific kos owned by the seller
   */
  getKosDetail: async (kosId: number): Promise<ApiResponse<AdminKosData>> => {
    return apiClient.get(`/api/seller/kos/${kosId}`);
  },
};