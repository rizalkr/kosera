import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 5;

    // Validate limit parameter
    if (limitParam && (isNaN(limit) || limit < 1 || limit > 20)) {
      return NextResponse.json(
        { success: false, error: 'Invalid limit parameter. Limit must be between 1-20' },
        { status: 400 }
      );
    }

    // Get featured kos with random order
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
      .where(eq(posts.isFeatured, true))
      .orderBy(sql`RANDOM()`) // Random order for variety
      .limit(limit);

    return NextResponse.json({
      success: true,
      message: 'Featured kos retrieved successfully',
      data: featuredKos,
      count: featuredKos.length,
    });
  } catch (error) {
    console.error('Error retrieving featured kos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve featured kos' },
      { status: 500 }
    );
  }
}
