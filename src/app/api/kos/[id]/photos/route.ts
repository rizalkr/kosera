import { db } from '@/db';
import { kosPhotos, kos, posts } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';
import { z } from 'zod';
import { ok, fail } from '@/types/api';

const uploadPhotoSchema = z.object({
  url: z.string().url('Invalid URL format'),
  caption: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

// GET /api/kos/[id]/photos - Get all photos for a kos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kosId = parseInt(id, 10);
    if (Number.isNaN(kosId)) {
      return fail('invalid_kos_id', 'Invalid kos ID', undefined, { status: 400 });
    }

    const kosExists = await db.select({ id: kos.id }).from(kos).where(eq(kos.id, kosId)).limit(1);
    if (kosExists.length === 0) {
      return fail('kos_not_found', 'Kos not found', undefined, { status: 404 });
    }

    const photos = await db
      .select({ id: kosPhotos.id, url: kosPhotos.url, caption: kosPhotos.caption, isPrimary: kosPhotos.isPrimary, createdAt: kosPhotos.createdAt })
      .from(kosPhotos)
      .where(eq(kosPhotos.kosId, kosId))
      .orderBy(kosPhotos.isPrimary, kosPhotos.createdAt);

    return ok('Photos retrieved successfully', { photos });
  } catch (error) {
    console.error('Error retrieving photos:', error);
    return fail('photos_retrieve_failed', 'Failed to retrieve photos', undefined, { status: 500 });
  }
}

// POST /api/kos/[id]/photos - Upload a new photo
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const kosId = parseInt(id, 10);
    if (Number.isNaN(kosId)) {
      return fail('invalid_kos_id', 'Invalid kos ID', undefined, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail('invalid_json', 'Invalid JSON body', undefined, { status: 400 });
    }
    const parsed = uploadPhotoSchema.safeParse(body);
    if (!parsed.success) {
      return fail('validation_error', 'Invalid input data', parsed.error.flatten(), { status: 400 });
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
      return fail('forbidden', 'You can only upload photos to your own kos', undefined, { status: 403 });
    }

    if (parsed.data.isPrimary) {
      await db.update(kosPhotos).set({ isPrimary: false }).where(eq(kosPhotos.kosId, kosId));
    }

    const [newPhoto] = await db
      .insert(kosPhotos)
      .values({ kosId, url: parsed.data.url, caption: parsed.data.caption, isPrimary: parsed.data.isPrimary })
      .returning();

    await db
      .update(posts)
      .set({ photoCount: sql`${posts.photoCount} + 1`, updatedAt: new Date() })
      .where(eq(posts.id, kosData[0].postId));

    return ok('Photo uploaded successfully', { photo: newPhoto });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail('validation_error', 'Invalid input data', error.flatten(), { status: 400 });
    }
    console.error('Error uploading photo:', error);
    return fail('photo_upload_failed', 'Failed to upload photo', undefined, { status: 500 });
  }
}

// DELETE /api/kos/[id]/photos - Delete a photo
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const kosId = parseInt(id, 10);
    if (Number.isNaN(kosId)) {
      return fail('invalid_kos_id', 'Invalid kos ID', undefined, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !('photoId' in body)) {
      return fail('invalid_json', 'Valid photo ID is required', undefined, { status: 400 });
    }

    const parsedPhotoId = parseInt(String(body.photoId), 10);
    if (Number.isNaN(parsedPhotoId)) {
      return fail('invalid_photo_id', 'Valid photo ID is required', undefined, { status: 400 });
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
      return fail('forbidden', 'You can only delete photos from your own kos', undefined, { status: 403 });
    }

    const photoToDelete = await db
      .select({ id: kosPhotos.id, url: kosPhotos.url, cloudinaryPublicId: kosPhotos.cloudinaryPublicId })
      .from(kosPhotos)
      .where(and(eq(kosPhotos.id, parsedPhotoId), eq(kosPhotos.kosId, kosId)))
      .limit(1);

    if (photoToDelete.length === 0) {
      return fail('photo_not_found', 'Photo not found', undefined, { status: 404 });
    }

    const photo = photoToDelete[0];
    if (photo.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(photo.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError);
      }
    } else if (photo.url.includes('cloudinary.com')) {
      const publicId = extractPublicIdFromUrl(photo.url);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (cloudinaryError) {
          console.warn('Failed to delete from Cloudinary:', cloudinaryError);
        }
      }
    }

    await db.delete(kosPhotos).where(and(eq(kosPhotos.id, parsedPhotoId), eq(kosPhotos.kosId, kosId)));

    await db
      .update(posts)
      .set({ photoCount: sql`GREATEST(0, ${posts.photoCount} - 1)`, updatedAt: new Date() })
      .where(eq(posts.id, kosData[0].postId));

    return ok('Photo deleted successfully', {});
  } catch (error) {
    console.error('Error deleting photo:', error);
    return fail('photo_delete_failed', 'Failed to delete photo', undefined, { status: 500 });
  }
}

// TODO: Add pagination for large photo collections and soft-delete functionality.
