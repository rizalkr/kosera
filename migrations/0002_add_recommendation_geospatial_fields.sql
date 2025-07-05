-- Migration: Add recommendation and geospatial fields
-- Created: 2025-07-04

-- Add new columns to posts table for recommendation system
ALTER TABLE posts 
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN view_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN favorite_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0.0 NOT NULL,
ADD COLUMN review_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN photo_count INTEGER DEFAULT 0 NOT NULL;

-- Add geospatial coordinates to kos table
ALTER TABLE kos 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Create indexes for better query performance
CREATE INDEX idx_posts_is_featured ON posts(is_featured);
CREATE INDEX idx_posts_view_count ON posts(view_count);
CREATE INDEX idx_posts_average_rating ON posts(average_rating);
CREATE INDEX idx_posts_favorite_count ON posts(favorite_count);
CREATE INDEX idx_kos_coordinates ON kos(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create a composite index for quality score calculation
CREATE INDEX idx_posts_quality_score ON posts(average_rating, review_count, favorite_count, photo_count, view_count);

-- Update existing records with sample data for testing
UPDATE posts SET photo_count = 1 WHERE photo_count = 0;
UPDATE posts SET is_featured = TRUE WHERE id % 5 = 0; -- Mark every 5th post as featured
