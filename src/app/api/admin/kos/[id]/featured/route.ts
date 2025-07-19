import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db, kos, posts } from '@/db';
import { eq } from 'drizzle-orm';

interface RouteContext {
  params: {
    id: string;
  };
}

async function toggleFeaturedHandler(request: AuthenticatedRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const kosId = parseInt(id);

    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isFeatured } = body;

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isFeatured must be a boolean' },
        { status: 400 }
      );
    }

    // Check if kos exists
    const existingKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
      })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);

    if (existingKos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Update featured status in posts table
    await db
      .update(posts)
      .set({
        isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, existingKos[0].postId));

    return NextResponse.json({
      success: true,
      message: `Kos ${isFeatured ? 'added to' : 'removed from'} featured successfully`,
      data: {
        kosId,
        isFeatured,
      },
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const authenticatedRequest = request as AuthenticatedRequest;
  
  return withAdmin(async (req: AuthenticatedRequest) => {
    return toggleFeaturedHandler(req, { params });
  })(authenticatedRequest);
}
