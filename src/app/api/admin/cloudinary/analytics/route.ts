import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { db } from '@/db';
import { kosPhotos } from '@/db/schema';
import { sql, isNotNull } from 'drizzle-orm';
import type { CloudinaryResource, CloudinaryResourcesResponse } from '@/types/cloudinary';
import { ok, fail } from '@/types/api';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/admin/cloudinary/analytics - Get comprehensive Cloudinary analytics
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) return fail('unauthorized', 'Authentication required', undefined, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return fail('forbidden', 'Admin access required', undefined, { status: 403 });
    }

    // Get recent uploads from Cloudinary
    const recentResources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 20,
      sort_by: [['created_at', 'desc']],
      metadata: true,
    }) as CloudinaryResourcesResponse;

    // Get all resources for analysis
    let allResources: CloudinaryResource[] = [];
    let nextCursor: string | undefined;
    let batchCount = 0;
    const maxBatches = 10; // Limit to prevent timeout
    do {
      const batch = await cloudinary.api.resources({ type: 'upload', max_results: 500, next_cursor: nextCursor }) as CloudinaryResourcesResponse;
      allResources = [...allResources, ...batch.resources];
      nextCursor = batch.next_cursor;
      batchCount++;
    } while (nextCursor && batchCount < maxBatches);

    // Format analysis
    const formatAnalysis: Record<string, { count: number; totalBytes: number }> = {};
    const sizeAnalysis = { small: 0, medium: 0, large: 0, xlarge: 0 };
    allResources.forEach(r => {
      // Format analysis
      const format = r.format || 'unknown';
      if (!formatAnalysis[format]) formatAnalysis[format] = { count: 0, totalBytes: 0 };
      formatAnalysis[format].count++;
      formatAnalysis[format].totalBytes += r.bytes || 0;

      // Size analysis
      const sizeMB = (r.bytes || 0) / 1024 / 1024;
      if (sizeMB < 0.5) sizeAnalysis.small++;
      else if (sizeMB < 2) sizeAnalysis.medium++;
      else if (sizeMB < 5) sizeAnalysis.large++;
      else sizeAnalysis.xlarge++;
    });

    // Generate optimization suggestions
    const optimizationSuggestions = [] as Array<{ type: 'format' | 'size' | 'compression'; title: string; description: string; impact: 'high' | 'medium' | 'low'; savings: string }>;
    const jpegCount = formatAnalysis.jpg?.count || 0;
    const pngCount = formatAnalysis.png?.count || 0;
    const webpCount = formatAnalysis.webp?.count || 0;
    // Check for large images
    if (sizeAnalysis.xlarge > 0) optimizationSuggestions.push({ type: 'size', title: 'Large Images Detected', description: `${sizeAnalysis.xlarge} images are larger than 5MB. Consider resizing or compression.`, impact: 'high', savings: `~${Math.round(sizeAnalysis.xlarge * 2.5)}MB potential savings` });
    // Check for non-optimized formats
    if (jpegCount + pngCount > webpCount * 2) optimizationSuggestions.push({ type: 'format', title: 'Format Optimization Available', description: 'Consider using WebP format for better compression and quality.', impact: 'medium', savings: '~20-30% file size reduction' });

    // Database sync analysis
    const totalDbPhotos = await db.select({ count: sql<number>`count(*)` }).from(kosPhotos);
    const photosWithCloudinaryId = await db.select({ count: sql<number>`count(*)` }).from(kosPhotos).where(isNotNull(kosPhotos.cloudinaryPublicId));
    const dbPhotoCount = totalDbPhotos[0]?.count || 0;
    const cloudinaryPhotoCount = photosWithCloudinaryId[0]?.count || 0;
    const orphanedPhotos = Math.max(0, dbPhotoCount - cloudinaryPhotoCount);
    const syncPercentage = dbPhotoCount > 0 ? (cloudinaryPhotoCount / dbPhotoCount) * 100 : 100;

    // Transformation usage (mock data - would need to be tracked in real implementation)
    const transformationUsage = {
      autoOptimization: Math.round(cloudinaryPhotoCount * 0.8),
      formatConversion: Math.round(cloudinaryPhotoCount * 0.6),
      resizing: Math.round(cloudinaryPhotoCount * 0.9),
      qualityAdjustment: Math.round(cloudinaryPhotoCount * 0.7),
    };

    const analytics = {
      recentUploads: recentResources.resources.slice(0, 10).map(r => ({
        publicId: r.public_id,
        url: r.secure_url,
        bytes: r.bytes,
        format: r.format,
        uploadedAt: r.created_at,
        dimensions: { width: r.width, height: r.height },
      })),
      formatAnalysis,
      sizeAnalysis,
      optimizationSuggestions,
      transformationUsage,
      databaseSync: {
        totalDbPhotos: dbPhotoCount,
        photosWithCloudinaryId: cloudinaryPhotoCount,
        orphanedPhotos,
        syncPercentage: Math.round(syncPercentage * 100) / 100,
      },
    };

    return ok('Cloudinary analytics retrieved successfully', analytics);
  } catch (error) {
    console.error('Cloudinary analytics API error:', error);
    return fail('internal_error', 'Failed to retrieve Cloudinary analytics', undefined, { status: 500 });
  }
}
