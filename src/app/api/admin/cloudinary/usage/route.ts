import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import type { CloudinaryUsageResponse, CloudinaryAccountResponse } from '@/types/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/admin/cloudinary/usage - Get Cloudinary usage statistics
 * Requires admin authentication
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

    // Get Cloudinary usage information
    const usage = await cloudinary.api.usage() as CloudinaryUsageResponse;
    
    // Get account details
    const account = await cloudinary.api.ping() as CloudinaryAccountResponse;

    // Calculate usage percentages and recommendations
    const storageUsedGB = usage.storage.usage / (1024 * 1024 * 1024);
    const storageLimitGB = usage.storage.limit / (1024 * 1024 * 1024);
    const storageUsagePercent = (storageUsedGB / storageLimitGB) * 100;

    const bandwidthUsedGB = usage.bandwidth.usage / (1024 * 1024 * 1024);
    const bandwidthLimitGB = usage.bandwidth.limit / (1024 * 1024 * 1024);
    const bandwidthUsagePercent = (bandwidthUsedGB / bandwidthLimitGB) * 100;

    // Generate recommendations
    const recommendations = [];
    
    if (storageUsagePercent > 80) {
      recommendations.push({
        type: 'warning',
        title: 'Storage Usage High',
        message: 'Consider upgrading your Cloudinary plan or optimizing existing images.',
        action: 'upgrade_plan'
      });
    }

    if (bandwidthUsagePercent > 80) {
      recommendations.push({
        type: 'warning',
        title: 'Bandwidth Usage High',
        message: 'Consider implementing more aggressive image optimization or CDN caching.',
        action: 'optimize_images'
      });
    }

    if (usage.resources > 8000) {
      recommendations.push({
        type: 'info',
        title: 'High Resource Count',
        message: 'Consider cleaning up unused images or organizing with folders.',
        action: 'cleanup_resources'
      });
    }

    const usageData = {
      account: {
        cloud_name: account.account.cloud_name,
        plan: usage.plan || 'Free',
        status: 'active'
      },
      storage: {
        used: storageUsedGB,
        limit: storageLimitGB,
        usagePercent: Math.round(storageUsagePercent * 100) / 100,
        unit: 'GB'
      },
      bandwidth: {
        used: bandwidthUsedGB,
        limit: bandwidthLimitGB,
        usagePercent: Math.round(bandwidthUsagePercent * 100) / 100,
        unit: 'GB'
      },
      resources: {
        count: usage.resources,
        images: usage.derived_resources || 0
      },
      credits: usage.credits || null,
      transformations: usage.transformations || 0,
      recommendations
    };

    return NextResponse.json({
      success: true,
      message: 'Cloudinary usage retrieved successfully',
      data: usageData
    });

  } catch (error) {
    console.error('Cloudinary usage API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve Cloudinary usage' },
      { status: 500 }
    );
  }
}
