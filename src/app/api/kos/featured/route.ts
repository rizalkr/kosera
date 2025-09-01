import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

const querySchema = z.object({ limit: z.string().regex(/^\d+$/).optional() });

interface FeaturedOwner { id: number; name: string; username: string; contact: string }
interface FeaturedKos {
  id: number; postId: number; name: string; address: string; city: string; facilities: string | null; latitude: number | null; longitude: number | null;
  title: string; description: string; price: number; isFeatured: boolean; viewCount: number; favoriteCount: number; averageRating: string; reviewCount: number; photoCount: number; createdAt: Date; updatedAt: Date;
  owner: FeaturedOwner;
}

/**
 * GET /api/kos/featured
 * Returns a randomized list of featured kos limited by ?limit (default 5, max 20).
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) return fail('validation_error', 'Invalid query parameters', parsed.error.flatten(), { status: 400 });

    const limit = parsed.data.limit ? parseInt(parsed.data.limit, 10) : 5;
    if (limit < 1 || limit > 20) return fail('invalid_pagination', 'Limit must be between 1-20', undefined, { status: 400 });

    const featuredKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        latitude: kos.latitude,
        longitude: kos.longitude,
        title: posts.title,
        description: posts.description,
        price: posts.price,
        isFeatured: posts.isFeatured,
        viewCount: posts.viewCount,
        favoriteCount: posts.favoriteCount,
        averageRating: posts.averageRating,
        reviewCount: posts.reviewCount,
        photoCount: posts.photoCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        owner: { id: users.id, name: users.name, username: users.username, contact: users.contact },
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.isFeatured, true))
      .orderBy(sql`RANDOM()`) // Random order for variety
      .limit(limit);

    return ok('Featured kos retrieved successfully', { items: featuredKos as unknown as FeaturedKos[], count: featuredKos.length });
  } catch (error) {
    console.error('featured.GET error', error);
    return fail('internal_error', 'Failed to retrieve featured kos', undefined, { status: 500 });
  }
}
