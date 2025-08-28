'use client';

import React, { useState } from 'react';
import { useBookings, useUpdateBooking } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { showConfirm } from '@/lib/sweetalert';
import { cn } from '@/lib/utils';
import { BookingCard } from '@/components/bookings/BookingCard';
import type { ApiResponse, BookingListData, BookingStatus, BookingData } from '@/types';

// ---------------- Page ----------------
export const SellerBookingsPage = () => {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useBookings();
  const updateBookingMutation = useUpdateBooking();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');

  // Extract bookings list from API response
  const response = data as (ApiResponse<BookingListData> | undefined);
  const bookings: (BookingData & { duration?: number; notes?: string })[] = (response?.data?.bookings as any[]) || [];

  const filtered = selectedStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === selectedStatus);

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

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <div className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-red-500">
              Gagal memuat data bookings. <button onClick={() => refetch()} className="underline">Coba lagi</button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['SELLER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              {(['all','pending','confirmed','cancelled','completed'] as const).map(st => {
                const labelMap: Record<string,string> = {
                  all: `Semua (${bookings.length})`,
                  pending: `Menunggu (${bookings.filter(b=>b.status==='pending').length})`,
                  confirmed: `Dikonfirmasi (${bookings.filter(b=>b.status==='confirmed').length})`,
                  cancelled: `Dibatalkan (${bookings.filter(b=>b.status==='cancelled').length})`,
                  completed: `Selesai (${bookings.filter(b=>b.status==='completed').length})`
                };
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
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

            {/* Empty State */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {selectedStatus === 'all' ? 'Belum ada booking' : 'Tidak ada booking untuk status ini'}
                </h3>
                <p className="text-gray-500 mb-4">Promosikan kos Anda untuk mendapatkan booking baru.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filtered.map(b => (
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
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default SellerBookingsPage;
