import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryTransformationOptions } from '@/types/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File buffer or path
 * @param folder - Cloudinary folder name (optional)
 * @param transformation - Cloudinary transformation options (optional)
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  file: Buffer | string,
  folder?: string,
  transformation?: CloudinaryTransformationOptions
): Promise<CloudinaryUploadResult> => {
  try {
    const options = {
      resource_type: 'image' as const,
      folder: folder || 'kos-photos',
      quality: 'auto' as const,
      fetch_format: 'auto' as const,
      ...transformation,
    };

    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
      options
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Promise with deletion result
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param transformation - Transformation options
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  }
): string => {
  if (!publicId) return '';

  const options = {
    quality: 'auto' as const,
    fetch_format: 'auto' as const,
    ...transformation,
  };

  return cloudinary.url(publicId, options);
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary image URL
 * @returns Public ID or null
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

export default cloudinary;
