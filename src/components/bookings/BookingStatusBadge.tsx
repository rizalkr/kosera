import React from 'react';
import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

export interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusMap: Record<BookingStatus, { label: string; classes: string }> = {
  pending: { label: 'Menunggu Konfirmasi', classes: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Dikonfirmasi', classes: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', classes: 'bg-red-100 text-red-800' },
  completed: { label: 'Selesai', classes: 'bg-blue-100 text-blue-800' },
};

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, className }) => {
  const cfg = statusMap[status];
  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', cfg.classes, className)}>
      {cfg.label}
    </span>
  );
};

export const getBookingStatusLabel = (status: BookingStatus) => statusMap[status].label;
export const getBookingStatusColorClasses = (status: BookingStatus) => statusMap[status].classes;
