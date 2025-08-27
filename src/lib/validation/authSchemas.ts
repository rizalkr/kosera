import { z } from 'zod';

/**
 * Zod schemas for authentication flows
 */
export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.number(),
      username: z.string(),
      role: z.enum(['ADMIN','SELLER','RENTER']),
    })
  }).optional()
}).passthrough();
export type LoginResponseSchema = z.infer<typeof loginResponseSchema>;
