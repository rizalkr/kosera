import { NextRequest, NextResponse } from 'next/server';
import { withSellerOrAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/kos/my - Get kos owned by current user (SELLER/ADMIN only)
export const GET = withSellerOrAdmin(async (request: AuthenticatedRequest) => {
  try {
    const result = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        name: kos.name,
        address: kos.address,
        city: kos.city,
        facilities: kos.facilities,
        price: posts.price,
        title: posts.title,
        description: posts.description,
        totalPost: posts.totalPost,
        totalPenjualan: posts.totalPenjualan,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(posts.userId, request.user!.userId))
      .execute();

    return NextResponse.json({
      message: 'Your kos retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error retrieving user kos:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve your kos' },
      { status: 500 }
    );
  }
});
