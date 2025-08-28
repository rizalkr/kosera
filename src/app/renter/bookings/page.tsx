'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useBookings, useUpdateBooking } from '@/hooks/useApi';
import { showConfirm } from '@/lib/sweetalert';
import { cn } from '@/lib/utils';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Pagination } from '@/components/ui/Pagination';
import type { ApiResponse, BookingListData, BookingStatus } from '@/types';

const STATUS_VALUES: (BookingStatus | 'all')[] = ['all','pending','confirmed','completed'];

export default function RenterBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const statusParam = (searchParams.get('status') as BookingStatus | 'all' | null) || 'all';

  const { user } = useAuthGuard();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>(statusParam);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);

  const { data: bookingsData, isLoading, error, refetch } = useBookings({ page: currentPage, status: selectedStatus === 'all' ? undefined : selectedStatus });
  const updateBookingMutation = useUpdateBooking();

  // Sync when URL search params change
  useEffect(() => {
    if (statusParam !== selectedStatus) setSelectedStatus(statusParam);
    if (pageParam !== currentPage) setCurrentPage(pageParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, pageParam]);

  // Push state to URL when filters/page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (currentPage > 1) params.set('page', String(currentPage));
    const qs = params.toString();
    router.replace(`/renter/bookings${qs ? `?${qs}` : ''}`);
  }, [selectedStatus, currentPage, router]);

  const response = bookingsData as (ApiResponse<BookingListData> | undefined);
  const bookings = response?.data?.bookings || [];
  const pagination = response?.data?.pagination;

  const handleCancel = async (id: number) => {
    const r = await showConfirm('Apakah Anda yakin ingin membatalkan booking ini?', 'Konfirmasi Pembatalan', 'Ya, Batalkan', 'Tidak');
    if (r.isConfirmed) updateBookingMutation.mutate({ id, status: 'cancelled', notes: 'Booking dibatalkan oleh pengguna' });
  };

  const onPageChange = (p: number) => {
    if (p < 1 || (pagination && p > pagination.totalPages)) return;
    setCurrentPage(p);
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
              {STATUS_VALUES.map(st => {
                const count = bookings.filter(b=>b.status===st).length;
                const labelMap: Record<string,string> = {
                  all: `Semua (${pagination?.totalBookings ?? bookings.length})`,
                  pending: `Menunggu${st==='pending' ? ` (${count})` : ''}`,
                  confirmed: `Dikonfirmasi${st==='confirmed' ? ` (${count})` : ''}`,
                  completed: `Selesai${st==='completed' ? ` (${count})` : ''}`
                };
                return (
                  <button
                    key={st}
                    onClick={() => { setCurrentPage(1); setSelectedStatus(st); }}
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

            {bookings.length === 0 ? (
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
              <>
                <div className="space-y-6">
                  {bookings.map(b => (
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
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
