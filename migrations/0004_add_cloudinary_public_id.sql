-- Migration: Add cloudinary_public_id to kos_photos table
-- Date: 2025-01-22

ALTER TABLE kos_photos 
ADD COLUMN cloudinary_public_id TEXT;

-- Add comment to the column
COMMENT ON COLUMN kos_photos.cloudinary_public_id IS 'Cloudinary public ID for image management';
