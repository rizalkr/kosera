import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

// Soft delete kos (move to archive)
async function deleteKosHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const kosIdRaw = pathSegments[pathSegments.length - 1];
    const idSchema = z.coerce.number().int().positive();
    const parseResult = idSchema.safeParse(kosIdRaw);
    if (!parseResult.success) {
      return fail('invalid_id', 'Invalid kos ID', parseResult.error.format(), { status: 400 });
    }
    const kosId = parseResult.data;
    const currentUserId = request.user?.userId;

    // Check if kos exists and not already deleted
    const existingKos = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(sql`${kos.id} = ${kosId} AND ${kos.deletedAt} IS NULL`)
      .limit(1);

    if (existingKos.length === 0) {
      return fail('not_found', 'Kos not found or already deleted', undefined, { status: 404 });
    }

    const now = new Date();

    // Soft delete kos
    await db
      .update(kos)
      .set({
        deletedAt: now,
        deletedBy: currentUserId,
      })
      .where(eq(kos.id, kosId));

    // Also soft delete the related post
    await db
      .update(posts)
      .set({
        deletedAt: now,
        deletedBy: currentUserId,
      })
      .where(eq(posts.id, existingKos[0].postId));

    return ok('Kos moved to archive successfully', { kosId, archivedAt: now });
  } catch (error) {
    console.error('Soft delete kos error:', error);
    return fail('internal_error', 'Failed to archive kos', undefined, { status: 500 });
  }
}

export const DELETE = withAdmin(deleteKosHandler);
