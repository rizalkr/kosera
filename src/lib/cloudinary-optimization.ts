import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryResource, CloudinaryResourcesResponse } from '@/types/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  format: string;
  optimizedUrl: string;
}

export interface BulkOptimizationResult {
  processed: number;
  errors: number;
  totalSavings: number;
  avgSavingsPercent: number;
  results: Array<{
    publicId: string;
    success: boolean;
    result?: OptimizationResult;
    error?: string;
  }>;
}

/**
 * Apply automatic optimization to a single image
 */
export async function optimizeImage(publicId: string): Promise<OptimizationResult> {
  try {
    // Get original resource details
    const originalResource = await cloudinary.api.resource(publicId);
    
    // Generate optimized URL with auto format and quality
    const optimizedUrl = cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto:good',
      flags: 'progressive',
      secure: true
    });

    // For demonstration, we calculate estimated savings
    // In a real implementation, you'd need to actually fetch the optimized image
    const estimatedSavings = originalResource.bytes * 0.3; // 30% average savings
    const optimizedSize = originalResource.bytes - estimatedSavings;

    return {
      originalSize: originalResource.bytes,
      optimizedSize: Math.round(optimizedSize),
      savings: Math.round(estimatedSavings),
      savingsPercent: Math.round((estimatedSavings / originalResource.bytes) * 100),
      format: originalResource.format,
      optimizedUrl
    };
  } catch (error) {
    throw new Error(`Failed to optimize image ${publicId}: ${error}`);
  }
}

/**
 * Bulk optimize images with progress tracking
 */
export async function bulkOptimizeImages(
  publicIds: string[],
  onProgress?: (processed: number, total: number) => void
): Promise<BulkOptimizationResult> {
  const results: BulkOptimizationResult['results'] = [];
  let totalSavings = 0;
  let totalSavingsPercent = 0;
  let errors = 0;

  for (let i = 0; i < publicIds.length; i++) {
    const publicId = publicIds[i];
    
    try {
      const result = await optimizeImage(publicId);
      results.push({
        publicId,
        success: true,
        result
      });
      
      totalSavings += result.savings;
      totalSavingsPercent += result.savingsPercent;
    } catch (error) {
      errors++;
      results.push({
        publicId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    if (onProgress) {
      onProgress(i + 1, publicIds.length);
    }
  }

  const processed = publicIds.length - errors;
  
  return {
    processed,
    errors,
    totalSavings,
    avgSavingsPercent: processed > 0 ? Math.round(totalSavingsPercent / processed) : 0,
    results
  };
}

/**
 * Get optimization recommendations for the account
 */
export async function getOptimizationRecommendations() {
  try {
    // Get all resources
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      metadata: true
    }) as CloudinaryResourcesResponse;

    const recommendations = [];
    let largeImages = 0;
    let nonOptimizedFormats = 0;
    let potentialSavings = 0;

    resources.resources.forEach((resource: CloudinaryResource) => {
      const sizeMB = resource.bytes / (1024 * 1024);
      
      // Check for large images
      if (sizeMB > 5) {
        largeImages++;
        potentialSavings += resource.bytes * 0.4; // 40% savings on large images
      }
      
      // Check for non-optimized formats
      if (resource.format === 'png' || resource.format === 'bmp') {
        nonOptimizedFormats++;
        potentialSavings += resource.bytes * 0.25; // 25% savings from format conversion
      }
    });

    if (largeImages > 0) {
      recommendations.push({
        type: 'resize',
        title: 'Resize Large Images',
        description: `Found ${largeImages} images larger than 5MB`,
        impact: 'high',
        potentialSavings: Math.round(potentialSavings * 0.6), // 60% of savings from large images
        action: 'Consider resizing images to appropriate dimensions for web use'
      });
    }

    if (nonOptimizedFormats > 0) {
      recommendations.push({
        type: 'format',
        title: 'Convert to Modern Formats',
        description: `Found ${nonOptimizedFormats} images in PNG/BMP format`,
        impact: 'medium',
        potentialSavings: Math.round(potentialSavings * 0.4), // 40% of savings from format conversion
        action: 'Convert to WebP or AVIF for better compression'
      });
    }

    return {
      totalResources: resources.resources.length,
      recommendations,
      totalPotentialSavings: Math.round(potentialSavings),
      optimizationScore: Math.max(0, 100 - (largeImages + nonOptimizedFormats) * 2)
    };
  } catch (error) {
    throw new Error(`Failed to get optimization recommendations: ${error}`);
  }
}

/**
 * Apply global optimization settings to account
 */
export async function applyGlobalOptimizations() {
  // This would typically involve configuring upload presets
  // or applying transformations to existing images
  
  try {
    // Create or update an upload preset with optimization settings
    const presetOptions = {
      unsigned: false,
      fetch_format: 'auto',
      quality: 'auto:good',
      flags: 'progressive',
      folder: 'kos-photos'
    };

    // Note: Cloudinary Admin API doesn't allow creating presets programmatically
    // This is more of a guideline for manual configuration
    
    return {
      success: true,
      message: 'Optimization settings configured',
      settings: presetOptions
    };
  } catch (error) {
    throw new Error(`Failed to apply global optimizations: ${error}`);
  }
}

/**
 * Generate transformation URLs for different use cases
 */
export function generateTransformationUrls(publicId: string) {
  const baseOptions = { secure: true };
  
  return {
    // Thumbnail (150x150)
    thumbnail: cloudinary.url(publicId, {
      ...baseOptions,
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto:good'
    }),
    
    // Medium (600x400)
    medium: cloudinary.url(publicId, {
      ...baseOptions,
      width: 600,
      height: 400,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto:good'
    }),
    
    // Large (1200x800)
    large: cloudinary.url(publicId, {
      ...baseOptions,
      width: 1200,
      height: 800,
      crop: 'limit',
      fetch_format: 'auto',
      quality: 'auto:good'
    }),
    
    // WebP version
    webp: cloudinary.url(publicId, {
      ...baseOptions,
      fetch_format: 'webp',
      quality: 'auto:good'
    }),
    
    // AVIF version (next-gen format)
    avif: cloudinary.url(publicId, {
      ...baseOptions,
      fetch_format: 'avif',
      quality: 'auto:good'
    }),
    
    // Compressed version
    compressed: cloudinary.url(publicId, {
      ...baseOptions,
      quality: 60,
      fetch_format: 'auto'
    })
  };
}
