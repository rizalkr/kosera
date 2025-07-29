import { createAuthHeaders, API_BASE_URL } from './utils';
import type { ApiResponse, FavoritesResponse } from '@/types';

export const favoritesApi = {
  getFavorites: async (): Promise<FavoritesResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/user/favorites`, {
      headers: createAuthHeaders(),
    });
    return response.json();
  },
  addFavorite: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/user/favorites`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ kosId }),
    });
    return response.json();
  },
  removeFavorite: async (kosId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/user/favorites`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
      body: JSON.stringify({ kosId }),
    });
    return response.json();
  },
};