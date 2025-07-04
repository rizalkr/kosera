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
});

// Kos table
export const kos = pgTable('kos', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).unique().notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  facilities: text('facilities'),
  // Geospatial coordinates (optional)
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Kos = typeof kos.$inferSelect;
export type NewKos = typeof kos.$inferInsert;
