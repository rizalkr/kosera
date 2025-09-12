import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { ok, fail } from '@/types/api';
import { z } from 'zod';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { ERROR_CODES } from '@/types/error-codes';

// Strength rules: >=8 chars, at least one uppercase, one lowercase, one digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const bodySchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(passwordRegex, 'Password must contain uppercase, lowercase and a number'),
    confirmNewPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export async function PUT(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail(ERROR_CODES.validation_error, 'Invalid password update payload', parsed.error.format(), { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;

    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) return fail(ERROR_CODES.unauthorized, 'Authentication required', undefined, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return fail(ERROR_CODES.invalid_token, 'Invalid or expired token', undefined, { status: 401 });

    const user = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    if (!user.length) return fail(ERROR_CODES.not_found, 'User not found', undefined, { status: 404 });

    const currentUser = user[0];
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isCurrentPasswordValid) return fail(ERROR_CODES.invalid_credentials, 'Current password is incorrect', undefined, { status: 400 });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedNewPassword }).where(eq(users.id, currentUser.id));

    return ok('Password updated successfully', { userId: currentUser.id });
  } catch (error) {
    console.error('Update password error:', error);
    return fail(ERROR_CODES.internal_error, 'Internal server error', undefined, { status: 500 });
  }
}
