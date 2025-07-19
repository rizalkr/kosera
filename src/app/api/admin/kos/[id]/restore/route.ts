import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq, sql } from 'drizzle-orm';

// Restore kos from archive
async function restoreKosHandler(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const kosId = parseInt(pathSegments[pathSegments.length - 2]); // /restore is the last segment

    if (isNaN(kosId)) {
      return NextResponse.json(
        { error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // Check if kos exists and is deleted (in archive)
    const existingKos = await db
      .select()
      .from(kos)
      .where(sql`${kos.id} = ${kosId} AND ${kos.deletedAt} IS NOT NULL`)
      .limit(1);

    if (existingKos.length === 0) {
      return NextResponse.json(
        { error: 'Kos not found in archive' },
        { status: 404 }
      );
    }

    // Restore kos
    await db
      .update(kos)
      .set({
        deletedAt: null,
        deletedBy: null,
      })
      .where(eq(kos.id, kosId));

    // Also restore the related post
    await db
      .update(posts)
      .set({
        deletedAt: null,
        deletedBy: null,
      })
      .where(eq(posts.id, existingKos[0].postId));

    return NextResponse.json({
      message: 'Kos restored from archive successfully',
      restoredKosId: kosId,
    });
  } catch (error) {
    console.error('Restore kos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PATCH = withAdmin(restoreKosHandler);
