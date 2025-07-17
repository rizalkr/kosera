import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create postgres connection
let client: postgres.Sql;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if available (Docker environment)
  client = postgres(process.env.DATABASE_URL, {
    prepare: false,
  });
} else {
  // Use individual env vars for local development
  client = postgres({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DATABASE || 'kosera',
    prepare: false,
  });
}

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from './schema';
