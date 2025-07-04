import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kosId = parseInt(id);

    // Validate kos ID
    if (isNaN(kosId) || kosId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // Check if kos exists and get the post ID
    const kosData = await db
      .select({
        id: kos.id,
        postId: kos.postId,
      })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    const { postId } = kosData[0];

    // Increment view count using SQL to ensure atomicity
    const updatedPost = await db
      .update(posts)
      .set({
        viewCount: sql`${posts.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning({
        id: posts.id,
        viewCount: posts.viewCount,
      });

    if (updatedPost.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update view count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'View count updated successfully',
      data: {
        kosId,
        postId,
        view_count: updatedPost[0].viewCount,
      },
    });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update view count' },
      { status: 500 }
    );
  }
}
