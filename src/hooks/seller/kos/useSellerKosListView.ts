import { useState, useMemo, useCallback } from 'react';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useMyKos } from '@/hooks/useApi';
import { baseKosDataSchema } from '@/types/kos';
import { z } from 'zod';

const kosListSchema = z.array(baseKosDataSchema.partial({ owner: true }));
export type SellerKosListItem = z.infer<typeof kosListSchema>[number];

export interface SellerKosCounts {
  totalKos: number;
  activeKos: number;
  pendingKos: number;
  totalPrice: number;
}

export interface UseSellerKosListViewResult {
  user: { username?: string } | null;
  kosList: SellerKosListItem[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<any>;
  isRefreshing: boolean;
  handleRefresh: () => Promise<void>;
  counts: SellerKosCounts;
  formatPrice: (price: number | null | undefined) => string;
  getKosStatus: (kos: SellerKosListItem) => { label: string; color: string };
}

export const useSellerKosListView = (): UseSellerKosListViewResult => {
  const { user } = useAuthGuard();
  const { data: kosResponse, isLoading, error, refetch } = useMyKos();
  let kosList: SellerKosListItem[] = [];
  if (kosResponse?.data) {
    try { kosList = kosListSchema.parse(kosResponse.data); } catch { kosList = kosResponse.data as any; }
  }
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const formatPrice = useCallback((price: number | null | undefined) => !price ? 'Belum diatur' : `Rp ${price.toLocaleString('id-ID')}`, []);

  const getKosStatus = useCallback((kos: SellerKosListItem) => {
    const isActive = (kos as SellerKosListItem & { isActive?: boolean }).isActive;
    const verified = (kos as SellerKosListItem & { verified?: boolean }).verified;
    if (isActive === false) return { label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' };
    if (verified === false) return { label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Aktif', color: 'bg-green-100 text-green-800' };
  }, []);

  const counts = useMemo(() => {
    const totalKos = kosList.length;
    const activeKos = kosList.filter(k => getKosStatus(k).label === 'Aktif').length;
    const pendingKos = kosList.filter(k => getKosStatus(k).label === 'Menunggu Verifikasi').length;
    const totalPrice = kosList.reduce((sum, k) => sum + (k.price || 0), 0);
    return { totalKos, activeKos, pendingKos, totalPrice };
  }, [kosList, getKosStatus]);

  return { user, kosList, isLoading, error, refetch, isRefreshing, handleRefresh, counts, formatPrice, getKosStatus };
};
