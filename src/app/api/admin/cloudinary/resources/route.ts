import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { db } from '@/db';
import { kosPhotos } from '@/db/schema';
import { isNull } from 'drizzle-orm';
import type { CloudinaryResource } from '@/types/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/admin/cloudinary/resources - Get Cloudinary resources and analysis
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

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'kos-photos';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get resources from Cloudinary
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: limit,
      resource_type: 'image'
    });

    // Get database photos for comparison
    const dbPhotos = await db
      .select({
        id: kosPhotos.id,
        url: kosPhotos.url,
        cloudinaryPublicId: kosPhotos.cloudinaryPublicId,
        kosId: kosPhotos.kosId
      })
      .from(kosPhotos)
      .where(isNull(kosPhotos.cloudinaryPublicId));

    // Analyze orphaned resources (in Cloudinary but not in DB)
    const dbPublicIds = new Set(
      dbPhotos
        .filter(photo => photo.cloudinaryPublicId)
        .map(photo => photo.cloudinaryPublicId)
    );

    const orphanedResources = resources.resources.filter(
      (resource: CloudinaryResource) => !dbPublicIds.has(resource.public_id)
    );

    // Calculate storage analysis
    const totalSize = resources.resources.reduce((sum: number, resource: CloudinaryResource) => sum + resource.bytes, 0);
    const orphanedSize = orphanedResources.reduce((sum: number, resource: CloudinaryResource) => sum + resource.bytes, 0);

    const analysis = {
      totalResources: resources.resources.length,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      orphanedResources: orphanedResources.length,
      orphanedSizeMB: Math.round(orphanedSize / (1024 * 1024) * 100) / 100,
      dbPhotosWithoutCloudinary: dbPhotos.length,
      potentialSavings: Math.round(orphanedSize / (1024 * 1024) * 100) / 100
    };

    return NextResponse.json({
      success: true,
      message: 'Cloudinary resources retrieved successfully',
      data: {
        resources: resources.resources,
        orphanedResources,
        dbPhotosWithoutCloudinary: dbPhotos,
        analysis,
        pagination: {
          total: resources.total_count,
          returned: resources.resources.length,
          hasMore: resources.resources.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Cloudinary resources API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve Cloudinary resources' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/cloudinary/resources - Clean up orphaned resources
 */
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
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { publicIds } = await request.json();

    if (!publicIds || !Array.isArray(publicIds)) {
      return NextResponse.json(
        { success: false, error: 'publicIds array is required' },
        { status: 400 }
      );
    }

    // Delete resources from Cloudinary
    const results = await cloudinary.api.delete_resources(publicIds);

    const deletedCount = Object.values(results.deleted).filter(status => status === 'deleted').length;
    const failedCount = publicIds.length - deletedCount;

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${deletedCount} deleted, ${failedCount} failed`,
      data: {
        requested: publicIds.length,
        deleted: deletedCount,
        failed: failedCount,
        results
      }
    });

  } catch (error) {
    console.error('Cloudinary cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup Cloudinary resources' },
      { status: 500 }
    );
  }
}
