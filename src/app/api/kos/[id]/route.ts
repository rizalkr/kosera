import { NextRequest, NextResponse } from 'next/server';
import { withSellerOrAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts, users, reviews } from '@/db/schema';
import { eq, and, desc, count, avg, sql } from 'drizzle-orm';

// GET /api/kos/[id] - Get specific kos by ID with reviews and statistics (public)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const kosId = parseInt(id);

    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    // Get kos data with owner information
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
        // Post data
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
        // Owner data
        owner: {
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
        },
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(kos.id, kosId))
      .limit(1)
      .execute();

    if (kosResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Get reviews with pagination (default limit 20)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    // Fetch reviews, review statistics, and total count in parallel
    const [reviewsData, reviewStats, totalReviewsCount] = await Promise.all([
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

      db
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.kosId, kosId))
    ]);

    const totalReviews = totalReviewsCount[0]?.count || 0;
    const totalPages = Math.ceil(totalReviews / limit);

    // Combine all data
    const kosData = {
      ...kosResult[0],
      reviews: {
        data: reviewsData,
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
    };

    return NextResponse.json({
      success: true,
      message: 'Kos retrieved successfully',
      data: kosData
    });

  } catch (error) {
    console.error('Error retrieving kos:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve kos' },
      { status: 500 }
    );
  }
}

// PUT /api/kos/[id] - Update specific kos (SELLER/ADMIN only)
async function updateKosHandler(request: AuthenticatedRequest, kosId: number) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      name,
      address,
      city,
      facilities,
      totalRooms,
      occupiedRooms,
      latitude,
      longitude
    } = body;

    // Validate required fields
    if (!title || !description || !price || !name || !address || !city || !facilities || !totalRooms) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price and totalRooms
    if (price <= 0 || totalRooms <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price and total rooms must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate occupiedRooms if provided
    if (occupiedRooms !== undefined && occupiedRooms !== null) {
      if (occupiedRooms < 0 || occupiedRooms > totalRooms) {
        return NextResponse.json(
          { success: false, error: 'Occupied rooms must be between 0 and total rooms' },
          { status: 400 }
        );
      }
    }

    // Check if kos exists and belongs to the user
    const existingKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        ownerId: posts.userId
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (existingKos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Check if user owns the kos (unless admin)
    if (request.user?.role !== 'ADMIN' && existingKos[0].ownerId !== request.user?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this kos' },
        { status: 403 }
      );
    }

    // Update kos table
    await db
      .update(kos)
      .set({
        name,
        address,
        city,
        facilities,
        totalRooms,
        occupiedRooms: occupiedRooms || null,
        latitude: latitude || null,
        longitude: longitude || null
      })
      .where(eq(kos.id, kosId))
      .execute();

    // Update posts table
    await db
      .update(posts)
      .set({
        title,
        description,
        price,
        updatedAt: new Date()
      })
      .where(eq(posts.id, existingKos[0].postId))
      .execute();

    // Fetch updated kos data
    const updatedKos = await db
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
        updatedAt: posts.updatedAt
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Kos updated successfully',
      data: updatedKos[0]
    });

  } catch (error) {
    console.error('Error updating kos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update kos' },
      { status: 500 }
    );
  }
}

export const PUT = withSellerOrAdmin(async (request: AuthenticatedRequest) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const kosId = parseInt(pathParts[pathParts.length - 1]);
  
  if (isNaN(kosId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid kos ID' },
      { status: 400 }
    );
  }

  return updateKosHandler(request, kosId);
});

// DELETE /api/kos/[id] - Delete specific kos (SELLER/ADMIN only)
async function deleteKosHandler(request: AuthenticatedRequest, kosId: number) {
  try {
    // Check if kos exists and get post info
    const existingKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        userId: posts.userId,
        name: kos.name
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1)
      .execute();

    if (existingKos.length === 0) {
      return NextResponse.json(
        { error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Check ownership (user can only delete their own kos, admin can delete any)
    if (request.user!.role !== 'ADMIN' && existingKos[0].userId !== request.user!.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own kos' },
        { status: 403 }
      );
    }

    // Delete kos (this will cascade delete the post due to foreign key constraint)
    await db
      .delete(kos)
      .where(eq(kos.id, kosId))
      .execute();

    // Also delete the associated post
    await db
      .delete(posts)
      .where(eq(posts.id, existingKos[0].postId))
      .execute();

    return NextResponse.json({
      message: `Kos "${existingKos[0].name}" deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting kos:', error);
    return NextResponse.json(
      { error: 'Failed to delete kos' },
      { status: 500 }
    );
  }
}

export const DELETE = withSellerOrAdmin(async (request: AuthenticatedRequest) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const kosId = parseInt(pathParts[pathParts.length - 1]);
  
  if (isNaN(kosId)) {
    return NextResponse.json(
      { error: 'Invalid kos ID' },
      { status: 400 }
    );
  }

  return deleteKosHandler(request, kosId);
});
