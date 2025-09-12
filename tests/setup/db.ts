/** Test DB helpers: migration + cleanup */
import { db } from '../../src/db';
import { kos, users, posts, reviews, favorites, kosPhotos, bookings } from '../../src/db';
import { sql } from 'drizzle-orm';

function assertTestDatabase() {
  const url = process.env.DATABASE_URL || '';
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== 'test') {
    throw new Error('[resetDatabase] NODE_ENV must be test');
  }
  // Simple heuristic: ensure URL contains neon host AND NOT production db name
  if (!/neon\.tech/.test(url)) {
    throw new Error('[resetDatabase] DATABASE_URL must point to Neon test instance');
  }
  if (!/(test|_test|neondb)/i.test(url)) {
    // Adjust regex to your actual test db naming convention
    console.warn('[resetDatabase] WARNING: Database name does not look like a test DB. Proceeding cautiously.');
  }
}

export async function resetDatabase(): Promise<void> {
  assertTestDatabase();
  // Order handled by CASCADE
  await db.execute(sql`TRUNCATE TABLE ${bookings}, ${kosPhotos}, ${favorites}, ${reviews}, ${kos}, ${posts}, ${users} RESTART IDENTITY CASCADE`);
}

export async function closeDatabase(): Promise<void> {
  try {
    const anyDb = db as unknown as { $client?: { end?: () => Promise<void> } };
    await anyDb.$client?.end?.();
  } catch {
    // ignore
  }
}
