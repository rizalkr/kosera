CREATE TABLE "bookings" (
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
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"kos_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kos_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"kos_id" integer NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"kos_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kos" ADD COLUMN "total_rooms" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "kos" ADD COLUMN "occupied_rooms" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "public"."kos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "public"."kos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kos_photos" ADD CONSTRAINT "kos_photos_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "public"."kos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_kos_id_kos_id_fk" FOREIGN KEY ("kos_id") REFERENCES "public"."kos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;