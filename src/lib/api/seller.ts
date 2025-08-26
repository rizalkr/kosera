import { apiClient } from './client';
import type { ApiResponse } from '@/types';
import type { AdminKosData } from '@/types/kos';
import type { SellerDashboardResponseData } from '@/types/dashboard';
import { sellerDashboardResponseSchema } from '@/types/dashboard';

export const sellerApi = {
  /**
   * Get seller dashboard data
   */
  getDashboard: async (): Promise<ApiResponse<SellerDashboardResponseData>> => {
    const res = await apiClient.get<ApiResponse<SellerDashboardResponseData>>('/api/seller/dashboard');
    try {
      if (res.success) {
        const parsed = sellerDashboardResponseSchema.parse(res.data);
        return { ...res, data: parsed };
      }
      return res;
    } catch (e) {
      console.warn('Seller dashboard response validation failed', e);
      return res;
    }
  },

  /**
   * Get detailed information about a specific kos owned by the seller
   */
  getKosDetail: async (kosId: number): Promise<ApiResponse<AdminKosData>> => {
    return apiClient.get(`/api/seller/kos/${kosId}`);
  },
};