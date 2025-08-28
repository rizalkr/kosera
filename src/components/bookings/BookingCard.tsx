import React from 'react';
import KosImage from '@/components/ui/KosImage';
import { BookingStatusBadge } from './BookingStatusBadge';
import type { BookingStatus, BookingData } from '@/types';

export interface BookingCardActions {
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
  onComplete?: (id: number) => void;
  onDetail?: (id: number) => void;
}

export interface BookingCardProps {
  booking: BookingData & { duration?: number; notes?: string };
  role: 'RENTER' | 'SELLER';
  isMutating?: boolean;
  actions?: BookingCardActions;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, role, isMutating, actions }) => {
  const { id, kos, checkInDate, checkOutDate, totalPrice, status, duration } = booking;
  return (
    <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden relative bg-gray-200">
          <KosImage kosId={kos.id} kosName={kos.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">{kos.name}</h3>
            <BookingStatusBadge status={status as BookingStatus} />
          </div>
          <p className="text-gray-600 text-sm mb-3">ID Kos #{kos.id}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-500">Check-in</p>
              <p className="font-medium text-gray-700">{new Date(checkInDate).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-gray-500">Check-out</p>
              <p className="font-medium text-gray-700">{new Date(checkOutDate).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-gray-500">Durasi</p>
              <p className="font-medium text-gray-700">{duration ?? '-'} bulan</p>
            </div>
            <div>
              <p className="text-gray-500">Total Harga</p>
              <p className="font-bold text-blue-600">Rp {totalPrice.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {role === 'SELLER' && status === 'pending' && (
              <>
                {!!actions?.onConfirm && (
                  <button onClick={() => actions.onConfirm?.(id)} disabled={isMutating} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50">{isMutating ? 'Memproses...' : 'Konfirmasi'}</button>
                )}
                {!!actions?.onCancel && (
                  <button onClick={() => actions.onCancel?.(id)} disabled={isMutating} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50">{isMutating ? 'Memproses...' : 'Batalkan'}</button>
                )}
              </>
            )}
            {role === 'SELLER' && status === 'confirmed' && !!actions?.onComplete && (
              <button onClick={() => actions.onComplete?.(id)} disabled={isMutating} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">{isMutating ? 'Memproses...' : 'Tandai Selesai'}</button>
            )}
            {role === 'RENTER' && status === 'pending' && !!actions?.onCancel && (
              <button onClick={() => actions.onCancel?.(id)} disabled={isMutating} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50">{isMutating ? 'Membatalkan...' : 'Batalkan'}</button>
            )}
            {!!actions?.onDetail && (
              <button onClick={() => actions.onDetail?.(id)} className="bg-white border px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-100">Detail</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
