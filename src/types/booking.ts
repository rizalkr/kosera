import type { KosPhoto } from './kos';

// Booking Types
export interface BookingData {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  kos: {
    id: number;
    name: string;
    address: string;
    photos: KosPhoto[];
  };
  user: {
    id: number;
    username: string;
    fullName: string;
    contact: string;
  };
  createdAt: string;
  updatedAt: string;
}
