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
  // Ensure we are pointing to an isolated docker test DB (convention: host db_test service or port 5433 or db name contains _test)
  const lower = url.toLowerCase();
  const isTestDb = /_test|test|5433/.test(lower);
  if (!isTestDb) {
    console.warn('[resetDatabase] DATABASE_URL does not look like a dedicated test database. Proceeding but be careful.');
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
