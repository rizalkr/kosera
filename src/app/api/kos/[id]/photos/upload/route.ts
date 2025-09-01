import { db } from '@/db';
import { kosPhotos, kos, posts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { parseFormData, validateImageFile } from '@/lib/upload';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { ok, fail } from '@/types/api';

// POST /api/kos/[id]/photos/upload - Upload photo files
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

    // Cast to any to satisfy current parseFormData signature expecting NextRequest; TODO: update parseFormData to accept Fetch API Request
    const { files } = await parseFormData(request as unknown as import('next/server').NextRequest);
    const isPrimary = new URL(request.url).searchParams.get('isPrimary') === 'true';

    if (files.length === 0) {
      return fail('no_files', 'No files provided', undefined, { status: 400 });
    }

    const uploadedPhotos: Array<{
      id: number; kosId: number; url: string; cloudinaryPublicId: string | null; isPrimary: boolean; caption: string | null; createdAt: Date; width?: number; height?: number; fileSize?: number; format?: string;
    }> = [];

    if (isPrimary) {
      await db.update(kosPhotos).set({ isPrimary: false }).where(eq(kosPhotos.kosId, kosId));
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.originalname) continue;

      const validation = validateImageFile(file);
      if (!validation.isValid) {
        console.warn(`Skipping file ${file.originalname}: ${validation.error}`);
        continue;
      }

      try {
        const cloudinaryResult = await uploadToCloudinary(file.buffer, `kos-photos/kos-${kosId}`, {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
        });

        const [newPhoto] = await db
          .insert(kosPhotos)
          .values({
            kosId,
            url: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id,
            isPrimary: isPrimary && i === 0,
            caption: file.originalname.split('.')[0],
          })
          .returning();

        uploadedPhotos.push({
          ...newPhoto,
          width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            fileSize: cloudinaryResult.bytes,
            format: cloudinaryResult.format,
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        continue;
      }
    }

    if (uploadedPhotos.length === 0) {
      return fail('no_valid_files', 'No valid files were uploaded', undefined, { status: 400 });
    }

    await db
      .update(posts)
      .set({
        photoCount: sql`${posts.photoCount} + ${uploadedPhotos.length}`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, kosData[0].postId));

    return ok('Photos uploaded successfully', { photos: uploadedPhotos });
  } catch (error) {
    console.error('Upload error:', error);
    return fail('photo_upload_failed', 'Failed to upload photos', undefined, { status: 500 });
  }
}

// TODO: Add rate limiting / size limiting for uploads.
