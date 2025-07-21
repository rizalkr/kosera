import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../../src/app/api/kos/recommendations/route';
import { createMockRequest, parseResponse } from '../helpers';

// Mock the database
const mockDbFrom = vi.fn();
const mockDbSelect = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: mockDbFrom,
    }),
  },
  kos: {},
  posts: {},
  users: {},
}));

// Mock drizzle-orm functions
vi.mock('drizzle-orm', () => ({
  desc: vi.fn(),
  sql: vi.fn(() => ({ as: vi.fn() })),
  eq: vi.fn(),
  and: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
}));

describe('KOS Recommendations API (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/kos/recommendations', () => {
    it('should return recommendations with default parameters', async () => {
      // Mock database response for count query
      const mockCountQuery = {
        from: () => ({
          innerJoin: () => ({
            where: vi.fn().mockResolvedValue([{ count: 5 }]),
          }),
        }),
      };

      // Mock database response for recommendations query  
      const mockRecommendationsQuery = {
        from: () => ({
          innerJoin: () => ({
            innerJoin: () => ({
              where: () => ({
                orderBy: () => ({
                  limit: () => ({
                    offset: vi.fn().mockResolvedValue([
                      {
                        id: 1,
                        postId: 1,
                        name: 'Test Kos 1',
                        address: 'Test Address 1',
                        city: 'Jakarta',
                        facilities: 'WiFi, AC',
                        latitude: -6.2088,
                        longitude: 106.8456,
                        title: 'Test Kos 1',
                        description: 'Test Description 1',
                        price: 500000,
                        isFeatured: true,
                        viewCount: 100,
                        favoriteCount: 10,
                        averageRating: '4.5',
                        reviewCount: 20,
                        photoCount: 5,
                        qualityScore: 85.5,
                        owner: {
                          id: 1,
                          name: 'Test Owner',
                          username: 'testowner',
                          contact: 'owner@test.com',
                        },
                      },
                    ]),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      mockDbFrom
        .mockReturnValueOnce(mockCountQuery.from())
        .mockReturnValueOnce(mockRecommendationsQuery.from());

      const url = 'http://localhost:3000/api/kos/recommendations';
      const request = createMockRequest('GET', undefined, {}, url);

      const response = await GET(request);
      const result = await parseResponse(response);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('data');
      expect(result.data.data).toHaveProperty('recommendations');
      expect(result.data.data).toHaveProperty('pagination');
      expect(Array.isArray(result.data.data.recommendations)).toBe(true);
    });

    it('should validate limit parameter', async () => {
      const url = 'http://localhost:3000/api/kos/recommendations?limit=invalid';
      const request = createMockRequest('GET', undefined, {}, url);

      const response = await GET(request);
      const result = await parseResponse(response);

      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('success', false);
      expect(result.data).toHaveProperty('error');
    });

    it('should validate price range', async () => {
      const url = 'http://localhost:3000/api/kos/recommendations?min_price=2000000&max_price=500000';
      const request = createMockRequest('GET', undefined, {}, url);

      const response = await GET(request);
      const result = await parseResponse(response);

      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('success', false);
      expect(result.data.error).toContain('min_price must be less than max_price');
    });

    it('should accept city filter', async () => {
      // Mock valid responses
      const mockQuery = {
        from: () => ({
          innerJoin: () => ({
            where: vi.fn().mockResolvedValue([{ count: 0 }]),
            innerJoin: () => ({
              where: () => ({
                orderBy: () => ({
                  limit: () => ({
                    offset: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      mockDbFrom.mockReturnValue(mockQuery.from());

      const url = 'http://localhost:3000/api/kos/recommendations?city=Jakarta';
      const request = createMockRequest('GET', undefined, {}, url);

      const response = await GET(request);
      const result = await parseResponse(response);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
    });

    it('should accept price range filters', async () => {
      // Mock valid responses
      const mockQuery = {
        from: () => ({
          innerJoin: () => ({
            where: vi.fn().mockResolvedValue([{ count: 0 }]),
            innerJoin: () => ({
              where: () => ({
                orderBy: () => ({
                  limit: () => ({
                    offset: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      mockDbFrom.mockReturnValue(mockQuery.from());

      const url = 'http://localhost:3000/api/kos/recommendations?min_price=500000&max_price=2000000';
      const request = createMockRequest('GET', undefined, {}, url);

      const response = await GET(request);
      const result = await parseResponse(response);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
    });
  });
});
