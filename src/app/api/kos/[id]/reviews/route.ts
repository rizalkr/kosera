import { db } from '@/db';
import { reviews, kos, posts, users } from '@/db/schema';
import { eq, desc, count, avg, sql, and } from 'drizzle-orm';
import { z } from 'zod';
import { ok, fail } from '@/types/api';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// Schema for review creation
const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

interface RatingDistribution {
  [key: string]: number;
}

interface ReviewStats {
  averageRating: string | number | null;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

// GET /api/kos/[id]/reviews - Get reviews for a kos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '10';
    const page = Math.max(1, parseInt(pageParam, 10));
    const limit = Math.min(50, Math.max(1, parseInt(limitParam, 10)));
    const offset = (page - 1) * limit;

    const kosId = parseInt(id, 10);
    if (Number.isNaN(kosId)) {
      return fail('invalid_kos_id', 'Invalid kos ID', undefined, { status: 400 });
    }

    const kosExists = await db.select({ id: kos.id }).from(kos).where(eq(kos.id, kosId)).limit(1);
    if (kosExists.length === 0) {
      return fail('kos_not_found', 'Kos not found', undefined, { status: 404 });
    }

    const [reviewsData, reviewsCount, reviewStats] = await Promise.all([
      db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          user: { id: users.id, name: users.name, username: users.username },
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.kosId, kosId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() }).from(reviews).where(eq(reviews.kosId, kosId)),

      db
        .select({
          averageRating: avg(reviews.rating),
          totalReviews: count(),
          ratingDistribution: sql<Record<string, number>>`json_build_object( '5', count(case when rating = 5 then 1 end), '4', count(case when rating = 4 then 1 end), '3', count(case when rating = 3 then 1 end), '2', count(case when rating = 2 then 1 end), '1', count(case when rating = 1 then 1 end) )`,
        })
        .from(reviews)
        .where(eq(reviews.kosId, kosId)),
    ]);

    const totalReviews = reviewsCount[0]?.count || 0;
    const totalPages = Math.ceil(totalReviews / limit);

    const stats: ReviewStats = reviewStats[0] || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
    };

    return ok('Reviews retrieved successfully', {
      reviews: reviewsData,
      statistics: stats,
      pagination: {
        page,
        limit,
        totalReviews,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    return fail('reviews_retrieve_failed', 'Failed to retrieve reviews', undefined, { status: 500 });
  }
}

// POST /api/kos/[id]/reviews - Create a new review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return fail('unauthorized', 'Authentication required', undefined, { status: 401 });
  }

  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return fail('unauthorized', 'Authentication required', undefined, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return fail('invalid_token', 'Invalid or expired token', undefined, { status: 401 });
  }

  try {
    const { id } = await params;
    const kosId = parseInt(id, 10);
    if (Number.isNaN(kosId)) {
      return fail('invalid_kos_id', 'Invalid kos ID', undefined, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail('invalid_json', 'Invalid JSON body', undefined, { status: 400 });
    }

    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return fail('validation_error', 'Invalid input data', parsed.error.flatten(), { status: 400 });
    }

    const kosExists = await db.select({ id: kos.id }).from(kos).where(eq(kos.id, kosId)).limit(1);
    if (kosExists.length === 0) {
      return fail('kos_not_found', 'Kos not found', undefined, { status: 404 });
    }

    const existingReview = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.kosId, kosId), eq(reviews.userId, payload.userId)))
      .limit(1);

    if (existingReview.length > 0) {
      return fail('duplicate_review', 'You have already reviewed this kos', undefined, { status: 409 });
    }

    const [newReview] = await db
      .insert(reviews)
      .values({ kosId, userId: payload.userId, rating: parsed.data.rating, comment: parsed.data.comment })
      .returning();

    const stats = await db
      .select({ averageRating: avg(reviews.rating), reviewCount: count() })
      .from(reviews)
      .where(eq(reviews.kosId, kosId));

    const postToUpdate = await db
      .select({ id: posts.id })
      .from(posts)
      .innerJoin(kos, eq(posts.id, kos.postId))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (postToUpdate.length > 0) {
      await db
        .update(posts)
        .set({
          averageRating: stats[0]?.averageRating?.toString() || '0.0',
          reviewCount: stats[0]?.reviewCount || 0,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postToUpdate[0].id));
    }

    return ok('Review created successfully', { review: newReview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail('validation_error', 'Invalid input data', error.flatten(), { status: 400 });
    }
    console.error('Error creating review:', error);
    return fail('review_create_failed', 'Failed to create review', undefined, { status: 500 });
  }
}

// TODO: Add PUT/PATCH for updating a review and DELETE for removing a review (requires ownership check).
