'use client';

import React, { useState, useEffect } from 'react';
import { useBookings, useUpdateBooking } from '@/hooks/useApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { showConfirm } from '@/lib/sweetalert';
import { cn } from '@/lib/utils';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Pagination } from '@/components/ui/Pagination';
import type { ApiResponse, BookingListData, BookingStatus } from '@/types';

// Page size backend-defined; we rely on API pagination meta
const STATUS_VALUES: (BookingStatus | 'all')[] = ['all','pending','confirmed','cancelled','completed'];

// ---------------- Page ----------------
export const SellerBookingsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const statusParam = (searchParams.get('status') as BookingStatus | 'all' | null) || 'all';

  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>(statusParam);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);

  const { data, isLoading, error, refetch } = useBookings({ page: currentPage, status: selectedStatus === 'all' ? undefined : selectedStatus });
  const updateBookingMutation = useUpdateBooking();

  // Sync local state with URL changes (e.g., back/forward navigation)
  useEffect(() => {
    if (statusParam !== selectedStatus) setSelectedStatus(statusParam);
    if (pageParam !== currentPage) setCurrentPage(pageParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, pageParam]);

  // Update URL when filters/page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (currentPage > 1) params.set('page', String(currentPage));
    const qs = params.toString();
    router.replace(`/seller/bookings${qs ? `?${qs}` : ''}`);
  }, [selectedStatus, currentPage, router]);

  // Extract bookings list from API response
  const response = data as (ApiResponse<BookingListData> | undefined);
  const bookings = response?.data?.bookings || [];
  const pagination = response?.data?.pagination;

  const handleConfirm = async (id: number) => {
    const r = await showConfirm('Konfirmasi booking ini?', 'Konfirmasi', 'Ya', 'Batal');
    if (r.isConfirmed) updateBookingMutation.mutate({ id, status: 'confirmed' });
  };
  const handleCancel = async (id: number) => {
    const r = await showConfirm('Batalkan booking ini?', 'Konfirmasi', 'Ya', 'Batal');
    if (r.isConfirmed) updateBookingMutation.mutate({ id, status: 'cancelled', notes: 'Booking dibatalkan oleh pemilik' });
  };
  const handleComplete = async (id: number) => {
    const r = await showConfirm('Tandai booking sebagai selesai?', 'Konfirmasi', 'Ya', 'Batal');
    if (r.isConfirmed) updateBookingMutation.mutate({ id, status: 'completed' });
  };

  const onPageChange = (p: number) => {
    if (p < 1 || (pagination && p > pagination.totalPages)) return;
    setCurrentPage(p);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-red-500">
          Gagal memuat data bookings. <button onClick={() => refetch()} className="underline">Coba lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Bookings Kos Saya</h1>
            <p className="text-gray-600">Kelola permintaan booking pada kos Anda</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >Refresh</button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_VALUES.map(st => {
            const count = bookings.filter(b=>b.status===st).length;
            const labelMap: Record<string,string> = {
              all: `Semua (${pagination?.totalBookings ?? bookings.length})`,
              pending: `Menunggu${st==='pending' ? ` (${count})` : ''}`,
              confirmed: `Dikonfirmasi${st==='confirmed' ? ` (${count})` : ''}`,
              cancelled: `Dibatalkan${st==='cancelled' ? ` (${count})` : ''}`,
              completed: `Selesai${st==='completed' ? ` (${count})` : ''}`
            };
            return (
              <button
                key={st}
                onClick={() => { setCurrentPage(1); setSelectedStatus(st); }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedStatus === st
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >{labelMap[st]}</button>
            );
          })}
        </div>

        {/* Empty State or List */}
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {selectedStatus === 'all' ? 'Belum ada booking' : 'Tidak ada booking untuk status ini'}
            </h3>
            <p className="text-gray-500 mb-4">Promosikan kos Anda untuk mendapatkan booking baru.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {bookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  role="SELLER"
                  isMutating={updateBookingMutation.isPending}
                  actions={{
                    onConfirm: handleConfirm,
                    onCancel: handleCancel,
                    onComplete: handleComplete,
                    onDetail: (id) => router.push(`/seller/bookings/${id}`)
                  }}
                />
              ))}
            </div>
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerBookingsPage;
