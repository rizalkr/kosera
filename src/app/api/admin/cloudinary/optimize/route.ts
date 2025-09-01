import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { 
  optimizeImage, 
  bulkOptimizeImages, 
  getOptimizationRecommendations,
  generateTransformationUrls 
} from '@/lib/cloudinary-optimization';
import { ok, fail } from '@/types/api';

export async function GET(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return fail('unauthorized', 'Authentication required', undefined, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return fail('forbidden', 'Admin access required', undefined, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'recommendations') {
      const recommendations = await getOptimizationRecommendations();
      return ok('Optimization recommendations retrieved successfully', recommendations);
    }

    if (action === 'transforms') {
      const publicId = searchParams.get('publicId');
      if (!publicId) {
        return fail('missing_public_id', 'publicId parameter required', undefined, { status: 400 });
      }
      const urls = generateTransformationUrls(publicId);
      return ok('Transformation URLs generated successfully', urls);
    }

    return fail('invalid_action', 'Invalid action parameter', { action }, { status: 400 });
  } catch (error) {
    console.error('Cloudinary optimization API error:', error);
    return fail('internal_error', 'Failed to process optimization request', undefined, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return fail('unauthorized', 'Authentication required', undefined, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return fail('forbidden', 'Admin access required', undefined, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, publicIds, publicId } = body as { action?: string; publicIds?: string[]; publicId?: string };

    if (action === 'optimize-single') {
      if (!publicId) {
        return fail('missing_public_id', 'publicId is required for single optimization', undefined, { status: 400 });
      }
      const result = await optimizeImage(publicId);
      return ok('Image optimized successfully', result);
    }

    if (action === 'optimize-bulk') {
      if (!publicIds || !Array.isArray(publicIds) || !publicIds.length) {
        return fail('validation_error', 'publicIds array required', { publicIds }, { status: 400 });
      }
      const result = await bulkOptimizeImages(publicIds);
      return ok('Bulk optimization completed', result);
    }

    return fail('invalid_action', 'Invalid action or missing parameters', { action }, { status: 400 });
  } catch (error) {
    console.error('Cloudinary optimization API error:', error);
    return fail('internal_error', 'Failed to process optimization request', undefined, { status: 500 });
  }
}
