import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Advanced image transformation configurations for different use cases
 */
export const ImageTransformations = {
  // Profile and user avatars
  avatar: {
    thumbnail: {
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:good',
      format: 'auto',
      radius: 'max' // Makes it circular
    },
    small: {
      width: 64,
      height: 64,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:eco',
      format: 'auto',
      radius: 'max'
    }
  },

  // Property listing images
  property: {
    // Main listing thumbnail
    thumbnail: {
      width: 400,
      height: 300,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'auto',
      fetch_format: 'auto'
    },
    
    // Gallery view
    gallery: {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto:good',
      format: 'auto',
      fetch_format: 'auto'
    },

    // Mobile optimized
    mobile: {
      width: 375,
      height: 250,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:eco',
      format: 'auto',
      dpr: '2.0' // Retina display support
    },

    // Hero/banner images
    hero: {
      width: 1200,
      height: 400,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'auto'
    },

    // Card view (for listings)
    card: {
      width: 350,
      height: 200,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'auto'
    }
  },

  // SEO and social media optimized
  social: {
    // Open Graph images
    og: {
      width: 1200,
      height: 630,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'jpg'
    },

    // Twitter cards
    twitter: {
      width: 1024,
      height: 512,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'jpg'
    }
  },

  // Progressive loading
  progressive: {
    // Placeholder for lazy loading
    placeholder: {
      width: 50,
      height: 38,
      crop: 'fill',
      quality: 1,
      format: 'jpg',
      blur: 400
    },

    // Low quality image placeholder
    lqip: {
      width: 100,
      height: 75,
      crop: 'fill',
      quality: 'auto:low',
      format: 'jpg'
    }
  }
};

/**
 * Responsive image sets for different screen sizes
 */
export const ResponsiveImageSets = {
  property: {
    sizes: [
      { width: 400, suffix: 'sm' },
      { width: 600, suffix: 'md' },
      { width: 800, suffix: 'lg' },
      { width: 1200, suffix: 'xl' }
    ],
    baseTransformation: {
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'auto'
    }
  }
};

/**
 * Generate optimized image URL with transformations
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformationType: keyof typeof ImageTransformations,
  size?: string,
  customTransformations?: Record<string, any>
): string => {
  if (!publicId) return '';

  let transformation;

  if (transformationType in ImageTransformations) {
    const transformationGroup = ImageTransformations[transformationType];
    transformation = size && size in transformationGroup 
      ? transformationGroup[size as keyof typeof transformationGroup]
      : transformationGroup;
  } else {
    transformation = {};
  }

  // Merge custom transformations
  const finalTransformation = {
    ...transformation,
    ...customTransformations
  };

  return cloudinary.url(publicId, finalTransformation);
};

/**
 * Generate responsive image srcset
 */
export const generateResponsiveSrcSet = (
  publicId: string,
  type: keyof typeof ResponsiveImageSets = 'property'
): { srcSet: string; sizes: string } => {
  const config = ResponsiveImageSets[type];
  
  const srcSetItems = config.sizes.map(({ width, suffix }) => {
    const url = cloudinary.url(publicId, {
      ...config.baseTransformation,
      width
    });
    return `${url} ${width}w`;
  });

  const sizes = [
    '(max-width: 640px) 400px',
    '(max-width: 768px) 600px', 
    '(max-width: 1024px) 800px',
    '1200px'
  ].join(', ');

  return {
    srcSet: srcSetItems.join(', '),
    sizes
  };
};

/**
 * Generate image with watermark for premium listings
 */
export const getWatermarkedImageUrl = (
  publicId: string,
  watermarkText: string = 'Kosera',
  options: Record<string, any> = {}
): string => {
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto:good',
    format: 'auto',
    overlay: {
      text: watermarkText,
      font_family: 'Arial',
      font_size: 60,
      font_weight: 'bold',
      color: 'white',
      opacity: 30,
      gravity: 'south_east',
      x: 20,
      y: 20
    }
  };

  return cloudinary.url(publicId, {
    ...defaultOptions,
    ...options
  });
};

/**
 * AI-powered automatic image enhancement
 */
export const getAIEnhancedImageUrl = (
  publicId: string,
  enhancements: string[] = ['improve', 'auto_color', 'auto_contrast']
): string => {
  const transformation = {
    width: 1200,
    height: 800,
    crop: 'limit',
    quality: 'auto:best',
    format: 'auto',
    effect: enhancements.join(':')
  };

  return cloudinary.url(publicId, transformation);
};

/**
 * Generate image analysis for content moderation
 */
export const analyzeImageContent = async (publicId: string) => {
  try {
    // Use Cloudinary's AI content analysis
    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
      colors: true,
      faces: true,
      quality_analysis: true,
      accessibility_analysis: true
    });

    return {
      faces: result.faces || [],
      colors: result.colors || [],
      metadata: result.image_metadata || {},
      quality: result.quality_analysis || {},
      accessibility: result.accessibility_analysis || {},
      moderation: result.moderation || []
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    return null;
  }
};

export default {
  ImageTransformations,
  ResponsiveImageSets,
  getOptimizedImageUrl,
  generateResponsiveSrcSet,
  getWatermarkedImageUrl,
  getAIEnhancedImageUrl,
  analyzeImageContent
};
