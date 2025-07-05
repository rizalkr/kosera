import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as searchKos } from '@/app/api/kos/search/route';
import { createTestUser, cleanupTestData } from '../utils/mock-factory';
import { db } from '@/db';
import { users, posts, kos } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Helper function to create a test request
function createSearchRequest(params: Record<string, string> = {}): NextRequest {
  const searchParams = new URLSearchParams(params);
  const url = `http://localhost:3000/api/kos/search?${searchParams.toString()}`;
  return new NextRequest(url, { method: 'GET' });
}

describe('Kos Search API Integration Tests', () => {
  let testUser: any;
  let testKosIds: number[] = [];

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('search_integration', 'SELLER');
  });

  beforeEach(async () => {
    // Clean up existing test data
    await db.delete(kos).execute();
    await db.delete(posts).where(eq(posts.userId, testUser.id)).execute();
    testKosIds = [];

    // Create fresh test data for each test
    const testData = [
      {
        title: 'Kos Premium Jakarta Selatan',
        description: 'Kos mewah dengan fasilitas lengkap',
        price: 1000000,
        name: 'Kos Mawar Premium',
        address: 'Jl. Senopati No. 10',
        city: 'Jakarta',
        facilities: 'AC, WiFi, Kamar Mandi Dalam, Gym',
        averageRating: '4.7',
        reviewCount: 15,
        viewCount: 120,
        favoriteCount: 30,
        photoCount: 10,
        isFeatured: true
      },
      {
        title: 'Kos Budget Mahasiswa Bandung',
        description: 'Kos ekonomis untuk mahasiswa',
        price: 400000,
        name: 'Kos Sederhana',
        address: 'Jl. Dago No. 25',
        city: 'Bandung',
        facilities: 'WiFi, Kamar Mandi Luar',
        averageRating: '3.5',
        reviewCount: 8,
        viewCount: 60,
        favoriteCount: 12,
        photoCount: 4,
        isFeatured: false
      }
    ];

    for (const data of testData) {
      const [post] = await db.insert(posts).values({
        userId: testUser.id,
        title: data.title,
        description: data.description,
        price: data.price,
        averageRating: data.averageRating,
        reviewCount: data.reviewCount,
        viewCount: data.viewCount,
        favoriteCount: data.favoriteCount,
        photoCount: data.photoCount,
        isFeatured: data.isFeatured
      }).returning();

      const [kosRecord] = await db.insert(kos).values({
        postId: post.id,
        name: data.name,
        address: data.address,
        city: data.city,
        facilities: data.facilities,
        latitude: -6.2088,
        longitude: 106.8456
      }).returning();

      testKosIds.push(kosRecord.id);
    }
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Real Database Operations', () => {
    it('should perform text search across multiple fields', async () => {
      const request = createSearchRequest({ q: 'Premium' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].title).toContain('Premium');
    });

    it('should filter by city correctly', async () => {
      const request = createSearchRequest({ city: 'Jakarta' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].city).toBe('Jakarta');
    });

    it('should filter by price range', async () => {
      const request = createSearchRequest({ min_price: '500000', max_price: '1500000' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].price).toBe(1000000);
    });

    it('should filter by facilities', async () => {
      const request = createSearchRequest({ facilities: 'AC' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].facilities).toContain('AC');
    });

    it('should filter by minimum rating', async () => {
      const request = createSearchRequest({ min_rating: '4.0' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(parseFloat(data.data.results[0].averageRating)).toBeGreaterThanOrEqual(4.0);
    });

    it('should sort results correctly', async () => {
      const request = createSearchRequest({ sort: 'price_asc' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(2);
      expect(data.data.results[0].price).toBe(400000);
      expect(data.data.results[1].price).toBe(1000000);
    });

    it('should handle pagination correctly', async () => {
      const request = createSearchRequest({ limit: '1', page: '1' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.pagination.currentPage).toBe(1);
      expect(data.data.pagination.totalPages).toBe(2);
      expect(data.data.pagination.hasNextPage).toBe(true);
      expect(data.data.pagination.hasPrevPage).toBe(false);
    });

    it('should calculate quality score correctly', async () => {
      const request = createSearchRequest({ sort: 'quality' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Premium kos should have higher quality score
      const premiumKos = data.data.results.find((r: any) => r.title.includes('Premium'));
      const budgetKos = data.data.results.find((r: any) => r.title.includes('Budget'));
      
      expect(parseFloat(premiumKos.qualityScore)).toBeGreaterThan(parseFloat(budgetKos.qualityScore));
    });

    it('should include owner information in results', async () => {
      const request = createSearchRequest();
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const result = data.data.results[0];
      expect(result.owner).toBeDefined();
      expect(result.owner.id).toBe(testUser.id);
      expect(result.owner.username).toBe(testUser.username);
      expect(result.owner.name).toBe(testUser.name);
      expect(result.owner.contact).toBe(testUser.contact);
    });

    it('should handle combined filters', async () => {
      const request = createSearchRequest({
        q: 'Kos',
        city: 'Jakarta',
        min_price: '500000',
        facilities: 'AC',
        min_rating: '4.0',
        sort: 'rating'
      });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      
      const result = data.data.results[0];
      expect(result.city).toBe('Jakarta');
      expect(result.price).toBeGreaterThanOrEqual(500000);
      expect(result.facilities).toContain('AC');
      expect(parseFloat(result.averageRating)).toBeGreaterThanOrEqual(4.0);
    });

    it('should return empty results when no matches found', async () => {
      const request = createSearchRequest({ city: 'NonExistentCity' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(0);
      expect(data.data.pagination.totalCount).toBe(0);
    });

    it('should handle case-insensitive search', async () => {
      const request = createSearchRequest({ q: 'premium' }); // lowercase
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].title).toContain('Premium');
    });

    it('should validate and handle edge cases for pagination', async () => {
      // Test page beyond available results
      const request = createSearchRequest({ page: '10', limit: '5' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(0);
      expect(data.data.pagination.currentPage).toBe(10);
      expect(data.data.pagination.hasNextPage).toBe(false);
      expect(data.data.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle special characters in search query', async () => {
      const request = createSearchRequest({ q: 'Kos & Premium' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle empty search query', async () => {
      const request = createSearchRequest({ q: '' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(2); // All results
    });

    it('should handle invalid sort parameter', async () => {
      const request = createSearchRequest({ sort: 'invalid_sort' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should default to quality sort
      expect(data.data.filters.sortBy).toBe('invalid_sort');
    });

    it('should handle very long search query', async () => {
      const longQuery = 'a'.repeat(1000);
      const request = createSearchRequest({ q: longQuery });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle multiple facility filters correctly', async () => {
      const request = createSearchRequest({ facilities: 'AC,WiFi,Gym' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should only return kos that have ALL specified facilities
      data.data.results.forEach((result: any) => {
        expect(result.facilities).toContain('AC');
        expect(result.facilities).toContain('WiFi');
        expect(result.facilities).toContain('Gym');
      });
    });
  });
});
