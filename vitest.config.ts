import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup/global.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.next', 'tests/api/kos-recommendations.test.ts', 'tests/api/kos-endpoints.test.ts', 'tests/api/admin-analytics.test.ts'],
    testTimeout: 30000,
    // Use single fork to avoid conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Isolate tests to prevent interference
    isolate: true,
    // Run tests sequentially to avoid port conflicts
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
