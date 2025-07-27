import { useState, useEffect } from 'react';

interface ImageWithFallbackOptions {
  src: string;
  fallbackSrc: string;
}

export const useImageWithFallback = ({ src, fallbackSrc }: ImageWithFallbackOptions) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    // Reset when src changes
    setImageSrc(src);
    setIsError(false);
    
    // Validate if URL is accessible (for external URLs)
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      // Check if the URL is from a known problematic domain
      if (src.includes('example.com') || src.includes('placeholder.com')) {
        setImageSrc(fallbackSrc);
        setIsError(true);
        return;
      }
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!isError) {
      setImageSrc(fallbackSrc);
      setIsError(true);
    }
  };

  return {
    src: imageSrc,
    onError: handleError,
    isError,
  };
};

// Helper function to validate and clean image URLs
export const validateImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Remove any problematic URLs
  const problematicDomains = ['example.com', 'placeholder.com', 'test.com'];
  const lowerUrl = url.toLowerCase();
  
  if (problematicDomains.some(domain => lowerUrl.includes(domain))) {
    return null;
  }
  
  // Validate URL format
  try {
    if (url.startsWith('/')) {
      // Local path - valid
      return url;
    }
    
    new URL(url);
    return url;
  } catch {
    return null;
  }
};

// Hook specifically for kos photos with multiple fallbacks
export const useKosImages = (photos: Array<{ url: string; isPrimary: boolean; createdAt: string }>) => {
  const fallbackImages = [
    '/images/rooms/room1.jpg',
    '/images/rooms/room2.jpg', 
    '/images/rooms/room3.jpg',
    '/images/rooms/room4.jpg',
  ];

  const validPhotos = photos
    .map(photo => ({ ...photo, url: validateImageUrl(photo.url) }))
    .filter(photo => photo.url !== null);

  // If we have valid photos, use them; otherwise use fallback
  const displayImages = validPhotos.length > 0 
    ? validPhotos.map(photo => photo.url as string)
    : fallbackImages;

  return {
    images: displayImages,
    hasValidPhotos: validPhotos.length > 0,
    originalPhotosCount: photos.length,
    validPhotosCount: validPhotos.length,
  };
};
