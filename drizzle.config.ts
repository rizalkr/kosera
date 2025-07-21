import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables based on context
// For local development, prioritize .env.local
// For Docker, use .env
if (!process.env.DATABASE_URL) {
  // Try loading .env.local first (for local development)
  const localResult = config({ path: '.env.local' });
  
  // If .env.local doesn't have DATABASE_URL, try .env (for Docker)
  if (!process.env.DATABASE_URL) {
    config({ path: '.env' });
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env.local or .env file.');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
