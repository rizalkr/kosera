import { z } from 'zod';

/**
 * Zod schemas for authentication flows
 */
export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, underscore'),
  contact: z.string().refine(val => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    const cleaned = val.replace(/[\s-]/g, '');
    return emailRegex.test(val) || phoneRegex.test(cleaned);
  }, 'Format email atau nomor HP tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  role: z.enum(['RENTER','SELLER']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak sama',
  path: ['confirmPassword']
});
export type RegisterSchema = z.infer<typeof registerSchema>;

// Unified auth token response schema (login/register)
export const authTokenResponseSchema = z.object({
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
export type AuthTokenResponseSchema = z.infer<typeof authTokenResponseSchema>;

// Backwards compatibility exports
export const loginResponseSchema = authTokenResponseSchema;
export const registerResponseSchema = authTokenResponseSchema;
