import { describe, it, expect } from 'vitest';
import { buildPaginationMeta } from '@/lib/pagination';

// Adjusted to match actual helper name buildPaginationMeta

describe('Pagination Helper', () => {
  it('computes totalPages and navigation flags', () => {
    const meta = buildPaginationMeta({ page: 2, limit: 10, total: 45 });
    expect(meta).toEqual({
      page: 2,
      limit: 10,
      total: 45,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('handles empty dataset (total 0)', () => {
    const meta = buildPaginationMeta({ page: 1, limit: 10, total: 0 });
    expect(meta.totalPages).toBe(1); // function defaults to at least 1
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(false);
  });
});
