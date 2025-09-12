import { db } from '@/db';
import { favorites, kos, posts, users } from '@/db/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { ok, fail } from '@/types/api';
import { parsePagination, buildPaginationMeta } from '@/lib/pagination';
import { z } from 'zod';
import { ERROR_CODES } from '@/types/error-codes';

// GET /api/user/favorites - Get user's favorite kos
export async function GET(request: Request) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) return fail(ERROR_CODES.unauthorized, 'Authentication required', undefined, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return fail(ERROR_CODES.invalid_token, 'Invalid or expired token', undefined, { status: 401 });

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams, { limit: 10 });

    const favoriteKos = await db
      .select({
        id: favorites.id,
        createdAt: favorites.createdAt,
        kos: { id: kos.id, name: kos.name, address: kos.address, city: kos.city, facilities: kos.facilities, latitude: kos.latitude, longitude: kos.longitude },
        post: { id: posts.id, title: posts.title, description: posts.description, price: posts.price, averageRating: posts.averageRating, reviewCount: posts.reviewCount, viewCount: posts.viewCount, photoCount: posts.photoCount, isFeatured: posts.isFeatured },
        owner: { id: users.id, name: users.name, username: users.username, contact: users.contact },
      })
      .from(favorites)
      .innerJoin(kos, eq(favorites.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(favorites.userId, payload.userId))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ value: count() })
      .from(favorites)
      .where(eq(favorites.userId, payload.userId));
    const total = totalResult[0]?.value || 0;

    return ok('Favorites retrieved successfully', {
      favorites: favoriteKos,
      pagination: buildPaginationMeta({ page, limit, total }),
    });
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    return fail(ERROR_CODES.internal_error, 'Failed to retrieve favorites', undefined, { status: 500 });
  }
}

const favoriteBodySchema = z.object({ kosId: z.coerce.number().int().positive({ message: 'kosId must be a positive integer' }) });

export async function POST(request: Request) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) return fail(ERROR_CODES.unauthorized, 'Authentication required', undefined, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return fail(ERROR_CODES.invalid_token, 'Invalid or expired token', undefined, { status: 401 });

    const json = await request.json().catch(() => ({}));
    const parsed = favoriteBodySchema.safeParse(json);
    if (!parsed.success) return fail(ERROR_CODES.validation_error, 'Valid kos ID is required', parsed.error.format(), { status: 400 });
    const kosId = parsed.data.kosId;

    const kosExists = await db.select({ id: kos.id }).from(kos).where(eq(kos.id, kosId)).limit(1);
    if (kosExists.length === 0) return fail(ERROR_CODES.not_found, 'Kos not found', undefined, { status: 404 });

    const existingFavorite = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(and(eq(favorites.userId, payload.userId), eq(favorites.kosId, kosId)))
      .limit(1);
    if (existingFavorite.length > 0) return fail(ERROR_CODES.conflict, 'Kos is already in favorites', undefined, { status: 409 });

    const [newFavorite] = await db.insert(favorites).values({ userId: payload.userId, kosId }).returning();

    const postToUpdate = await db
      .select({ id: posts.id })
      .from(posts)
      .innerJoin(kos, eq(posts.id, kos.postId))
      .where(eq(kos.id, kosId))
      .limit(1);
    if (postToUpdate.length > 0) {
      await db.update(posts).set({ favoriteCount: sql`${posts.favoriteCount} + 1`, updatedAt: new Date() }).where(eq(posts.id, postToUpdate[0].id));
    }

    return ok('Kos added to favorites successfully', { favorite: newFavorite });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return fail(ERROR_CODES.internal_error, 'Failed to add to favorites', undefined, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) return fail(ERROR_CODES.unauthorized, 'Authentication required', undefined, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return fail(ERROR_CODES.invalid_token, 'Invalid or expired token', undefined, { status: 401 });

    const json = await request.json().catch(() => ({}));
    const parsed = favoriteBodySchema.safeParse(json);
    if (!parsed.success) return fail(ERROR_CODES.validation_error, 'Valid kos ID is required', parsed.error.format(), { status: 400 });
    const kosId = parsed.data.kosId;

    const deletedFavorite = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, payload.userId), eq(favorites.kosId, kosId)))
      .returning();
    if (deletedFavorite.length === 0) return fail(ERROR_CODES.not_found, 'Favorite not found', undefined, { status: 404 });

    const postToUpdate = await db
      .select({ id: posts.id })
      .from(posts)
      .innerJoin(kos, eq(posts.id, kos.postId))
      .where(eq(kos.id, kosId))
      .limit(1);
    if (postToUpdate.length > 0) {
      await db
        .update(posts)
        .set({ favoriteCount: sql`GREATEST(0, ${posts.favoriteCount} - 1)`, updatedAt: new Date() })
        .where(eq(posts.id, postToUpdate[0].id));
    }

    return ok('Kos removed from favorites successfully', { kosId });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return fail(ERROR_CODES.internal_error, 'Failed to remove from favorites', undefined, { status: 500 });
  }
}
