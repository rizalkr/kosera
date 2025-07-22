import multer from 'multer';
import { NextRequest } from 'next/server';

// Configure multer for memory storage (since we'll upload to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/**
 * Parse multipart form data from Next.js request
 * This is a workaround since Next.js doesn't have built-in multer support
 */
export const parseFormData = async (request: NextRequest): Promise<{
  fields: Record<string, string>;
  files: MulterFile[];
}> => {
  try {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    const files: MulterFile[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file
        const buffer = Buffer.from(await value.arrayBuffer());
        files.push({
          fieldname: key,
          originalname: value.name,
          encoding: '7bit',
          mimetype: value.type,
          buffer: buffer,
          size: buffer.length,
        });
      } else {
        // Handle text field
        fields[key] = value as string;
      }
    }

    return { fields, files };
  } catch (error) {
    console.error('Error parsing form data:', error);
    throw new Error('Failed to parse form data');
  }
};

/**
 * Validate image file
 */
export const validateImageFile = (file: MulterFile): { isValid: boolean; error?: string } => {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { isValid: true };
};

export default upload;
