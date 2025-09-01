import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { db } from '@/db';
import { kosPhotos } from '@/db/schema';
import { isNull } from 'drizzle-orm';
import type { CloudinaryResource } from '@/types/cloudinary';
import { ok, fail } from '@/types/api';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) return fail('unauthorized', 'Authentication required', undefined, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') return fail('forbidden', 'Admin access required', undefined, { status: 403 });

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'kos-photos';
    const limit = parseInt(searchParams.get('limit') || '50');

    const resources = await cloudinary.api.resources({ type: 'upload', prefix: folder, max_results: limit, resource_type: 'image' });

    const dbPhotos = await db
      .select({ id: kosPhotos.id, url: kosPhotos.url, cloudinaryPublicId: kosPhotos.cloudinaryPublicId, kosId: kosPhotos.kosId })
      .from(kosPhotos)
      .where(isNull(kosPhotos.cloudinaryPublicId));

    const dbPublicIds = new Set(dbPhotos.filter(p => p.cloudinaryPublicId).map(p => p.cloudinaryPublicId!));
    const orphanedResources = resources.resources.filter((r: CloudinaryResource) => !dbPublicIds.has(r.public_id));

    const totalSize = resources.resources.reduce((sum: number, r: CloudinaryResource) => sum + r.bytes, 0);
    const orphanedSize = orphanedResources.reduce((sum: number, r: CloudinaryResource) => sum + r.bytes, 0);

    const analysis = {
      totalResources: resources.resources.length,
      totalSizeMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
      orphanedResources: orphanedResources.length,
      orphanedSizeMB: Math.round((orphanedSize / 1024 / 1024) * 100) / 100,
      dbPhotosWithoutCloudinary: dbPhotos.length,
      potentialSavings: Math.round((orphanedSize / 1024 / 1024) * 100) / 100,
    };

    return ok('Cloudinary resources retrieved successfully', {
      resources: resources.resources,
      orphanedResources,
      dbPhotosWithoutCloudinary: dbPhotos,
      analysis,
      pagination: { total: resources.total_count, returned: resources.resources.length, hasMore: resources.resources.length === limit },
    });
  } catch (error) {
    console.error('Cloudinary resources API error:', error);
    return fail('internal_error', 'Failed to retrieve Cloudinary resources', undefined, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) return fail('unauthorized', 'Authentication required', undefined, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') return fail('forbidden', 'Admin access required', undefined, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const publicIds = body.publicIds as unknown;
    if (!Array.isArray(publicIds) || !publicIds.length) {
      return fail('validation_error', 'publicIds array is required', { publicIds }, { status: 400 });
    }

    const results = await cloudinary.api.delete_resources(publicIds);
    const deletedCount = Object.values(results.deleted).filter(status => status === 'deleted').length;
    const failedCount = (publicIds as string[]).length - deletedCount;

    return ok('Cleanup completed', { requested: publicIds.length, deleted: deletedCount, failed: failedCount, results });
  } catch (error) {
    console.error('Cloudinary cleanup error:', error);
    return fail('internal_error', 'Failed to cleanup Cloudinary resources', undefined, { status: 500 });
  }
}
