import { withAdmin } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { sql, inArray } from 'drizzle-orm';
import { ok, fail } from '@/types/api';


// Bulk cleanup - permanently delete all archived kos
async function bulkCleanupHandler() {
  try {
    // Get all deleted kos
    const deletedKos = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(sql`${kos.deletedAt} IS NOT NULL`);

    if (deletedKos.length === 0) {
      return ok('No archived kos found to cleanup', { deletedCount: 0 });
    }

    // Get post IDs to delete
    const postIds = deletedKos.map(k => k.postId);

    // Permanently delete all related posts (cascade will handle related data)
    if (postIds.length > 0) {
      await db
        .delete(posts)
        .where(inArray(posts.id, postIds));
    }

    // Permanently delete all archived kos
    await db
      .delete(kos)
      .where(sql`${kos.deletedAt} IS NOT NULL`);

    return ok('All archived kos have been permanently deleted', { deletedCount: deletedKos.length });
  } catch (error) {
    console.error('Bulk cleanup error:', error);
    return fail('internal_error', 'Failed to cleanup archived kos', undefined, { status: 500 });
  }
}

export const DELETE = withAdmin(bulkCleanupHandler);
