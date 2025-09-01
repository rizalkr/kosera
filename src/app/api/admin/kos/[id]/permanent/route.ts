import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

// Permanent delete kos (only allowed for archived kos)
async function permanentDeleteKosHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const kosIdRaw = pathSegments[pathSegments.length - 2]; // /permanent is last
    const idSchema = z.coerce.number().int().positive();
    const parsed = idSchema.safeParse(kosIdRaw);
    if (!parsed.success) {
      return fail('invalid_id', 'Invalid kos ID', parsed.error.format(), { status: 400 });
    }
    const kosId = parsed.data;

    // Check if kos exists and is already deleted (in archive)
    const existingKos = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(sql`${kos.id} = ${kosId} AND ${kos.deletedAt} IS NOT NULL`)
      .limit(1);

    if (existingKos.length === 0) {
      return fail('not_found', 'Kos not found in archive or not deleted yet', undefined, { status: 404 });
    }

    // Permanently delete the post then kos
    await db.delete(posts).where(eq(posts.id, existingKos[0].postId));
    await db.delete(kos).where(eq(kos.id, kosId));

    return ok('Kos permanently deleted successfully', { kosId });
  } catch (error) {
    console.error('Permanent delete kos error:', error);
    return fail('internal_error', 'Failed to permanently delete kos', undefined, { status: 500 });
  }
}

export const DELETE = withAdmin(permanentDeleteKosHandler);
