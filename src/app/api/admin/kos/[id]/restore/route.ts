import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

// Restore kos from archive
async function restoreKosHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const kosIdRaw = pathSegments[pathSegments.length - 2]; // /restore is the last segment
    const idSchema = z.coerce.number().int().positive();
    const parsed = idSchema.safeParse(kosIdRaw);
    if (!parsed.success) {
      return fail(
        'invalid_id',
        'Invalid kos ID',
        parsed.error.format(),
        { status: 400 }
      );
    }
    const kosId = parsed.data;

    // Check if kos exists and is deleted (in archive)
    const existingKos = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(sql`${kos.id} = ${kosId} AND ${kos.deletedAt} IS NOT NULL`)
      .limit(1);

    if (existingKos.length === 0) {
      return fail(
        'not_found',
        'Kos not found in archive',
        undefined,
        { status: 404 }
      );
    }

    // Restore kos & post
    await db
      .update(kos)
      .set({ deletedAt: null, deletedBy: null })
      .where(eq(kos.id, kosId));
    await db
      .update(posts)
      .set({ deletedAt: null, deletedBy: null })
      .where(eq(posts.id, existingKos[0].postId));

    return ok('Kos restored from archive successfully', { kosId });
  } catch (error) {
    console.error('Restore kos error:', error);
    return fail(
      'internal_error',
      'Failed to restore kos',
      undefined,
      { status: 500 }
    );
  }
}

export const PATCH = withAdmin(restoreKosHandler);
