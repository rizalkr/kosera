-- Migration: Add totalRooms and occupiedRooms to kos table
-- Date: 2025-07-14

-- Add totalRooms column (required, default 1)
ALTER TABLE kos ADD COLUMN total_rooms INTEGER NOT NULL DEFAULT 1;

-- Add occupiedRooms column (optional, default 0)
ALTER TABLE kos ADD COLUMN occupied_rooms INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE kos ADD CONSTRAINT kos_total_rooms_positive CHECK (total_rooms > 0);
ALTER TABLE kos ADD CONSTRAINT kos_occupied_rooms_non_negative CHECK (occupied_rooms >= 0);
ALTER TABLE kos ADD CONSTRAINT kos_occupied_rooms_not_exceed_total CHECK (occupied_rooms <= total_rooms);

-- Update existing records to have default values
UPDATE kos SET total_rooms = 1, occupied_rooms = 0 WHERE total_rooms IS NULL OR occupied_rooms IS NULL;
