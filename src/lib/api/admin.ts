import { createAuthHeaders, API_BASE_URL } from './utils';
import type {
  AdminKosApiResponse,
  AdminKosFilters,
  AdminKosData,
  ApiResponse,
} from '@/types';

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