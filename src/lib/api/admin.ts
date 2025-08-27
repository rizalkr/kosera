import { apiClient } from './client';
import { z } from 'zod';
import type { AdminKosApiResponse, AdminKosFilters, AdminKosData, ApiResponse } from '@/types';

// Schemas
const adminKosDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  address: z.string(),
  city: z.string(),
  facilities: z.string(),
  totalRooms: z.number().optional().default(0),
  occupiedRooms: z.number().optional().default(0),
  averageRating: z.string(),
  reviewCount: z.number(),
  photos: z.array(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  postId: z.number(),
  isFeatured: z.boolean(),
  viewCount: z.number(),
  favoriteCount: z.number(),
  photoCount: z.number(),
  totalPost: z.number(),
  totalPenjualan: z.number(),
  owner: z.object({ id: z.number(), username: z.string(), fullName: z.string().optional().or(z.string()), contact: z.string(), role: z.string().optional() })
});

const adminKosListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(adminKosDataSchema).optional(),
  }).optional(),
}).passthrough();

// Analytics schema (simplified based on hook types)
const analyticsSchema = z.object({
  overview: z.object({
    totalKos: z.number(),
    totalViews: z.number(),
    totalFavorites: z.number(),
    averageRating: z.number().or(z.string()),
    totalReviews: z.number(),
  }),
  topPerforming: z.array(z.object({
    id: z.number(),
    name: z.string(),
    city: z.string(),
    title: z.string(),
    price: z.number(),
    viewCount: z.number(),
    favoriteCount: z.number(),
    averageRating: z.number().or(z.string()),
    reviewCount: z.number(),
    qualityScore: z.number().optional(),
    owner: z.object({ name: z.string().optional(), username: z.string() }),
  })),
  cityDistribution: z.array(z.object({
    city: z.string(),
    kosCount: z.number(),
    averagePrice: z.number(),
    totalViews: z.number(),
  })),
  priceStatistics: z.object({
    minPrice: z.number(),
    maxPrice: z.number(),
    averagePrice: z.number(),
    medianPrice: z.number(),
  }),
  featuredStatistics: z.object({
    totalFeatured: z.number(),
    averageFeaturedViews: z.number(),
    averageFeaturedRating: z.number().or(z.string()),
  }),
  recentActivity: z.array(z.object({
    kosName: z.string(),
    city: z.string(),
    viewCount: z.number(),
    favoriteCount: z.number(),
    updatedAt: z.string(),
  })),
  generatedAt: z.string(),
});

// New user detail schemas
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  contact: z.string(),
  role: z.enum(['ADMIN', 'SELLER', 'RENTER']),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
});

const userDetailResponseSchema = z.object({
  success: z.boolean().optional(),
  user: userSchema.optional(),
  error: z.string().optional(),
}).passthrough();

const userDeleteResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
}).passthrough();

// New update user response schema (reuse userSchema)
const updateUserResponseSchema = z.object({
  success: z.boolean().optional(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    contact: z.string(),
    role: z.enum(['ADMIN', 'SELLER', 'RENTER']),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
}).passthrough();

// --------- (ADDED) Extended user list item & list response schemas ---------
const userListItemSchema = userSchema.extend({
  deletedAt: z.string().nullable().optional(),
  createdBy: z.number().nullable().optional(),
  deletedBy: z.number().nullable().optional(),
  creatorInfo: z.object({ id: z.number(), name: z.string(), username: z.string(), contact: z.string() }).nullable().optional(),
  deleterInfo: z.object({ id: z.number(), name: z.string(), username: z.string(), contact: z.string() }).nullable().optional(),
});

const userListResponseSchema = z.object({
  message: z.string().optional(),
  users: z.array(userListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  showDeleted: z.boolean().optional(),
}).passthrough();

// Unified action response for delete/restore (ADDED)
const userActionResponseSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
}).passthrough();

const analyticsResponseSchema = z.object({ success: z.boolean(), data: analyticsSchema.optional(), error: z.string().optional() });

const usersResponseSchema = z.object({
  users: z.array(z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    contact: z.string(),
    role: z.string(),
    createdAt: z.string(),
  }))
});

const usersOuterResponseSchema = z.object({ success: z.boolean().optional(), data: usersResponseSchema.optional() }).passthrough();

