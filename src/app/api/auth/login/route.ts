import { NextRequest } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const parseJson = await request.json().catch(() => null);
    if (!parseJson) {
      return fail('Invalid JSON format', undefined, undefined, { status: 400 });
    }
    const parsed = loginSchema.safeParse(parseJson);
    if (!parsed.success) {
      return fail('Validation error', 'Invalid input', parsed.error.flatten(), { status: 400 });
    }
    const { username, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    const targetUser = user || (await db.select().from(users).where(eq(users.contact, username)).limit(1))[0];
    if (!targetUser) {
      return fail('Invalid credentials', undefined, undefined, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, targetUser.password);
    if (!isValidPassword) {
      return fail('Invalid credentials', undefined, undefined, { status: 401 });
    }

    const token = generateToken({ userId: targetUser.id, username: targetUser.username, role: targetUser.role });

    return ok('Login successful', {
      user: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        contact: targetUser.contact,
        role: targetUser.role,
        createdAt: targetUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return fail('Internal server error', 'Unexpected server error');
  }
}
