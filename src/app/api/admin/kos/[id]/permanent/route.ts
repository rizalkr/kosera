import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq, sql } from 'drizzle-orm';

// Permanent delete kos (only allowed for archived kos)
async function permanentDeleteKosHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const kosId = parseInt(pathSegments[pathSegments.length - 2]); // /permanent is the last segment

    if (isNaN(kosId)) {
      return NextResponse.json(
        { error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // Check if kos exists and is already deleted (in archive)
    const existingKos = await db
      .select()
      .from(kos)
      .where(sql`${kos.id} = ${kosId} AND ${kos.deletedAt} IS NOT NULL`)
      .limit(1);

    if (existingKos.length === 0) {
      return NextResponse.json(
        { error: 'Kos not found in archive or not deleted yet' },
        { status: 404 }
      );
    }

    // Permanently delete the post first (cascade will handle related data)
    await db
      .delete(posts)
      .where(eq(posts.id, existingKos[0].postId));

    // Permanently delete the kos
    await db
      .delete(kos)
      .where(eq(kos.id, kosId));

    return NextResponse.json({
      message: 'Kos permanently deleted successfully',
      deletedKosId: kosId,
    });
  } catch (error) {
    console.error('Permanent delete kos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = withAdmin(permanentDeleteKosHandler);
