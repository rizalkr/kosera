import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { sql, inArray } from 'drizzle-orm';

// Bulk cleanup - permanently delete all archived kos
async function bulkCleanupHandler(request: AuthenticatedRequest) {
  try {
    // Get all deleted kos
    const deletedKos = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(sql`${kos.deletedAt} IS NOT NULL`);

    if (deletedKos.length === 0) {
      return NextResponse.json({
        message: 'No archived kos found to cleanup',
        deletedCount: 0,
      });
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

    return NextResponse.json({
      message: 'All archived kos have been permanently deleted',
      deletedCount: deletedKos.length,
    });
  } catch (error) {
    console.error('Bulk cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = withAdmin(bulkCleanupHandler);
