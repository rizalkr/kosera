/**
 * Test environment bootstrap.
 * Loads .env.test or .env.local variables needed for DB + JWT, etc.
 */
import { config } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const candidates = ['.env.test', '.env.local', '.env'];
for (const file of candidates) {
  const full = path.join(process.cwd(), file);
  if (fs.existsSync(full)) {
    config({ path: full });
    break;
  }
}

// Minimal required vars assertion (adjust as needed)
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[test:env] Missing env var ${key}`);
  }
}
