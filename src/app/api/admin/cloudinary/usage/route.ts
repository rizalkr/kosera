import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import type { CloudinaryUsageResponse, CloudinaryAccountResponse } from '@/types/cloudinary';
import { ok, fail } from '@/types/api';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UsageRecommendation {
  type: 'warning' | 'info';
  title: string;
  message: string;
  action: string;
}

interface UsageData {
  account: {
    cloud_name: string;
    plan: string;
    status: string;
  };
  storage: {
    used: number; // GB
    limit: number; // GB
    usagePercent: number;
    unit: 'GB';
  };
  bandwidth: {
    used: number; // GB
    limit: number; // GB
    usagePercent: number;
    unit: 'GB';
  };
  resources: {
    count: number;
    images: number;
  };
  credits: unknown;
  transformations: number | null | undefined;
  recommendations: UsageRecommendation[];
}

/**
 * GET /api/admin/cloudinary/usage - Get Cloudinary usage statistics (admin only)
 */
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

    const usage = (await cloudinary.api.usage()) as CloudinaryUsageResponse;
    const account = (await cloudinary.api.ping()) as CloudinaryAccountResponse;

    const bytesToGB = (b: number) => b / (1024 * 1024 * 1024);

    const storageUsedGB = bytesToGB(usage.storage.usage);
    const storageLimitGB = bytesToGB(usage.storage.limit);
    const storageUsagePercent = (storageUsedGB / storageLimitGB) * 100;

    const bandwidthUsedGB = bytesToGB(usage.bandwidth.usage);
    const bandwidthLimitGB = bytesToGB(usage.bandwidth.limit);
    const bandwidthUsagePercent = (bandwidthUsedGB / bandwidthLimitGB) * 100;

    const recommendations: UsageRecommendation[] = [];

    if (storageUsagePercent > 80) {
      recommendations.push({
        type: 'warning',
        title: 'Storage Usage High',
        message: 'Consider upgrading your Cloudinary plan or optimizing existing images.',
        action: 'upgrade_plan',
      });
    }

    if (bandwidthUsagePercent > 80) {
      recommendations.push({
        type: 'warning',
        title: 'Bandwidth Usage High',
        message: 'Consider implementing more aggressive image optimization or CDN caching.',
        action: 'optimize_images',
      });
    }

    if (usage.resources > 8000) {
      recommendations.push({
        type: 'info',
        title: 'High Resource Count',
        message: 'Consider cleaning up unused images or organizing with folders.',
        action: 'cleanup_resources',
      });
    }

    const usageData: UsageData = {
      account: {
        cloud_name: account.account.cloud_name,
        plan: usage.plan || 'Free',
        status: 'active',
      },
      storage: {
        used: storageUsedGB,
        limit: storageLimitGB,
        usagePercent: Math.round(storageUsagePercent * 100) / 100,
        unit: 'GB',
      },
      bandwidth: {
        used: bandwidthUsedGB,
        limit: bandwidthLimitGB,
        usagePercent: Math.round(bandwidthUsagePercent * 100) / 100,
        unit: 'GB',
      },
      resources: {
        count: usage.resources,
        images: usage.derived_resources || 0,
      },
      credits: usage.credits || null,
      transformations: usage.transformations || 0,
      recommendations,
    };

    return ok('Cloudinary usage retrieved successfully', usageData);
  } catch (error) {
    console.error('Cloudinary usage API error:', error);
    return fail('cloudinary_usage_failed', 'Failed to retrieve Cloudinary usage', undefined, { status: 500 });
  }
}

// TODO: Add caching layer (e.g., in-memory / Redis) to avoid frequent Cloudinary admin API calls.
