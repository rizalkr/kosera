import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, users } from '@/db';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

// Shared types
const userIdParam = z.number().int().positive();

const updateUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  contact: z.string().min(3),
  role: z.enum(['ADMIN', 'SELLER', 'RENTER']),
  password: z.string().min(6).optional(),
});

function extractUserId(url: string): number | null {
  try {
    const u = new URL(url);
    const seg = u.pathname.split('/').filter(Boolean);
    const maybe = Number(seg[seg.length - 1]);
    return Number.isInteger(maybe) ? maybe : null;
  } catch {
    return null;
  }
}

async function getUserHandler(request: AuthenticatedRequest) {
  const userId = extractUserId(request.url);
  if (!userId || !userIdParam.safeParse(userId).success) {
    return fail('invalid_user_id', 'Invalid user ID', undefined, { status: 400 });
  }
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        createdBy: users.createdBy,
        deletedBy: users.deletedBy,
      })
      .from(users)
      .where(sql`${users.id} = ${userId} AND ${users.deletedAt} IS NULL`)
      .limit(1);

    if (user.length === 0) {
      return fail('not_found', 'User not found', undefined, { status: 404 });
    }

    return ok('User retrieved successfully', { user: user[0] });
  } catch (error) {
    console.error('Get user error:', error);
    return fail('internal_error', 'Internal server error', undefined, { status: 500 });
  }
}

async function updateUserHandler(request: AuthenticatedRequest) {
  const userId = extractUserId(request.url);
  if (!userId || !userIdParam.safeParse(userId).success) {
    return fail('invalid_user_id', 'Invalid user ID', undefined, { status: 400 });
  }
  try {
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return fail('not_found', 'User not found', undefined, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail('invalid_json', 'Invalid JSON body', undefined, { status: 400 });
    }

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return fail('validation_error', 'Invalid input', parsed.error.flatten(), { status: 400 });
    }
    const { name, username, contact, role, password } = parsed.data;

    if (username !== existingUser[0].username) {
      const usernameCheck = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (usernameCheck.length > 0) {
        // Standardize to username_exists (used in other admin user endpoints)
        return fail('username_exists', 'Username already exists', undefined, { status: 409 });
      }
    }

    const updateData: Partial<{
      name: string;
      username: string;
      contact: string;
      role: 'ADMIN' | 'SELLER' | 'RENTER';
      password: string;
    }> = { name, username, contact, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        username: users.username,
        contact: users.contact,
        role: users.role,
        createdAt: users.createdAt,
      });

    return ok('User updated successfully', { user: updated[0] });
  } catch (error) {
    console.error('Update user error:', error);
    return fail('internal_error', 'Internal server error', undefined, { status: 500 });
  }
}

async function deleteUserHandler(request: AuthenticatedRequest) {
  const userId = extractUserId(request.url);
  if (!userId || !userIdParam.safeParse(userId).success) {
    return fail('invalid_user_id', 'Invalid user ID', undefined, { status: 400 });
  }
  try {
    const currentUserId = request.user?.userId;
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`${users.id} = ${userId} AND ${users.deletedAt} IS NULL`)
      .limit(1);

    if (existingUser.length === 0) {
      return fail('not_found', 'User not found or already deleted', undefined, { status: 404 });
    }

    if (existingUser[0].id === currentUserId) {
      return fail('cannot_delete_self', 'Cannot delete your own account', undefined, { status: 400 });
    }

    await db
      .update(users)
      .set({ deletedAt: new Date(), deletedBy: currentUserId })
      .where(eq(users.id, userId));

    return ok('User deleted successfully', {});
  } catch (error) {
    console.error('Delete user error:', error);
    return fail('internal_error', 'Internal server error', undefined, { status: 500 });
  }
}

async function restoreUserHandler(request: AuthenticatedRequest) {
  const userId = extractUserId(request.url);
  if (!userId || !userIdParam.safeParse(userId).success) {
    return fail('invalid_user_id', 'Invalid user ID', undefined, { status: 400 });
  }
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`${users.id} = ${userId} AND ${users.deletedAt} IS NOT NULL`)
      .limit(1);

    if (existingUser.length === 0) {
      return fail('not_found', 'User not found or not deleted', undefined, { status: 404 });
    }

    await db.update(users).set({ deletedAt: null, deletedBy: null }).where(eq(users.id, userId));

    return ok('User restored successfully', {});
  } catch (error) {
    console.error('Restore user error:', error);
    return fail('internal_error', 'Internal server error', undefined, { status: 500 });
  }
}

export const GET = withAdmin(getUserHandler);
export const PUT = withAdmin(updateUserHandler);
export const DELETE = withAdmin(deleteUserHandler);
export const PATCH = withAdmin(restoreUserHandler);

// TODO: Add audit logging for user update/delete/restore actions.
// TODO: Standardize any remaining error codes across admin user endpoints.
