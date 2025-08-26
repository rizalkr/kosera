// src/types/dashboard.ts
// Types for seller dashboard stats and response structures
import { z } from 'zod';
import { adminKosDataSchema } from './kos';

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

export interface SellerDashboardResponseData {
  kos: import('./kos').AdminKosData[];
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

export const sellerDashboardResponseSchema = z.object({
  kos: z.array(adminKosDataSchema),
  stats: sellerDashboardStatsSchema,
});

export type SellerDashboardStatsParsed = z.infer<typeof sellerDashboardStatsSchema>;
