'use client';

import { useState, useCallback } from 'react';
import { adminBookingsApi, UpdateBookingStatusData } from '@/lib/api/admin-bookings';
import { ApiError } from '@/lib/api/client';

export type AdminBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AdminUpdateBookingStatusPayload {
  bookingId: number;
  status: AdminBookingStatus;
  notes?: string;
}

interface UseAdminUpdateBookingStatusResult {
  trigger: (payload: AdminUpdateBookingStatusPayload) => Promise<unknown>;
  isMutating: boolean;
  error: Error | null;
}

/**
 * Refactored admin booking status update hook using unified API client
 */
export const useAdminUpdateBookingStatus = (): UseAdminUpdateBookingStatusResult => {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const trigger = useCallback(async (payload: AdminUpdateBookingStatusPayload) => {
    setIsMutating(true);
    setError(null);

    try {
      const updateData: UpdateBookingStatusData = {
        status: payload.status,
        notes: payload.notes,
      };

      const result = await adminBookingsApi.updateBookingStatus(payload.bookingId, updateData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update booking status');
      }

      return result.data;
    } catch (err) {
      const apiError = err instanceof ApiError 
        ? new Error(`${err.message} (Status: ${err.status})`)
        : err instanceof Error 
        ? err
        : new Error('Failed to update booking status');
      
      setError(apiError);
      throw apiError;
    } finally {
      setIsMutating(false);
    }
  }, []);

  return { trigger, isMutating, error };
};
