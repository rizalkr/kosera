// src/types/dashboard.ts
// Types for seller dashboard stats and response structures

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
