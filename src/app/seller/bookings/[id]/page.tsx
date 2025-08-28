'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import KosImage from '@/components/ui/KosImage';
import type { BookingApiResponse, BookingDetailData, BookingStatus } from '@/types';
import { showConfirm } from '@/lib/sweetalert';
import { useUpdateBooking } from '@/hooks/useApi';
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { apiClient } from '@/lib/api/client';

const fetchBooking = async (id: string): Promise<BookingDetailData> => {
  const res = await apiClient.get(`/api/bookings/${id}`) as BookingApiResponse;
  if (!res.success || !res.data?.booking) throw new Error(res.error || 'Gagal memuat booking');
  return res.data.booking;
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2 border-b last:border-b-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
  </div>
);

export const SellerBookingDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params?.id as string;
  const updateMutation = useUpdateBooking();

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    enabled: !!bookingId,
  });

  const handleAction = async (next: BookingStatus, confirmText: string, notes?: string) => {
    if (!booking) return;
    const r = await showConfirm(confirmText, 'Konfirmasi', 'Ya', 'Batal');
    if (!r.isConfirmed) return;
    updateMutation.mutate({ id: booking.id, status: next, notes });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Detail Booking</h1>
          <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-800">&larr; Kembali</button>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">Memuat detail booking...</div>
        )}
        {error && (
          <div className="text-center py-12 text-red-500">
            Gagal memuat detail. <button onClick={() => refetch()} className="underline">Coba lagi</button>
          </div>
        )}
        {booking && (
          <div className="space-y-8">
            {/* Overview */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-72 h-48 bg-gray-200 rounded-lg overflow-hidden">
                <KosImage kosId={booking.kos.id} kosName={booking.kos.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{booking.post.title || booking.kos.name}</h2>
                    <p className="text-gray-600 text-sm mt-1">{booking.kos.address}, {booking.kos.city}</p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-800">{new Date(booking.checkInDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-800">{new Date(booking.checkOutDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-500">Total Harga</p>
                    <p className="font-semibold text-blue-600">Rp {booking.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Penyewa */}
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Informasi Penyewa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <DetailRow label="Username" value={booking.user.username} />
                <DetailRow label="Nama" value={booking.user.name || '-'} />
                <DetailRow label="Kontak" value={booking.user.contact || '-'} />
                <DetailRow label="ID Penyewa" value={`#${booking.user.id}`} />
              </div>
            </div>

            {/* Rincian Booking */}
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Rincian Booking</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <DetailRow label="ID Booking" value={`#${booking.id}`} />
                <DetailRow label="Status" value={<BookingStatusBadge status={booking.status} />} />
                <DetailRow label="Durasi" value={`${booking.duration ?? '-'} bulan`} />
                <DetailRow label="Dibuat" value={new Date(booking.createdAt).toLocaleString('id-ID')} />
                <DetailRow label="Diperbarui" value={new Date(booking.updatedAt).toLocaleString('id-ID')} />
                <DetailRow label="Catatan" value={booking.notes || '-'} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {booking.status === 'pending' && (
                <>
                  <button onClick={() => handleAction('confirmed','Konfirmasi booking ini?')} disabled={updateMutation.isPending} className="bg-green-600 text-white px-5 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50">{updateMutation.isPending ? 'Memproses...' : 'Konfirmasi'}</button>
                  <button onClick={() => handleAction('cancelled','Batalkan booking ini?','Booking dibatalkan oleh pemilik')} disabled={updateMutation.isPending} className="bg-red-600 text-white px-5 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50">{updateMutation.isPending ? 'Memproses...' : 'Batalkan'}</button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <button onClick={() => handleAction('completed','Tandai booking sebagai selesai?')} disabled={updateMutation.isPending} className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">{updateMutation.isPending ? 'Memproses...' : 'Tandai Selesai'}</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerBookingDetailPage;
