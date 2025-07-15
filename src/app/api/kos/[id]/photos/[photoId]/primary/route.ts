import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { kosPhotos, kos, posts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// PUT /api/kos/[id]/photos/[photoId]/primary - Set photo as primary
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
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

    const { id, photoId } = await params;
    const kosId = parseInt(id);
    const parsedPhotoId = parseInt(photoId);

    if (isNaN(kosId) || isNaN(parsedPhotoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kos ID or photo ID' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Unauthorized: You can only manage photos from your own kos' },
        { status: 403 }
      );
    }

    // Check if photo exists and belongs to this kos
    const photoExists = await db
      .select({ id: kosPhotos.id })
      .from(kosPhotos)
      .where(and(
        eq(kosPhotos.id, parsedPhotoId),
        eq(kosPhotos.kosId, kosId)
      ))
      .limit(1);

    if (photoExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      );
    }

    // First, unset all primary photos for this kos
    await db
      .update(kosPhotos)
      .set({ isPrimary: false })
      .where(eq(kosPhotos.kosId, kosId));

    // Then set the selected photo as primary
    const [updatedPhoto] = await db
      .update(kosPhotos)
      .set({ isPrimary: true })
      .where(and(
        eq(kosPhotos.id, parsedPhotoId),
        eq(kosPhotos.kosId, kosId)
      ))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Photo set as primary successfully',
      data: { photo: updatedPhoto },
    });

  } catch (error) {
    console.error('Error setting primary photo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set primary photo' },
      { status: 500 }
    );
  }
}
