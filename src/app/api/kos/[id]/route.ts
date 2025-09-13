import { withSellerOrAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts, users, reviews } from '@/db/schema';
import { eq, desc, count, avg, sql } from 'drizzle-orm';
import { ok, fail } from '@/types/api';
import { z } from 'zod';

// GET /api/kos/[id] - Get specific kos by ID with reviews and statistics (public)
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const idSchema = z.coerce.number().int().positive();
    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return fail('invalid_id', 'Invalid kos ID', parsedId.error.format(), { status: 400 });
    }
    const kosId = parsedId.data;
    const kosResult = await db
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
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosResult.length === 0) return fail('not_found', 'Kos not found', undefined, { status: 404 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    // Fetch reviews, review statistics, and total count in parallel
    const [reviewsData, reviewStats, totalReviewsCount] = await Promise.all([
      db
        .select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt, updatedAt: reviews.updatedAt, user: { id: users.id, name: users.name, username: users.username } })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.kosId, kosId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({
          averageRating: avg(reviews.rating),
          totalReviews: count(),
          ratingDistribution: sql<Record<string, number>>`json_build_object('5', count(case when rating = 5 then 1 end),'4', count(case when rating = 4 then 1 end),'3', count(case when rating = 3 then 1 end),'2', count(case when rating = 2 then 1 end),'1', count(case when rating = 1 then 1 end))`,
        })
        .from(reviews)
        .where(eq(reviews.kosId, kosId)),

      db.select({ count: count() }).from(reviews).where(eq(reviews.kosId, kosId)),
    ]);

    const totalReviews = totalReviewsCount[0]?.count || 0;
    const totalPages = Math.ceil(totalReviews / limit) || 1;

    return ok('Kos retrieved successfully', {
      ...kosResult[0],
      reviews: {
        data: reviewsData,
        statistics: reviewStats[0] || { averageRating: 0, totalReviews: 0, ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } },
        pagination: { page, limit, totalReviews, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      },
    });
  } catch (error) {
    console.error('Error retrieving kos:', error);
    return fail('internal_error', 'Failed to retrieve kos', undefined, { status: 500 });
  }
}

// PUT /api/kos/[id] - Update specific kos (SELLER/ADMIN only)
const updateKosSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  facilities: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  totalRooms: z.coerce.number().int().positive(),
  occupiedRooms: z.coerce.number().int().min(0).optional(),
  latitude: z.coerce.number().finite().optional().nullable(),
  longitude: z.coerce.number().finite().optional().nullable(),
});

async function updateKosHandler(request: AuthenticatedRequest, kosId: number) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = updateKosSchema.safeParse(json);
    if (!parsed.success) {
      return fail('validation_error', 'Invalid input', parsed.error.flatten(), { status: 400 });
    }
    const { title, description, price, name, address, city, facilities, totalRooms, occupiedRooms, latitude, longitude } = parsed.data;

    if (occupiedRooms !== undefined && occupiedRooms > totalRooms) {
      return fail('validation_error', 'Occupied rooms cannot exceed total rooms', undefined, { status: 400 });
    }

    const existingKos = await db
      .select({ id: kos.id, postId: kos.postId, ownerId: posts.userId })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (existingKos.length === 0) {
      return fail('not_found', 'Kos not found', undefined, { status: 404 });
    }

    if (request.user?.role !== 'ADMIN' && existingKos[0].ownerId !== request.user?.userId) {
      return fail('forbidden', 'Unauthorized to update this kos', undefined, { status: 403 });
    }

    const facilitiesValue: string | null = facilities == null ? null : Array.isArray(facilities) ? facilities.join(',') : facilities;

    await db
      .update(kos)
      .set({ name, address, city, facilities: facilitiesValue, totalRooms, occupiedRooms: occupiedRooms ?? null, latitude: latitude ?? null, longitude: longitude ?? null })
      .where(eq(kos.id, kosId));

    await db
      .update(posts)
      .set({ title, description, price, updatedAt: new Date() })
      .where(eq(posts.id, existingKos[0].postId));

    const updated = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        totalRooms: kos.totalRooms,
        occupiedRooms: kos.occupiedRooms,
        latitude: kos.latitude,
        longitude: kos.longitude,
        title: posts.title,
        description: posts.description,
        price: posts.price,
        updatedAt: posts.updatedAt,
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    return ok('Kos updated successfully', { kos: updated[0] });
  } catch (error) {
    console.error('kos.update error', error);
    return fail('internal_error', 'Failed to update kos', undefined, { status: 500 });
  }
}

export const PUT = withSellerOrAdmin(async (request: AuthenticatedRequest) => {
  const url = new URL(request.url);
  const idPart = url.pathname.split('/').pop();
  const kosId = Number.parseInt(idPart || '', 10);
  if (Number.isNaN(kosId)) return fail('invalid_id', 'Invalid kos ID', undefined, { status: 400 });
  return updateKosHandler(request, kosId);
});

// DELETE /api/kos/[id] - Delete specific kos (SELLER/ADMIN only)
async function deleteKosHandler(request: AuthenticatedRequest, kosId: number) {
  try {
    const existingKos = await db
      .select({ id: kos.id, postId: kos.postId, userId: posts.userId, name: kos.name })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (existingKos.length === 0) return fail('not_found', 'Kos not found', undefined, { status: 404 });

    if (request.user!.role !== 'ADMIN' && existingKos[0].userId !== request.user!.userId) {
      return fail('forbidden', 'You can only delete your own kos', undefined, { status: 403 });
    }

    await db.delete(kos).where(eq(kos.id, kosId));
    await db.delete(posts).where(eq(posts.id, existingKos[0].postId));

    return ok('Kos deleted successfully', { name: existingKos[0].name });
  } catch (error) {
    console.error('kos.delete error', error);
    return fail('internal_error', 'Failed to delete kos', undefined, { status: 500 });
  }
}

export const DELETE = withSellerOrAdmin(async (request: AuthenticatedRequest) => {
  const url = new URL(request.url);
  const idPart = url.pathname.split('/').pop();
  const kosId = Number.parseInt(idPart || '', 10);
  if (Number.isNaN(kosId)) return fail('invalid_id', 'Invalid kos ID', undefined, { status: 400 });
  return deleteKosHandler(request, kosId);
});
