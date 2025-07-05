-- Add missing tables for reviews, favorites, photos, and bookings
-- This migration adds the remaining tables needed for the complete Kosera API

-- Reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"kos_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Favorites table
CREATE TABLE IF NOT EXISTS "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"kos_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Kos photos table
CREATE TABLE IF NOT EXISTS "kos_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"kos_id" integer NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Bookings table
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"kos_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"check_in_date" timestamp NOT NULL,
	"check_out_date" timestamp,
	"duration" integer NOT NULL,
	"total_price" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ 
BEGIN
	-- Reviews foreign keys
	IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_kos_id_kos_id_fk') THEN
		ALTER TABLE "reviews" ADD CONSTRAINT "reviews_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "kos"("id") ON DELETE cascade;
	END IF;
	
	IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reviews_user_id_users_id_fk') THEN
		ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
	END IF;

	-- Favorites foreign keys
	IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'favorites_user_id_users_id_fk') THEN
		ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
	END IF;
	
	IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'favorites_kos_id_kos_id_fk') THEN
		ALTER TABLE "favorites" ADD CONSTRAINT "favorites_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "kos"("id") ON DELETE cascade;
	END IF;

	-- Kos photos foreign keys
	IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'kos_photos_kos_id_kos_id_fk') THEN
		ALTER TABLE "kos_photos" ADD CONSTRAINT "kos_photos_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "kos"("id") ON DELETE cascade;
	END IF;

	-- Bookings foreign keys
	IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookings_kos_id_kos_id_fk') THEN
		ALTER TABLE "bookings" ADD CONSTRAINT "bookings_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "kos"("id") ON DELETE cascade;
	END IF;
	
	IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookings_user_id_users_id_fk') THEN
		ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
	END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "reviews_kos_id_idx" ON "reviews" ("kos_id");
CREATE INDEX IF NOT EXISTS "reviews_user_id_idx" ON "reviews" ("user_id");
CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews" ("rating");

CREATE INDEX IF NOT EXISTS "favorites_user_id_idx" ON "favorites" ("user_id");
CREATE INDEX IF NOT EXISTS "favorites_kos_id_idx" ON "favorites" ("kos_id");
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_user_kos_unique" ON "favorites" ("user_id", "kos_id");

CREATE INDEX IF NOT EXISTS "kos_photos_kos_id_idx" ON "kos_photos" ("kos_id");
CREATE INDEX IF NOT EXISTS "kos_photos_primary_idx" ON "kos_photos" ("is_primary");

CREATE INDEX IF NOT EXISTS "bookings_kos_id_idx" ON "bookings" ("kos_id");
CREATE INDEX IF NOT EXISTS "bookings_user_id_idx" ON "bookings" ("user_id");
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings" ("status");
CREATE INDEX IF NOT EXISTS "bookings_dates_idx" ON "bookings" ("check_in_date", "check_out_date");
