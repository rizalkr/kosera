import { createAuthHeaders, API_BASE_URL } from './utils';
import type { ApiResponse, AdminKosData, SearchParams, KosSearchApiResponse, PublicKosData } from '@/types';

export const kosApi = {
  getFeatured: async (): Promise<ApiResponse<PublicKosData[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/kos/featured`);
    return response.json();
  },
  getRecommendations: async (params: SearchParams = {}): Promise<KosSearchApiResponse> => {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const response = await fetch(`${API_BASE_URL}/api/kos/recommendations?${searchParams}`);
    return response.json();
  },
  search: async (params: SearchParams = {}): Promise<KosSearchApiResponse> => {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const response = await fetch(`${API_BASE_URL}/api/kos/search?${searchParams}`);
    return response.json();
  },
  getNearby: async (lat: number, lng: number, radius = 5): Promise<KosSearchApiResponse> => {
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