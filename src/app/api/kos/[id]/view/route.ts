// Refactored to standardized JSON envelope (ok/fail) and Fetch API Request.
import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ok, fail } from '@/types/api';

// In-memory cache to prevent duplicate view counts (simple rate limiting)
const viewCache = new Map<string, number>();
const CACHE_DURATION_MS = 60_000; // 1 minute

interface ViewParams { id: string }

export async function POST(
  request: Request,
  { params }: { params: Promise<ViewParams> }
) {
  try {
    const { id } = await params;
    const kosId = parseInt(id, 10);

    if (Number.isNaN(kosId) || kosId <= 0) {
      return fail('invalid_kos_id', 'Invalid kos ID', undefined, { status: 400 });
    }

    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const cacheKey = `${clientIP}-${kosId}`;
    const now = Date.now();
    const lastView = viewCache.get(cacheKey);

    if (lastView && now - lastView < CACHE_DURATION_MS) {
      return ok('View already counted recently', { kosId, cached: true });
    }

    viewCache.set(cacheKey, now);

    if (viewCache.size > 1000) {
      for (const [key, timestamp] of viewCache.entries()) {
        if (now - timestamp > CACHE_DURATION_MS) viewCache.delete(key);
      }
    }

    const kosData = await db
      .select({ id: kos.id, postId: kos.postId })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosData.length === 0) {
      return fail('kos_not_found', 'Kos not found', undefined, { status: 404 });
    }

    const { postId } = kosData[0];

    const updatedPost = await db
      .update(posts)
      .set({ viewCount: sql`${posts.viewCount} + 1`, updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning({ id: posts.id, viewCount: posts.viewCount });

    if (updatedPost.length === 0) {
      return fail('update_failed', 'Failed to update view count', undefined, { status: 500 });
    }

    return ok('View count updated successfully', {
      kosId,
      postId,
      viewCount: updatedPost[0].viewCount,
    });
  } catch (error) {
    console.error('kos.view.POST error', error);
    return fail('internal_error', 'Failed to update view count', undefined, { status: 500 });
  }
}

// TODO: Replace in-memory cache with Redis for multi-instance deployments.
