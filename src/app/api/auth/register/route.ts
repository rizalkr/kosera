import { NextRequest } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

const registerSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  contact: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'SELLER', 'RENTER']).optional().default('RENTER'),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    if (!json) return fail('Invalid JSON format', undefined, undefined, { status: 400 });

    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return fail('Validation error', 'Invalid input', parsed.error.flatten(), { status: 400 });
    }
    const { name, username, contact, password, role } = parsed.data;

    const result = await db.transaction(async (tx) => {
      const existingUser = await tx.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
      if (existingUser.length > 0) throw new Error('USERNAME_EXISTS');

      const existingContact = await tx.select({ id: users.id }).from(users).where(eq(users.contact, contact)).limit(1);
      if (existingContact.length > 0) throw new Error('CONTACT_EXISTS');

      const hashedPassword = await hashPassword(password);

      const [newUser] = await tx
        .insert(users)
        .values({ name, username, contact, password: hashedPassword, role })
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
          role: users.role,
          createdAt: users.createdAt,
        });

      const token = generateToken({ userId: newUser.id, username: newUser.username, role: newUser.role });
      return { user: newUser, token };
    });

    return ok('User registered successfully', { user: result.user, token: result.token });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      if (error.message === 'USERNAME_EXISTS') {
        return fail('Username already exists', 'Username yang Anda pilih sudah digunakan oleh user lain', undefined, { status: 409 });
      }
      if (error.message === 'CONTACT_EXISTS') {
        return fail('Contact already exists', 'Nomor HP/Email yang Anda masukkan sudah terdaftar', undefined, { status: 409 });
      }
    }
    return fail('Internal server error', 'Terjadi kesalahan server, silakan coba lagi');
  }
}
