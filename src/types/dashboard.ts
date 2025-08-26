// src/types/dashboard.ts
// Types for seller dashboard stats and response structures
import { z } from 'zod';

export interface SellerDashboardStats {
  totalKos: number;
  totalBookings: number;
  totalPendingBookings: number;
  totalRooms: number;
  totalOccupiedRooms: number;
  totalVacantRooms: number;
  totalRevenue: number;
  totalViews: number;
  totalFavorites: number;
}

// New statistics shape per kos (matches API nested `statistics`)
export interface SellerDashboardKosStatistics {
  totalBookings: number;
  pendingBookings: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalRooms: number;
  totalRevenue: number;
  totalRoomsRentedOut: number;
}

// A lightweight kos item representation for the seller dashboard (no owner/photos required)
export interface SellerDashboardKosItem {
  id: number;
  postId: number;
  name: string;
  address: string;
  city: string;
  facilities: string | null; // may be nullable in DB
  totalRooms: number;
  occupiedRooms: number;
  title: string;
  description: string;
  price: number;
  totalPost: number;
  totalPenjualan: number;
  viewCount: number;
  favoriteCount: number;
  averageRating: string; // decimal returned as string
  reviewCount: number;
  photoCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  statistics: SellerDashboardKosStatistics;
}

export interface SellerDashboardResponseData {
  // Was: AdminKosData[]; now tailored list
  kos: SellerDashboardKosItem[];
  stats: SellerDashboardStats;
}

// Zod schemas for runtime validation
export const sellerDashboardStatsSchema = z.object({
  totalKos: z.number().nonnegative(),
  totalBookings: z.number().nonnegative(),
  totalPendingBookings: z.number().nonnegative(),
  totalRooms: z.number().nonnegative(),
  totalOccupiedRooms: z.number().nonnegative(),
  totalVacantRooms: z.number().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  totalViews: z.number().nonnegative(),
  totalFavorites: z.number().nonnegative(),
});

// Nested statistics per kos schema
export const sellerDashboardKosStatisticsSchema = z.object({
  totalBookings: z.number().nonnegative(),
  pendingBookings: z.number().nonnegative(),
  occupiedRooms: z.number().nonnegative(),
  vacantRooms: z.number().nonnegative(),
  totalRooms: z.number().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  totalRoomsRentedOut: z.number().nonnegative(),
});

// Lightweight kos item schema specifically for dashboard response
export const sellerDashboardKosItemSchema = z.object({
  id: z.number(),
  postId: z.number(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  facilities: z.string().nullable(), // required nullable (no optional) to ensure string | null, never undefined
  totalRooms: z.number().nonnegative(),
  occupiedRooms: z.number().nonnegative(),
  title: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
  totalPost: z.number().nonnegative(),
  totalPenjualan: z.number().nonnegative(),
  viewCount: z.number().nonnegative(),
  favoriteCount: z.number().nonnegative(),
  averageRating: z.string(),
  reviewCount: z.number().nonnegative(),
  photoCount: z.number().nonnegative(),
  isFeatured: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  statistics: sellerDashboardKosStatisticsSchema,
});

export const sellerDashboardResponseSchema = z.object({
  kos: z.array(sellerDashboardKosItemSchema),
  stats: sellerDashboardStatsSchema,
});

export type SellerDashboardStatsParsed = z.infer<typeof sellerDashboardStatsSchema>;
export type SellerDashboardKosItemParsed = z.infer<typeof sellerDashboardKosItemSchema>;
