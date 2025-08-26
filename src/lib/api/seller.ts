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
      if (res.success && res.data) {
        // Normalize facilities field (undefined -> null) to satisfy schema
        const normalized = {
          ...res.data,
          kos: res.data.kos.map(k => ({
            ...k,
            facilities: k.facilities === undefined ? null : k.facilities,
          })),
        };
        const parsedData = sellerDashboardResponseSchema.parse(normalized);
        return { ...res, data: parsedData };
      }
      return res;
    } catch (e) {
      console.warn('Seller dashboard response validation failed', e);
      return res; // return raw if parsing fails
    }
  },

  /**
   * Get detailed information about a specific kos owned by the seller
   */
  getKosDetail: async (kosId: number): Promise<ApiResponse<AdminKosData>> => {
    return apiClient.get(`/api/seller/kos/${kosId}`);
  },
};