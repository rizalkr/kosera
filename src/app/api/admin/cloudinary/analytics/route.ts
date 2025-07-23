import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { db } from '@/db';
import { kosPhotos } from '@/db/schema';
import { sql, isNotNull } from 'drizzle-orm';
import type { CloudinaryResource, CloudinaryResourcesResponse } from '@/types/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryAnalytics {
  recentUploads: Array<{
    publicId: string;
    url: string;
    bytes: number;
    format: string;
    uploadedAt: string;
    dimensions: { width: number; height: number };
  }>;
  formatAnalysis: Record<string, { count: number; totalBytes: number }>;
  sizeAnalysis: {
    small: number; // < 500KB
    medium: number; // 500KB - 2MB
    large: number; // 2MB - 5MB
    xlarge: number; // > 5MB
  };
  optimizationSuggestions: Array<{
    type: 'format' | 'size' | 'compression';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    savings: string;
  }>;
  transformationUsage: {
    autoOptimization: number;
    formatConversion: number;
    resizing: number;
    qualityAdjustment: number;
  };
  databaseSync: {
    totalDbPhotos: number;
    photosWithCloudinaryId: number;
    orphanedPhotos: number;
    syncPercentage: number;
  };
}

/**
 * GET /api/admin/cloudinary/analytics - Get comprehensive Cloudinary analytics
 */
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
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get recent uploads from Cloudinary
    const recentResources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 20,
      sort_by: [['created_at', 'desc']],
      metadata: true
    }) as CloudinaryResourcesResponse;

    // Get all resources for analysis
    let allResources: CloudinaryResource[] = [];
    let nextCursor: string | undefined = undefined;
    let batchCount = 0;
    const maxBatches = 10; // Limit to prevent timeout

    do {
      const batch = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor
      }) as CloudinaryResourcesResponse;
      
      allResources = [...allResources, ...batch.resources];
      nextCursor = batch.next_cursor;
      batchCount++;
    } while (nextCursor && batchCount < maxBatches);

    // Format analysis
    const formatAnalysis: Record<string, { count: number; totalBytes: number }> = {};
    const sizeAnalysis = { small: 0, medium: 0, large: 0, xlarge: 0 };
    
    allResources.forEach(resource => {
      // Format analysis
      const format = resource.format || 'unknown';
      if (!formatAnalysis[format]) {
        formatAnalysis[format] = { count: 0, totalBytes: 0 };
      }
      formatAnalysis[format].count++;
      formatAnalysis[format].totalBytes += resource.bytes || 0;

      // Size analysis
      const sizeInMB = (resource.bytes || 0) / (1024 * 1024);
      if (sizeInMB < 0.5) sizeAnalysis.small++;
      else if (sizeInMB < 2) sizeAnalysis.medium++;
      else if (sizeInMB < 5) sizeAnalysis.large++;
      else sizeAnalysis.xlarge++;
    });

    // Generate optimization suggestions
    const optimizationSuggestions = [];
    
    // Check for large images
    if (sizeAnalysis.xlarge > 0) {
      optimizationSuggestions.push({
        type: 'size' as const,
        title: 'Large Images Detected',
        description: `${sizeAnalysis.xlarge} images are larger than 5MB. Consider resizing or compression.`,
        impact: 'high' as const,
        savings: `~${Math.round(sizeAnalysis.xlarge * 2.5)}MB potential savings`
      });
    }

    // Check for non-optimized formats
    const jpegCount = formatAnalysis.jpg?.count || 0;
    const pngCount = formatAnalysis.png?.count || 0;
    const webpCount = formatAnalysis.webp?.count || 0;
    
    if ((jpegCount + pngCount) > webpCount * 2) {
      optimizationSuggestions.push({
        type: 'format' as const,
        title: 'Format Optimization Available',
        description: 'Consider using WebP format for better compression and quality.',
        impact: 'medium' as const,
        savings: '~20-30% file size reduction'
      });
    }

    // Database sync analysis
    const totalDbPhotos = await db.select({ count: sql<number>`count(*)` }).from(kosPhotos);
    const photosWithCloudinaryId = await db.select({ count: sql<number>`count(*)` })
      .from(kosPhotos)
      .where(isNotNull(kosPhotos.cloudinaryPublicId));

    const dbPhotoCount = totalDbPhotos[0]?.count || 0;
    const cloudinaryPhotoCount = photosWithCloudinaryId[0]?.count || 0;
    const orphanedPhotos = Math.max(0, dbPhotoCount - cloudinaryPhotoCount);
    const syncPercentage = dbPhotoCount > 0 ? (cloudinaryPhotoCount / dbPhotoCount) * 100 : 100;

    // Transformation usage (mock data - would need to be tracked in real implementation)
    const transformationUsage = {
      autoOptimization: Math.round(cloudinaryPhotoCount * 0.8), // 80% use auto optimization
      formatConversion: Math.round(cloudinaryPhotoCount * 0.6), // 60% converted formats
      resizing: Math.round(cloudinaryPhotoCount * 0.9), // 90% resized
      qualityAdjustment: Math.round(cloudinaryPhotoCount * 0.7) // 70% quality adjusted
    };

    const analytics: CloudinaryAnalytics = {
      recentUploads: recentResources.resources.slice(0, 10).map((resource: CloudinaryResource) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        bytes: resource.bytes,
        format: resource.format,
        uploadedAt: resource.created_at,
        dimensions: { width: resource.width, height: resource.height }
      })),
      formatAnalysis,
      sizeAnalysis,
      optimizationSuggestions,
      transformationUsage,
      databaseSync: {
        totalDbPhotos: dbPhotoCount,
        photosWithCloudinaryId: cloudinaryPhotoCount,
        orphanedPhotos,
        syncPercentage: Math.round(syncPercentage * 100) / 100
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Cloudinary analytics retrieved successfully',
      data: analytics
    });

  } catch (error) {
    console.error('Cloudinary analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve Cloudinary analytics' },
      { status: 500 }
    );
  }
}