const bookingsResponseSchema = z.object({
  bookings: z.array(z.object({
    id: z.number(),
    status: z.string(),
    totalPrice: z.number(),
    createdAt: z.string(),
    user: z.object({ name: z.string().optional(), username: z.string().optional() }).optional(),
    kos: z.object({ name: z.string(), city: z.string() }),
  })),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
});

const bookingsOuterResponseSchema = z.object({ success: z.boolean(), data: bookingsResponseSchema.optional(), error: z.string().optional() });

const createUserRequestSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  contact: z.string().min(1),
  role: z.enum(['ADMIN', 'SELLER', 'RENTER']),
  password: z.string().min(6),
});

const createUserResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.object({ id: z.number().optional() }).partial().optional(),
  error: z.string().optional(),
}).passthrough();

// --------- Exported Types (inferred from schemas) ---------
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
export type UsersOuterResponse = z.infer<typeof usersOuterResponseSchema>;
export type BookingsOuterResponse = z.infer<typeof bookingsOuterResponseSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
export type AnalyticsData = NonNullable<AnalyticsResponse['data']>;
export type UsersData = NonNullable<UsersOuterResponse['data']>;
export type BookingsData = NonNullable<BookingsOuterResponse['data']>;
export type AdminUser = z.infer<typeof userSchema>;
export type AdminUserDetailResponse = z.infer<typeof userDetailResponseSchema>;
export type AdminUserUpdateResponse = z.infer<typeof updateUserResponseSchema>;
export type AdminUserListItem = z.infer<typeof userListItemSchema>;
export type AdminUserListResponse = z.infer<typeof userListResponseSchema>;

export const adminApi = {
  /** Get all kos (legacy structure support) */
  getAllKos: async (params: AdminKosFilters = {}): Promise<AdminKosApiResponse> => {
    const query: Record<string, unknown> = { ...params };
    return apiClient.get<AdminKosApiResponse>('/api/admin/kos', query);
  },

  toggleFeatured: async (kosId: number, isFeatured: boolean): Promise<ApiResponse<{ kos: AdminKosData }>> => {
    return apiClient.patch(`/api/admin/kos/${kosId}/featured`, { isFeatured });
  },
  
  deleteKos: async (kosId: number): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.delete(`/api/admin/kos/${kosId}`);
  },

  restoreKos: async (kosId: number): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.patch(`/api/admin/kos/${kosId}/restore`);
  },

  permanentDeleteKos: async (kosId: number): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.delete(`/api/admin/kos/${kosId}/permanent`);
  },

  bulkArchiveKos: async (kosIds: number[]): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.post('/api/admin/kos/bulk', { kosIds });
  },

  bulkPermanentDeleteKos: async (kosIds: number[]): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.request('/api/admin/kos/bulk', { method: 'DELETE', body: { kosIds } });
  },

  bulkCleanupKos: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.delete('/api/admin/kos/cleanup');
  },

  // New validated endpoints
  getAnalytics: async () => {
    return apiClient.getValidated('/api/admin/analytics', analyticsResponseSchema);
  },
  getUsers: async () => {
    return apiClient.getValidated('/api/admin/users', usersOuterResponseSchema);
  },
  getBookings: async (limit = 100) => {
    return apiClient.getValidated('/api/bookings', bookingsOuterResponseSchema, { limit });
  },
  createUser: async (payload: CreateUserRequest) => {
    return apiClient.postValidated('/api/admin/users', createUserResponseSchema, payload);
  },
  getUserById: async (id: number | string) => {
    return apiClient.getValidated(`/api/admin/users/${id}` as string, userDetailResponseSchema);
  },
  deleteUser: async (id: number | string) => {
    return apiClient.deleteValidated(`/api/admin/users/${id}` as string, userActionResponseSchema);
  },
  updateUser: async (id: number | string, payload: Partial<Pick<AdminUser, 'name' | 'username' | 'contact' | 'role'>> & { password?: string }) => {
    return apiClient.putValidated(`/api/admin/users/${id}` as string, updateUserResponseSchema, payload);
  },
  restoreUser: async (id: number | string) => {
    return apiClient.patchValidated(`/api/admin/users/${id}` as string, userActionResponseSchema);
  },
  getUsersList: async (params?: { page?: number; limit?: number; search?: string; role?: string; showDeleted?: boolean }) => {
    return apiClient.getValidated('/api/admin/users', userListResponseSchema, params as Record<string, unknown>);
  }
};