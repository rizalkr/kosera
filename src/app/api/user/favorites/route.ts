import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { favorites, kos, posts, users } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// GET /api/user/favorites - Get user's favorite kos
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    // Get user's favorites with kos details
    const favoriteKos = await db
      .select({
        id: favorites.id,
        createdAt: favorites.createdAt,
        kos: {
          id: kos.id,
          name: kos.name,
          address: kos.address,
          city: kos.city,
          facilities: kos.facilities,
          latitude: kos.latitude,
          longitude: kos.longitude,
        },
        post: {
          id: posts.id,
          title: posts.title,
          description: posts.description,
          price: posts.price,
          averageRating: posts.averageRating,
          reviewCount: posts.reviewCount,
          viewCount: posts.viewCount,
          photoCount: posts.photoCount,
          isFeatured: posts.isFeatured,
        },
        owner: {
          id: users.id,
          name: users.name,
          username: users.username,
          contact: users.contact,
        },
      })
      .from(favorites)
      .innerJoin(kos, eq(favorites.kosId, kos.id))
      .innerJoin(posts, eq(kos.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(favorites.userId, payload.userId))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalFavorites = await db
      .select({ count: favorites.id })
      .from(favorites)
      .where(eq(favorites.userId, payload.userId));

    const totalPages = Math.ceil(totalFavorites.length / limit);

    return NextResponse.json({
      success: true,
      message: 'Favorites retrieved successfully',
      data: {
        favorites: favoriteKos,
        pagination: {
          page,
          limit,
          totalFavorites: totalFavorites.length,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });

  } catch (error) {
    console.error('Error retrieving favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve favorites' },
      { status: 500 }
    );
  }
}

// POST /api/user/favorites - Add kos to favorites
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
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

    const { kosId } = await request.json();

    if (!kosId || isNaN(parseInt(kosId))) {
      return NextResponse.json(
        { success: false, error: 'Valid kos ID is required' },
        { status: 400 }
      );
    }

    const parsedKosId = parseInt(kosId);

    // Check if kos exists
    const kosExists = await db
      .select({ id: kos.id })
      .from(kos)
      .where(eq(kos.id, parsedKosId))
      .limit(1);

    if (kosExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(and(
        eq(favorites.userId, payload.userId),
        eq(favorites.kosId, parsedKosId)
      ))
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Kos is already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    const [newFavorite] = await db
      .insert(favorites)
      .values({
        userId: payload.userId,
        kosId: parsedKosId,
      })
      .returning();

    // Update favorite count in posts
    const postToUpdate = await db
      .select({ id: posts.id })
      .from(posts)
      .innerJoin(kos, eq(posts.id, kos.postId))
      .where(eq(kos.id, parsedKosId))
      .limit(1);

    if (postToUpdate.length > 0) {
      await db
        .update(posts)
        .set({
          favoriteCount: sql`${posts.favoriteCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postToUpdate[0].id));
    }

    return NextResponse.json({
      success: true,
      message: 'Kos added to favorites successfully',
      data: { favorite: newFavorite },
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/favorites - Remove kos from favorites
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
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

    const { kosId } = await request.json();

    if (!kosId || isNaN(parseInt(kosId))) {
      return NextResponse.json(
        { success: false, error: 'Valid kos ID is required' },
        { status: 400 }
      );
    }

    const parsedKosId = parseInt(kosId);

    // Find and delete favorite
    const deletedFavorite = await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, payload.userId),
        eq(favorites.kosId, parsedKosId)
      ))
      .returning();

    if (deletedFavorite.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    // Update favorite count in posts
    const postToUpdate = await db
      .select({ id: posts.id })
      .from(posts)
      .innerJoin(kos, eq(posts.id, kos.postId))
      .where(eq(kos.id, parsedKosId))
      .limit(1);

    if (postToUpdate.length > 0) {
      await db
        .update(posts)
        .set({
          favoriteCount: sql`GREATEST(0, ${posts.favoriteCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postToUpdate[0].id));
    }

    return NextResponse.json({
      success: true,
      message: 'Kos removed from favorites successfully',
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
