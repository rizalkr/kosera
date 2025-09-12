import { beforeAll, afterAll, beforeEach } from 'vitest';
import './env';
import { resetDatabase, closeDatabase } from './db';

beforeAll(async () => {
  // Optionally run migrations here if needed
});

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
