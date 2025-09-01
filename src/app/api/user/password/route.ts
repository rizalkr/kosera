import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const bodySchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) });

export async function PUT(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return fail('validation_error', 'Current password and new password are required', parsed.error.format(), { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;

    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return fail('unauthorized', 'Authorization token required', undefined, { status: 401 });
    }
    const token = authorization.split(' ')[1];

    let decoded: { userId: number };
    try { decoded = jwt.verify(token, JWT_SECRET) as { userId: number }; } catch { return fail('invalid_token', 'Invalid token', undefined, { status: 401 }); }

    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (!user.length) return fail('not_found', 'User not found', undefined, { status: 404 });

    const currentUser = user[0];
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isCurrentPasswordValid) return fail('invalid_credentials', 'Current password is incorrect', undefined, { status: 400 });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedNewPassword }).where(eq(users.id, currentUser.id));

    return ok('Password updated successfully', { userId: currentUser.id });
  } catch (error) {
    console.error('Update password error:', error);
    return fail('internal_error', 'Internal server error', undefined, { status: 500 });
  }
}
