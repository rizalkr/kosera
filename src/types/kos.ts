import { PaginatedResponse } from "./common";
// =================================================================
// BASE TYPES - The single source of truth for core data structures.
// =================================================================

/**
 * The fundamental structure for a single photo.
 */
export interface BaseKosPhoto {
  id: number;
  url: string;
  isPrimary: boolean;
}

/**
 * The fundamental structure for a kos property. Contains all fields
 * that are shared across different views (public, admin, seller).
 */
export interface BaseKosData {
  id: number;
  name: string;
  description: string;
  price: number;
  address: string;
  city: string;
  facilities: string;
  totalRooms: number;
  occupiedRooms: number;
  latitude?: number;
  longitude?: number;
  owner: {
    id: number;
    username: string;
    fullName: string; // Using fullName for consistency
    contact: string;
  };
}

// =================================================================
// EXTENDED & SPECIFIC TYPES - Building upon the base types.
// =================================================================

/**
 * Represents a photo with full database details, including timestamps.
 * This is likely what your API returns.
 */
export interface KosPhoto extends BaseKosPhoto {
  kosId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents kos data as seen by a public user or on a detail page.
 * Includes nested photos and rating info.
 */
export interface PublicKosData extends BaseKosData {
  averageRating: string;
  reviewCount: number;
  photos: BaseKosPhoto[]; // Use the base photo type for simplicity here
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the detailed kos data available only to an Admin.
 * Extends the public data and adds admin-specific metrics.
 */
export interface AdminKosData extends PublicKosData {
  postId: number; // Admin-specific
  isFeatured: boolean; // Admin-specific
  viewCount: number; // Admin-specific
  favoriteCount: number; // Admin-specific
  photoCount: number; // Admin-specific
  totalPost: number; // Admin-specific
  totalPenjualan: number; // Admin-specific
  owner: PublicKosData['owner'] & { role: string }; // Extends the owner type with a role
}

// =================================================================
// FORM & API RESPONSE TYPES
// =================================================================

/**
 * The shape of data used when creating or updating a kos via a form.
 * It's a subset of the full data structure.
 */
export type KosFormData = Pick<
  BaseKosData,
  | 'name'
  | 'description'
  | 'price'
  | 'address'
  | 'city'
  | 'facilities'
  | 'totalRooms'
  | 'occupiedRooms'
  | 'latitude'
  | 'longitude'
>;

/**
 * A generic API response structure for photos.
 */
export interface KosPhotosApiResponse {
  success: boolean;
  data: {
    photos: KosPhoto[]; // Use the full KosPhoto type
  };
  message?: string;
}

export interface KosSearchApiResponse {
  success: boolean;
  data?: {
    results: PublicKosData[];
    pagination?: { Pagination: PaginatedResponse<PublicKosData> };
  };
  message?: string;
}

export interface SearchParams {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  facilities?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminKosFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  ownerType?: string;
  sortBy?: string;
  showDeleted?: boolean; // New parameter for archive view
}

export type AdminKosApiResponse = PaginatedResponse<AdminKosData>;