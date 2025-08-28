'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useBookings, useUpdateBooking } from '@/hooks/useApi';
import { showConfirm } from '@/lib/sweetalert';
import { cn } from '@/lib/utils';
import { BookingCard } from '@/components/bookings/BookingCard';
import type { ApiResponse, BookingListData, BookingStatus, BookingData } from '@/types';

export default function RenterBookingsPage() {
  const router = useRouter();
  const { user } = useAuthGuard();
  const { data: bookingsData, isLoading, error, refetch } = useBookings();
  const updateBookingMutation = useUpdateBooking();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');

  const response = bookingsData as (ApiResponse<BookingListData> | undefined);
  const bookings: (BookingData & { duration?: number; notes?: string })[] = (response?.data?.bookings as any[]) || [];

  const filtered = selectedStatus === 'all' ? bookings : bookings.filter(b => b.status === selectedStatus);

  const handleCancel = async (id: number) => {
    const r = await showConfirm('Apakah Anda yakin ingin membatalkan booking ini?', 'Konfirmasi Pembatalan', 'Ya, Batalkan', 'Tidak');
    if (r.isConfirmed) updateBookingMutation.mutate({ id, status: 'cancelled', notes: 'Booking dibatalkan oleh pengguna' });
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center text-gray-500">Memuat data booking...</div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
        <div className="min-h-screen bg-[#A9E4DE] pt-20">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center text-red-500">Error memuat data: {error.message}</div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['RENTER']}>
      <div className="min-h-screen bg-[#A9E4DE] pt-20">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Booking Saya</h1>
                <p className="text-gray-600">Kelola semua booking kos Anda</p>
              </div>
              <button onClick={() => refetch()} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Refresh</button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Selamat datang, <span className="font-semibold text-blue-600">{user?.username}</span>!
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {(['all','pending','confirmed','completed'] as const).map(st => {
                const labelMap: Record<string,string> = {
                  all: `Semua (${bookings.length})`,
                  pending: `Menunggu (${bookings.filter(b=>b.status==='pending').length})`,
                  confirmed: `Dikonfirmasi (${bookings.filter(b=>b.status==='confirmed').length})`,
                  completed: `Selesai (${bookings.filter(b=>b.status==='completed').length})`
                };
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      selectedStatus === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                  >{labelMap[st]}</button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {selectedStatus === 'all' ? 'Belum ada booking' : 'Tidak ada booking untuk status ini'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedStatus === 'all' ? 'Mulai dengan mencari kos yang Anda sukai' : 'Coba filter status lain untuk melihat booking Anda'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filtered.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    role="RENTER"
                    isMutating={updateBookingMutation.isPending}
                    actions={{
                      onCancel: handleCancel,
                      onDetail: (id) => router.push(`/renter/bookings/${id}`)
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
}
