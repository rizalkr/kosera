import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { inArray, and, isNull, isNotNull } from 'drizzle-orm';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { ok, fail } from '@/types/api';

// Bulk archive - soft delete multiple kos
async function bulkArchiveHandler(request: AuthenticatedRequest) {
  try {
    const { kosIds }: { kosIds: number[] } = await request.json();

    if (!kosIds || !Array.isArray(kosIds) || kosIds.length === 0) {
      return fail('validation_error', 'kosIds array is required', undefined, { status: 400 });
    }

    const adminUserId = request.user!.userId;
    const now = new Date();

    // Get kos data to also update associated posts
    const kosData = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(and(inArray(kos.id, kosIds), isNull(kos.deletedAt)));

    if (kosData.length === 0) {
      return fail('not_found', 'No active kos found with provided IDs', undefined, { status: 404 });
    }

    const kosIdsToArchive = kosData.map(k => k.id);
    const postIdsToArchive = kosData.map(k => k.postId);

    // Archive kos records
    await db
      .update(kos)
      .set({ deletedAt: now, deletedBy: adminUserId })
      .where(inArray(kos.id, kosIdsToArchive));

    // Archive associated posts
    await db
      .update(posts)
      .set({ deletedAt: now, deletedBy: adminUserId })
      .where(inArray(posts.id, postIdsToArchive));

    return ok('Successfully archived kos', { archivedCount: kosIdsToArchive.length, kosIds: kosIdsToArchive });

  } catch (error) {
    console.error('Bulk archive error:', error);
    return fail('internal_error', 'Failed to archive kos', undefined, { status: 500 });
  }
}

// Bulk permanent delete - permanently delete multiple archived kos
async function bulkPermanentDeleteHandler(request: AuthenticatedRequest) {
  try {
    const { kosIds }: { kosIds: number[] } = await request.json();

    if (!kosIds || !Array.isArray(kosIds) || kosIds.length === 0) {
      return fail('validation_error', 'kosIds array is required', undefined, { status: 400 });
    }

    // Get kos data to also delete associated posts
    const kosData = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(and(inArray(kos.id, kosIds), isNotNull(kos.deletedAt)));

    if (kosData.length === 0) {
      return fail('not_found', 'No archived kos found with provided IDs', undefined, { status: 404 });
    }

    const kosIdsToDelete = kosData.map(k => k.id);
    const postIdsToDelete = kosData.map(k => k.postId);

    // Delete kos records
    await db.delete(kos).where(inArray(kos.id, kosIdsToDelete));

    // Delete associated posts
    await db.delete(posts).where(inArray(posts.id, postIdsToDelete));

    return ok('Successfully permanently deleted kos', { deletedCount: kosIdsToDelete.length, kosIds: kosIdsToDelete });

  } catch (error) {
    console.error('Bulk permanent delete error:', error);
    return fail('internal_error', 'Failed to permanently delete kos', undefined, { status: 500 });
  }
}

// Route handlers
export const POST = withAdmin(bulkArchiveHandler);
export const DELETE = withAdmin(bulkPermanentDeleteHandler);
