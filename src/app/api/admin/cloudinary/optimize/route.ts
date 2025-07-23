import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { 
  optimizeImage, 
  bulkOptimizeImages, 
  getOptimizationRecommendations,
  generateTransformationUrls 
} from '@/lib/cloudinary-optimization';

/**
 * GET /api/admin/cloudinary/optimize - Get optimization recommendations
 * POST /api/admin/cloudinary/optimize - Optimize images
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
    const action = searchParams.get('action');

    if (action === 'recommendations') {
      const recommendations = await getOptimizationRecommendations();
      return NextResponse.json({
        success: true,
        message: 'Optimization recommendations retrieved successfully',
        data: recommendations
      });
    }

    if (action === 'transforms' && searchParams.get('publicId')) {
      const publicId = searchParams.get('publicId')!;
      const urls = generateTransformationUrls(publicId);
      return NextResponse.json({
        success: true,
        message: 'Transformation URLs generated successfully',
        data: urls
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Cloudinary optimization API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process optimization request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, publicIds, publicId } = body;

    if (action === 'optimize-single' && publicId) {
      const result = await optimizeImage(publicId);
      return NextResponse.json({
        success: true,
        message: 'Image optimized successfully',
        data: result
      });
    }

    if (action === 'optimize-bulk' && publicIds && Array.isArray(publicIds)) {
      const result = await bulkOptimizeImages(publicIds);
      return NextResponse.json({
        success: true,
        message: 'Bulk optimization completed',
        data: result
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Cloudinary optimization API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process optimization request' },
      { status: 500 }
    );
  }
}
