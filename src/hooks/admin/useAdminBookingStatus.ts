import { useState } from 'react';
import useSWRMutation from 'swr/mutation';

export type AdminBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AdminUpdateBookingStatusPayload {
  bookingId: number;
  status: AdminBookingStatus;
  notes?: string;
}

/**
 * Fetcher for updating booking status as admin.
 * @param url - API endpoint (unused, but required by SWR)
 * @param arg - Contains bookingId, status, and optional notes
 */
const updateBookingStatus = async (
  url: string,
  { arg }: { arg: AdminUpdateBookingStatusPayload }
) => {
  // 1. Ambil token dari localStorage.
  // Key 'auth_token' disesuaikan dengan yang ada di useAuthToken.ts
  const token = localStorage.getItem('auth_token');

  // 2. Lakukan pengecekan token sebelum mengirim request.
  if (!token) {
    // Melempar error jika token tidak ditemukan sama sekali.
    throw new Error('Otorisasi gagal: Token tidak ditemukan.');
  }

  // 3. Kirim request dengan header dan method yang benar.
  const res = await fetch(`/api/admin/bookings/${arg.bookingId}`, {
    method: 'PATCH', // Ganti method menjadi PUT sesuai API route
    headers: {
      'Content-Type': 'application/json',
      // Tambahkan header Authorization dengan format Bearer Token
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status: arg.status, notes: arg.notes }),
  });

  const data = await res.json();
  if (!res.ok) {
    // Melempar pesan error yang lebih informatif dari respons API
    throw new Error(data.error || 'Gagal memperbarui status booking');
  }
  return data.data;
};

interface UseAdminUpdateBookingStatusResult {
  trigger: (payload: AdminUpdateBookingStatusPayload) => Promise<unknown>;
  isMutating: boolean;
  error: Error | null;
}

/**
 * SWR mutation hook for admin to update booking status.
 */
export const useAdminUpdateBookingStatus = (): UseAdminUpdateBookingStatusResult => {
  const [error, setError] = useState<Error | null>(null);

  const { trigger: swrTrigger, isMutating } = useSWRMutation(
    '/api/admin/bookings/update-status', // Kunci SWR statis, tidak digunakan di URL fetcher
    updateBookingStatus
  );

  /**
   * Triggers the booking status update.
   */
  const trigger = async (payload: AdminUpdateBookingStatusPayload) => {
    setError(null);
    try {
      return await swrTrigger(payload);
    } catch (err) {
      setError(err as Error);
      throw err; // Lempar kembali error agar bisa ditangkap di komponen
    }
  };

  return { trigger, isMutating, error };
};