import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) return fail('invalid_json', 'Invalid JSON format', undefined, { status: 400 });

    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return fail('validation_error', 'Invalid input', parsed.error.flatten(), { status: 400 });
    }
    const { username, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const targetUser = user || (await db.select().from(users).where(eq(users.contact, username)).limit(1))[0];
    if (!targetUser) return fail('invalid_credentials', 'Invalid credentials', undefined, { status: 401 });

    const isValidPassword = await verifyPassword(password, targetUser.password);
    if (!isValidPassword) return fail('invalid_credentials', 'Invalid credentials', undefined, { status: 401 });

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
    console.error('auth.login.POST error', error);
    return fail('internal_error', 'Unexpected server error', undefined, { status: 500 });
  }
}
