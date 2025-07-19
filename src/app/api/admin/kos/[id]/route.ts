import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq, sql, isNull } from 'drizzle-orm';

interface RouteContext {
  params: {
    id: string;
  };
}

// Soft delete kos (move to archive)
async function deleteKosHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const kosId = parseInt(pathSegments[pathSegments.length - 1]);
    const currentUserId = request.user?.userId;

    if (isNaN(kosId)) {
      return NextResponse.json(
        { error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // Check if kos exists and not already deleted
    const existingKos = await db
      .select()
      .from(kos)
      .where(sql`${kos.id} = ${kosId} AND ${kos.deletedAt} IS NULL`)
      .limit(1);

    if (existingKos.length === 0) {
      return NextResponse.json(
        { error: 'Kos not found or already deleted' },
        { status: 404 }
      );
    }

    // Soft delete kos
    await db
      .update(kos)
      .set({
        deletedAt: new Date(),
        deletedBy: currentUserId,
      })
      .where(eq(kos.id, kosId));

    // Also soft delete the related post
    await db
      .update(posts)
      .set({
        deletedAt: new Date(),
        deletedBy: currentUserId,
      })
      .where(eq(posts.id, existingKos[0].postId));

    return NextResponse.json({
      message: 'Kos moved to archive successfully',
    });
  } catch (error) {
    console.error('Soft delete kos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = withAdmin(deleteKosHandler);
