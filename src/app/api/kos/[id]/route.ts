import { NextRequest, NextResponse } from 'next/server';
import { withSellerOrAdmin, AuthenticatedRequest } from '@/lib/middleware';
import { db } from '@/db';
import { kos, posts, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/kos/[id] - Get specific kos by ID (public)
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

    const result = await db
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

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kos retrieved successfully',
      data: result[0]
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
    const { name, address, city, facilities, title, description, price } = body;

    // Check if kos exists and get post info
    const existingKos = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        userId: posts.userId
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

    // Check ownership (user can only edit their own kos, admin can edit any)
    if (request.user!.role !== 'ADMIN' && existingKos[0].userId !== request.user!.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own kos' },
        { status: 403 }
      );
    }

    // Validate price if provided
    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Update kos data
    const kosUpdates: any = {};
    if (name !== undefined) kosUpdates.name = name;
    if (address !== undefined) kosUpdates.address = address;
    if (city !== undefined) kosUpdates.city = city;
    if (facilities !== undefined) kosUpdates.facilities = facilities;

    if (Object.keys(kosUpdates).length > 0) {
      await db
        .update(kos)
        .set(kosUpdates)
        .where(eq(kos.id, kosId))
        .execute();
    }

    // Update post data
    const postUpdates: any = {};
    if (title !== undefined) postUpdates.title = title;
    if (description !== undefined) postUpdates.description = description;
    if (price !== undefined) postUpdates.price = parseInt(price);
    
    if (Object.keys(postUpdates).length > 0) {
      postUpdates.updatedAt = new Date();
      await db
        .update(posts)
        .set(postUpdates)
        .where(eq(posts.id, existingKos[0].postId))
        .execute();
    }

    // Fetch updated data
    const updatedResult = await db
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
      .where(eq(kos.id, kosId))
      .limit(1)
      .execute();

    return NextResponse.json({
      message: 'Kos updated successfully',
      data: updatedResult[0]
    });

  } catch (error) {
    console.error('Error updating kos:', error);
    return NextResponse.json(
      { error: 'Failed to update kos' },
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
      { error: 'Invalid kos ID' },
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
