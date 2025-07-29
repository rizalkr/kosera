import { apiClient } from './client';
import type { ApiResponse, FavoritesResponse } from '@/types';

export const favoritesApi = {
  /**
   * Get user's favorite kos listings
   */
  getFavorites: async (): Promise<FavoritesResponse> => {
    return apiClient.get('/api/user/favorites');
  },

  /**
   * Add a kos to user's favorites
   */
  addFavorite: async (kosId: number): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.post('/api/user/favorites', { kosId });
  },

  /**
   * Remove a kos from user's favorites
   */
  removeFavorite: async (kosId: number): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.request('/api/user/favorites', { 
      method: 'DELETE', 
      body: { kosId } 
    });
  },
};