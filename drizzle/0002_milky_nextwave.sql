DO $$ BEGIN
    ALTER TABLE "kos" ADD COLUMN "deleted_at" timestamp;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "kos" ADD COLUMN "deleted_by" integer;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "posts" ADD COLUMN "deleted_at" timestamp;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "posts" ADD COLUMN "deleted_by" integer;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "deleted_by" integer;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "created_by" integer;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;