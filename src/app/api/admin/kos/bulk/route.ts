import { NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { inArray, eq, and, isNull, isNotNull } from 'drizzle-orm';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';

// Bulk archive - soft delete multiple kos
async function bulkArchiveHandler(request: AuthenticatedRequest) {
  try {
    const { kosIds }: { kosIds: number[] } = await request.json();

    if (!kosIds || !Array.isArray(kosIds) || kosIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'kosIds array is required' },
        { status: 400 }
      );
    }

    const adminUserId = request.user!.userId;
    const now = new Date();

    // Get kos data to also update associated posts
    const kosData = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(
        and(
          inArray(kos.id, kosIds),
          isNull(kos.deletedAt) // Only archive active kos
        )
      );

    if (kosData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active kos found with provided IDs' },
        { status: 404 }
      );
    }

    const kosIdsToArchive = kosData.map(k => k.id);
    const postIdsToArchive = kosData.map(k => k.postId);

    // Archive kos records
    await db
      .update(kos)
      .set({
        deletedAt: now,
        deletedBy: adminUserId,
      })
      .where(inArray(kos.id, kosIdsToArchive));

    // Archive associated posts
    await db
      .update(posts)
      .set({
        deletedAt: now,
        deletedBy: adminUserId,
      })
      .where(inArray(posts.id, postIdsToArchive));

    return NextResponse.json({
      success: true,
      message: `Successfully archived ${kosIdsToArchive.length} kos`,
      archivedCount: kosIdsToArchive.length
    });

  } catch (error) {
    console.error('Bulk archive error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk permanent delete - permanently delete multiple archived kos
async function bulkPermanentDeleteHandler(request: AuthenticatedRequest) {
  try {
    const { kosIds }: { kosIds: number[] } = await request.json();

    if (!kosIds || !Array.isArray(kosIds) || kosIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'kosIds array is required' },
        { status: 400 }
      );
    }

    // Get kos data to also delete associated posts
    const kosData = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(
        and(
          inArray(kos.id, kosIds),
          isNotNull(kos.deletedAt) // Only delete archived kos
        )
      );

    if (kosData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No archived kos found with provided IDs' },
        { status: 404 }
      );
    }

    const kosIdsToDelete = kosData.map(k => k.id);
    const postIdsToDelete = kosData.map(k => k.postId);

    // Delete kos records
    await db.delete(kos).where(inArray(kos.id, kosIdsToDelete));

    // Delete associated posts
    await db.delete(posts).where(inArray(posts.id, postIdsToDelete));

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${kosIdsToDelete.length} kos permanently`,
      deletedCount: kosIdsToDelete.length
    });

  } catch (error) {
    console.error('Bulk permanent delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Route handlers
export const POST = withAdmin(bulkArchiveHandler);
export const DELETE = withAdmin(bulkPermanentDeleteHandler);
