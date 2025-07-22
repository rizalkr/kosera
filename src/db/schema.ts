import { pgTable, serial, text, integer, timestamp, pgEnum, boolean, decimal, doublePrecision } from 'drizzle-orm/pg-core';

// Enum untuk user role
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'SELLER', 'RENTER']);

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').unique().notNull(),
  contact: text('contact').notNull(),
  role: userRoleEnum('role').default('RENTER').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Soft delete fields
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by'),
  // Admin tracking fields (who created this user)
  createdBy: integer('created_by'),
});

// Post table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  totalPost: integer('total_post').default(0).notNull(),
  totalPenjualan: integer('total_penjualan').default(0).notNull(),
  // New columns for recommendation system
  isFeatured: boolean('is_featured').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  favoriteCount: integer('favorite_count').default(0).notNull(),
  averageRating: decimal('average_rating', { precision: 2, scale: 1 }).default('0.0').notNull(),
  reviewCount: integer('review_count').default(0).notNull(),
  photoCount: integer('photo_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // Soft delete fields
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by'),
});

// Kos table
export const kos = pgTable('kos', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).unique().notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  facilities: text('facilities'),
  totalRooms: integer('total_rooms').notNull().default(1),
  occupiedRooms: integer('occupied_rooms').default(0),
  // Geospatial coordinates (optional)
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  // Soft delete fields for kos
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by'),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  kosId: integer('kos_id').references(() => kos.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5 rating
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Favorites table
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  kosId: integer('kos_id').references(() => kos.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Photos table for kos
export const kosPhotos = pgTable('kos_photos', {
  id: serial('id').primaryKey(),
  kosId: integer('kos_id').references(() => kos.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id'), // For Cloudinary integration
  caption: text('caption'),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  kosId: integer('kos_id').references(() => kos.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  checkInDate: timestamp('check_in_date').notNull(),
  checkOutDate: timestamp('check_out_date'),
  duration: integer('duration').notNull(), // in months
  totalPrice: integer('total_price').notNull(),
  status: text('status').default('pending').notNull(), // pending, confirmed, cancelled, completed
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Kos = typeof kos.$inferSelect;
export type NewKos = typeof kos.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export type KosPhoto = typeof kosPhotos.$inferSelect;
export type NewKosPhoto = typeof kosPhotos.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
