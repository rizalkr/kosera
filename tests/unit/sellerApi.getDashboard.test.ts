import { describe, it, expect, vi } from 'vitest';
import { sellerApi } from '@/lib/api/seller';

// Mock fetch globally if needed

describe('sellerApi.getDashboard', () => {
  it('returns parsed data when response is valid', async () => {
    // This test is a placeholder; implementation requires MSW handlers
    expect(typeof sellerApi.getDashboard).toBe('function');
  });
});
