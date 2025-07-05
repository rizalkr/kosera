import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kosPhotos, kos, posts } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Schema for photo upload
const uploadPhotoSchema = z.object({
  url: z.string().url('Invalid URL format'),
  caption: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

// GET /api/kos/[id]/photos - Get all photos for a kos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get photos
    const photos = await db
      .select({
        id: kosPhotos.id,
        url: kosPhotos.url,
        caption: kosPhotos.caption,
        isPrimary: kosPhotos.isPrimary,
        createdAt: kosPhotos.createdAt,
      })
      .from(kosPhotos)
      .where(eq(kosPhotos.kosId, kosId))
      .orderBy(kosPhotos.isPrimary, kosPhotos.createdAt);

    return NextResponse.json({
      success: true,
      message: 'Photos retrieved successfully',
      data: { photos },
    });

  } catch (error) {
    console.error('Error retrieving photos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve photos' },
      { status: 500 }
    );
  }
}

// POST /api/kos/[id]/photos - Upload a new photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const kosId = parseInt(id);

    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = uploadPhotoSchema.parse(body);

    // Check if kos exists and user owns it
    const kosData = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        userId: posts.userId,
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Check ownership (user must own the kos or be admin)
    if (kosData[0].userId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only upload photos to your own kos' },
        { status: 403 }
      );
    }

    // If setting as primary, unset other primary photos
    if (validatedData.isPrimary) {
      await db
        .update(kosPhotos)
        .set({ isPrimary: false })
        .where(eq(kosPhotos.kosId, kosId));
    }

    // Create photo record
    const [newPhoto] = await db
      .insert(kosPhotos)
      .values({
        kosId,
        url: validatedData.url,
        caption: validatedData.caption,
        isPrimary: validatedData.isPrimary,
      })
      .returning();

    // Update photo count in posts
    await db
      .update(posts)
      .set({
        photoCount: sql`${posts.photoCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, kosData[0].postId));

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: { photo: newPhoto },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// DELETE /api/kos/[id]/photos - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const kosId = parseInt(id);

    if (isNaN(kosId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID' },
        { status: 400 }
      );
    }

    const { photoId } = await request.json();

    if (!photoId || isNaN(parseInt(photoId))) {
      return NextResponse.json(
        { success: false, error: 'Valid photo ID is required' },
        { status: 400 }
      );
    }

    const parsedPhotoId = parseInt(photoId);

    // Check if kos exists and user owns it
    const kosData = await db
      .select({
        id: kos.id,
        postId: kos.postId,
        userId: posts.userId,
      })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kos not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (kosData[0].userId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You can only delete photos from your own kos' },
        { status: 403 }
      );
    }

    // Delete photo
    const deletedPhoto = await db
      .delete(kosPhotos)
      .where(and(
        eq(kosPhotos.id, parsedPhotoId),
        eq(kosPhotos.kosId, kosId)
      ))
      .returning();

    if (deletedPhoto.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Update photo count in posts
    await db
      .update(posts)
      .set({
        photoCount: sql`GREATEST(0, ${posts.photoCount} - 1)`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, kosData[0].postId));

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
