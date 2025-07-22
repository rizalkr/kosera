# Cloudinary Integration Guide

This guide explains how to set up and use Cloudinary for image management in the Kosera application.

## Overview

The application has been integrated with Cloudinary to handle image uploads, storage, and optimization. Instead of storing images locally, all photos are now uploaded to Cloudinary and only the URLs are stored in the database.

## Setup Instructions

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. After registration, you'll get access to your dashboard with the following credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Replace the placeholder values with your actual Cloudinary credentials from the dashboard.

### 3. Database Migration

Run the database migration to add the new `cloudinary_public_id` column:

```bash
npx drizzle-kit push
```

This adds a new column to the `kos_photos` table to store Cloudinary public IDs for easier image management.

## Features

### 1. Image Upload
- Images are automatically uploaded to Cloudinary when users upload photos
- Images are organized in folders: `kos-photos/kos-{kosId}/`
- Automatic image optimization (quality: auto, format: auto)
- Resizing to maximum 1200x800 pixels to save bandwidth

### 2. Image Management
- Automatic deletion from Cloudinary when photos are removed from the database
- Support for both new Cloudinary images and legacy local images
- Fallback handling for images without Cloudinary public IDs

### 3. Image Optimization
- Automatic format conversion (WebP when supported)
- Quality optimization based on content
- Responsive image delivery
- CDN distribution for fast loading

## API Changes

### Upload Endpoint: `POST /api/kos/[id]/photos/upload`

**Before (Local Storage):**
- Files saved to `public/images/rooms/`
- URLs stored as `/images/rooms/filename.jpg`

**After (Cloudinary):**
- Files uploaded to Cloudinary
- URLs stored as `https://res.cloudinary.com/...`
- Public IDs stored in `cloudinary_public_id` column

### Delete Endpoint: `DELETE /api/kos/[id]/photos`

**Enhanced with Cloudinary:**
- Automatically deletes images from Cloudinary when removed from database
- Handles both Cloudinary images and legacy local images
- Graceful error handling if Cloudinary deletion fails

## File Structure

```
src/
├── lib/
│   ├── cloudinary.ts          # Cloudinary utility functions
│   └── upload.ts              # File upload helpers
├── app/api/kos/[id]/photos/
│   ├── upload/route.ts        # Upload endpoint (updated)
│   └── route.ts               # Photo management (updated)
└── components/
    └── PhotoUploadForm.tsx    # Frontend upload component
```

## Utility Functions

### `src/lib/cloudinary.ts`

- `uploadToCloudinary()` - Upload image with transformations
- `deleteFromCloudinary()` - Delete image by public ID
- `getOptimizedImageUrl()` - Generate optimized image URLs
- `extractPublicIdFromUrl()` - Extract public ID from Cloudinary URLs

### `src/lib/upload.ts`

- `parseFormData()` - Parse multipart form data in Next.js
- `validateImageFile()` - Validate image files (size, type)

## Image Transformations

Default transformations applied to uploaded images:

```javascript
{
  width: 1200,
  height: 800,
  crop: 'limit',        // Don't upscale, just limit max dimensions
  quality: 'auto:good', // Automatic quality optimization
  format: 'auto'        // Automatic format selection
}
```

## Migration from Local Storage

### For Existing Images

Existing local images will continue to work. The system handles both:
- New Cloudinary images (with `cloudinary_public_id`)
- Legacy local images (without `cloudinary_public_id`)

### Migration Script (Optional)

You can create a migration script to move existing local images to Cloudinary:

```javascript
// Example migration function
async function migrateLocalImagesToCloudinary() {
  const localImages = await db
    .select()
    .from(kosPhotos)
    .where(isNull(kosPhotos.cloudinaryPublicId));

  for (const image of localImages) {
    if (image.url.startsWith('/images/')) {
      // Upload local image to Cloudinary
      // Update database with new URL and public ID
    }
  }
}
```

## Security Considerations

1. **API Keys**: Keep your Cloudinary credentials secure and never expose them in client-side code
2. **Upload Validation**: File validation is performed server-side before upload
3. **Authentication**: Only authenticated users can upload photos
4. **Ownership**: Users can only upload photos to their own kos listings

## Monitoring and Limits

### Free Tier Limits (Cloudinary)
- 25 GB storage
- 25 GB monthly bandwidth
- 1,000 transformations per month

### Recommendations
- Monitor usage in Cloudinary dashboard
- Consider upgrading plan if limits are exceeded
- Implement image compression before upload if needed

## Troubleshooting

### Common Issues

1. **Upload Fails with 401 Error**
   - Check if Cloudinary credentials are correct
   - Verify environment variables are loaded

2. **Images Not Displaying**
   - Check if URLs are properly stored in database
   - Verify Cloudinary account is active

3. **Slow Upload Times**
   - Consider reducing image size before upload
   - Check internet connection

### Debug Mode

Enable debug logging by adding to your environment:

```bash
CLOUDINARY_DEBUG=true
```

## Performance Optimization

1. **Image Optimization**: Cloudinary automatically optimizes images
2. **CDN**: Global CDN distribution for fast loading
3. **Lazy Loading**: Consider implementing lazy loading for image galleries
4. **Responsive Images**: Use Cloudinary's responsive image features

## Next Steps

1. Set up your Cloudinary account
2. Configure environment variables
3. Run the database migration
4. Test image upload functionality
5. Monitor usage and performance

For more information, refer to the [Cloudinary Documentation](https://cloudinary.com/documentation).
