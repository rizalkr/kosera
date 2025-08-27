import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSellerKosDetail } from '@/hooks/useApi';
import { adminKosDataSchema } from '@/types/kos';
import { z } from 'zod';

// For now reuse adminKosDataSchema (assuming seller detail shares structure). Adjust if seller-specific.
const sellerKosDetailSchema = adminKosDataSchema.extend({
  statistics: z.object({
    totalBookings: z.number().optional(),
    totalRevenue: z.number().optional(),
    occupiedRooms: z.number().optional(),
    totalRooms: z.number().optional(),
    vacantRooms: z.number().optional(),
    pendingBookings: z.number().optional(),
    totalRoomsRentedOut: z.number().optional(),
  }).optional(),
}).partial({ owner: true });

export type SellerKosDetail = z.infer<typeof sellerKosDetailSchema>;

export type SellerKosTab = 'overview' | 'bookings' | 'analytics' | 'settings';

export interface UseSellerKosDetailViewResult {
  kosId: number;
  kos?: SellerKosDetail;
  isLoading: boolean;
  error: unknown;
  activeTab: SellerKosTab;
  setActiveTab: (t: SellerKosTab) => void;
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  statistics: {
    totalBookings: number;
    totalViews: number;
    totalRevenue: number;
    occupiedRooms: number;
    vacantRooms: number;
    totalRooms: number;
    pendingBookings: number;
    totalRoomsRentedOut: number;
  };
  occupancyRate: number;
  formatCurrency: (n: number) => string;
  formatDate: (d: string) => string;
  getKosStatus: () => { label: string; color: string };
  refetch: () => Promise<any>;
}

export const useSellerKosDetailView = (): UseSellerKosDetailViewResult => {
  const params = useParams();
  const router = useRouter();
  const kosId = parseInt(params.id as string);
  const { data: kosResponse, isLoading, error, refetch } = useSellerKosDetail(kosId);
  let kos: SellerKosDetail | undefined = undefined;
  if (kosResponse?.data) {
    try { kos = sellerKosDetailSchema.parse(kosResponse.data); } catch { kos = kosResponse.data as any; }
  }
  const [activeTab, setActiveTab] = useState<SellerKosTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const statistics = useMemo(() => {
    const apiStats: any = (kos as any)?.statistics;
    if (apiStats) {
      return {
        totalBookings: apiStats.totalBookings ?? 0,
        totalViews: (kos as any)?.viewCount || 0,
        totalRevenue: apiStats.totalRevenue ?? 0,
        occupiedRooms: apiStats.occupiedRooms ?? 0,
        vacantRooms: apiStats.vacantRooms ?? Math.max((apiStats.totalRooms ?? 0) - (apiStats.occupiedRooms ?? 0), 0),
        totalRooms: apiStats.totalRooms ?? 0,
        pendingBookings: apiStats.pendingBookings ?? 0,
        totalRoomsRentedOut: apiStats.totalRoomsRentedOut ?? (kos as any)?.totalPenjualan ?? 0,
      };
    }
    return {
      totalBookings: 0,
      totalViews: (kos as any)?.viewCount || 0,
      totalRevenue: 0,
      occupiedRooms: (kos as any)?.occupiedRooms ?? 0,
      vacantRooms: Math.max(((kos as any)?.totalRooms ?? 0) - ((kos as any)?.occupiedRooms ?? 0), 0),
      totalRooms: (kos as any)?.totalRooms ?? 0,
      pendingBookings: 0,
      totalRoomsRentedOut: (kos as any)?.occupiedRooms ?? 0,
    };
  }, [kos]);

  const occupancyRate = statistics.totalRooms > 0
    ? Math.round((statistics.occupiedRooms / statistics.totalRooms) * 100)
    : 0;

  const formatCurrency = useCallback((amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount), []);
  const formatDate = useCallback((dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), []);

  const getKosStatus = useCallback(() => {
    if (!kos) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
  }, [kos]);

  return { kosId, kos, isLoading, error, activeTab, setActiveTab, isRefreshing, handleRefresh, statistics, occupancyRate, formatCurrency, formatDate, getKosStatus, refetch };
};
