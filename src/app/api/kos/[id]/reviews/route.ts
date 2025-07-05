import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { reviews, kos, posts, users } from '@/db/schema';
import { eq, desc, count, avg, sql, and } from 'drizzle-orm';
import { z } from 'zod';

// Schema for review creation
const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

// GET /api/kos/[id]/reviews - Get reviews for a kos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    const kosId = parseInt(id);
    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // Check if kos exists
    const kosExists = await db
      .select({ id: kos.id })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Get reviews with pagination
    const [reviewsData, reviewsCount, reviewStats] = await Promise.all([
      db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
          },
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.kosId, kosId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.kosId, kosId)),

      db
        .select({
          averageRating: avg(reviews.rating),
          totalReviews: count(),
          ratingDistribution: sql<Record<string, number>>`
            json_build_object(
              '5', count(case when rating = 5 then 1 end),
              '4', count(case when rating = 4 then 1 end),
              '3', count(case when rating = 3 then 1 end),
              '2', count(case when rating = 2 then 1 end),
              '1', count(case when rating = 1 then 1 end)
            )
          `,
        })
        .from(reviews)
        .where(eq(reviews.kosId, kosId)),
    ]);

    const totalReviews = reviewsCount[0]?.count || 0;
    const totalPages = Math.ceil(totalReviews / limit);

    return NextResponse.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews: reviewsData,
        statistics: reviewStats[0] || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        },
        pagination: {
          page,
          limit,
          totalReviews,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Error retrieving reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve reviews' },
      { status: 500 }
    );
  }
}

// POST /api/kos/[id]/reviews - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Create authenticated request manually for this endpoint
  const authenticatedRequest = request as AuthenticatedRequest;
  
  // Extract and verify token
  const { extractTokenFromHeader, verifyToken } = await import('@/lib/auth');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  authenticatedRequest.user = payload;

  try {
    const { id } = await params;
    const kosId = parseInt(id);
    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Check if kos exists
    const kosExists = await db
      .select({ id: kos.id })
      .from(kos)
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this kos
    const existingReview = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(
        eq(reviews.kosId, kosId),
        eq(reviews.userId, payload.userId)
      ))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this kos' },
        { status: 409 }
      );
    }

    // Create review
    const [newReview] = await db
      .insert(reviews)
      .values({
        kosId,
        userId: payload.userId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      })
      .returning();

    // Update post statistics
    const stats = await db
      .select({
        averageRating: avg(reviews.rating),
        reviewCount: count(),
      })
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

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      data: { review: newReview },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
