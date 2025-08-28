import { z } from 'zod';
import { adminKosDataSchema } from './kos';

/**
 * Seller Kos Detail Schema
 * Extends the admin kos data schema with seller-specific statistics.
 * Owner is marked partial because some seller detail responses may omit nested owner info.
 */
export const sellerKosDetailSchema = adminKosDataSchema.extend({
  statistics: z.object({
    totalBookings: z.number().optional(),
    totalRevenue: z.number().optional(),
    occupiedRooms: z.number().optional(),
    totalRooms: z.number().optional(),
    vacantRooms: z.number().optional(),
    pendingBookings: z.number().optional(),
    totalRoomsRentedOut: z.number().optional(),
  }).optional(),
}).partial({ owner: true });

export const editKosRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  facilities: z.string().min(1),
  totalRooms: z.number().positive(),
  occupiedRooms: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});


export type SellerKosDetail = z.infer<typeof sellerKosDetailSchema>;
export type EditKosRequest = z.infer<typeof editKosRequestSchema>;

export interface UseEditKosHook {
  kosId: number;
  formData: EditKosRequest;
  isLoading: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => Promise<void>;
}

