import { createAuthHeaders, API_BASE_URL } from './utils';
import type { ApiResponse, AdminKosData, SearchParams, KosSearchApiResponse, PublicKosData } from '@/types';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';

// ================= Zod Schemas (Create Kos) =================
export const createKosRequestSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  price: z.number().positive('Harga harus lebih besar dari 0'),
  name: z.string().min(1, 'Nama kos wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  facilities: z.string().min(1, 'Fasilitas wajib diisi'),
  totalRooms: z.number().positive('Total kamar harus > 0'),
  occupiedRooms: z.number().optional(),
});

export const createKosResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.object({ id: z.number().optional() }).partial().optional(),
  error: z.string().optional(),
}).passthrough();

export type CreateKosRequest = z.infer<typeof createKosRequestSchema>;
export type CreateKosResponse = z.infer<typeof createKosResponseSchema>;

/**
 * Create a new kos resource with runtime validation.
 * Uses the shared apiClient + Zod schema to ensure type-safe responses.
 */
export const createKos = async (payload: CreateKosRequest): Promise<CreateKosResponse> => {
  console.debug('[kosApi] createKos - request payload', payload);
  const response = await apiClient.postValidated<CreateKosResponse>('/api/kos', createKosResponseSchema, payload);
  console.debug('[kosApi] createKos - raw response', response);
  return response;
};

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