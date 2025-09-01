import { db } from '@/db';
import { kosPhotos, kos, posts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { ok, fail } from '@/types/api';

// PUT /api/kos/[id]/photos/[photoId]/primary - Set photo as primary
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return fail('unauthorized', 'Authentication required', undefined, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return fail('invalid_token', 'Invalid or expired token', undefined, { status: 401 });
    }

    const { id, photoId } = await params;
    const kosId = parseInt(id, 10);
    const parsedPhotoId = parseInt(photoId, 10);

    if (Number.isNaN(kosId) || Number.isNaN(parsedPhotoId)) {
      return fail('invalid_ids', 'Invalid kos ID or photo ID', undefined, { status: 400 });
    }

    const kosData = await db
      .select({ id: kos.id, postId: kos.postId, userId: posts.userId })
      .from(kos)
      .innerJoin(posts, eq(kos.postId, posts.id))
      .where(eq(kos.id, kosId))
      .limit(1);

    if (kosData.length === 0) {
      return fail('kos_not_found', 'Kos not found', undefined, { status: 404 });
    }

    if (kosData[0].userId !== payload.userId && payload.role !== 'ADMIN') {
      return fail('forbidden', 'You can only manage photos from your own kos', undefined, { status: 403 });
    }

    const photoExists = await db
      .select({ id: kosPhotos.id })
      .from(kosPhotos)
      .where(and(eq(kosPhotos.id, parsedPhotoId), eq(kosPhotos.kosId, kosId)))
      .limit(1);

    if (photoExists.length === 0) {
      return fail('photo_not_found', 'Photo not found', undefined, { status: 404 });
    }

    await db.update(kosPhotos).set({ isPrimary: false }).where(eq(kosPhotos.kosId, kosId));

    const [updatedPhoto] = await db
      .update(kosPhotos)
      .set({ isPrimary: true })
      .where(and(eq(kosPhotos.id, parsedPhotoId), eq(kosPhotos.kosId, kosId)))
      .returning();

    return ok('Photo set as primary successfully', { photo: updatedPhoto });
  } catch (error) {
    console.error('Error setting primary photo:', error);
    return fail('set_primary_failed', 'Failed to set primary photo', undefined, { status: 500 });
  }
}

// TODO: Add audit logging for photo primary changes.
