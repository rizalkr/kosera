'use client';

import React from 'react';
import { useBookings } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { BookingData, PaginatedResponse, ApiResponse } from '@/types';

interface StatusBadgeProps { status: string }
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return (
    <span className={cn('px-2 py-1 rounded text-xs font-medium border inline-block', colors[status] || 'bg-gray-100 text-gray-800 border-gray-200')}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface BookingRowActionsProps { id: number; status: string }
export const BookingRowActions: React.FC<BookingRowActionsProps> = ({ id, status }) => {
  const router = useRouter();
  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => router.push(`/bookings/${id}`)}
        className="px-3 py-1.5 text-sm rounded-md bg-white border border-gray-300 hover:bg-gray-50"
      >
        Detail
      </button>
      {status === 'pending' && (
        <button
          onClick={() => router.push(`/bookings/${id}?action=manage`)}
          className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Proses
        </button>
      )}
    </div>
  );
};

export const SellerBookingsPage = () => {
  const { data, isLoading, error, refetch } = useBookings(); // TODO: replace with seller-specific endpoint when available

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4">
          Gagal memuat data bookings. <button onClick={() => refetch()} className="underline">Coba lagi</button>
        </div>
      </div>
    );
  }

  // Adapt to PaginatedResponse shape: assume data.data contains { items, pagination }
  const paginated = data as (ApiResponse<PaginatedResponse<BookingData>> | undefined);
  // Current PaginatedResponse<T> shape uses data.kos for array
  const bookings = (paginated?.data as unknown as PaginatedResponse<BookingData> | undefined)?.data?.kos ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Bookings</h1>
            <p className="text-gray-600">Pantau dan proses permintaan booking kos Anda</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button onClick={() => refetch()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Refresh</button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <p className="text-gray-600 mb-4">Belum ada booking yang masuk.</p>
            <p className="text-sm text-gray-500">Promosikan kos Anda untuk mendapatkan booking pertama.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{b.kos?.name || '—'}</div>
                        <div className="text-xs text-gray-500">#{b.kosId}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {new Date(b.checkInDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{b.duration} bulan</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm"><BookingRowActions id={b.id} status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerBookingsPage;
