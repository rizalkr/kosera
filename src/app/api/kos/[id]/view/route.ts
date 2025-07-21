import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// In-memory cache to prevent duplicate view counts (simple rate limiting)
const viewCache = new Map<string, number>();
const CACHE_DURATION = 60000; // 1 minute in milliseconds

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

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const cacheKey = `${clientIP}-${kosId}`;
    const now = Date.now();
    
    // Check if this IP already viewed this kos recently
    if (viewCache.has(cacheKey)) {
      const lastView = viewCache.get(cacheKey)!;
      if (now - lastView < CACHE_DURATION) {
        // Return success but don't increment count
        return NextResponse.json({
          success: true,
          message: 'View already counted recently',
          data: { kosId, cached: true },
        });
      }
    }

    // Update cache
    viewCache.set(cacheKey, now);
    
    // Clean old cache entries (simple cleanup)
    if (viewCache.size > 1000) {
      const oldEntries = Array.from(viewCache.entries())
        .filter(([, timestamp]) => now - timestamp > CACHE_DURATION);
      oldEntries.forEach(([key]) => viewCache.delete(key));
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
