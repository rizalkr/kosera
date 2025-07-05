import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestUser, cleanupTestData } from '../utils/mock-factory';
import { db } from '@/db';
import { users, posts, kos } from '@/db/schema';

describe('Search API Integration Tests', () => {
  let baseUrl: string;
  let sellerUser: any;
  
  beforeAll(async () => {
    baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    
    // Create test user and sample data
    sellerUser = await createTestUser('integration_seller', 'SELLER');
    
    // Create sample kos data for integration testing
    const kosTestData = [
      {
        title: 'Integration Test Kos Premium',
        description: 'Premium kos for integration testing',
        price: 800000,
        name: 'Test Kos Premium',
        address: 'Jl. Test Premium No. 1',
        city: 'Jakarta',
        facilities: 'AC, WiFi, Kamar Mandi Dalam',
        latitude: -6.2088,
        longitude: 106.8456,
        averageRating: '4.5',
        reviewCount: 15,
        viewCount: 100,
        favoriteCount: 20,
        photoCount: 6,
        isFeatured: true
      },
      {
        title: 'Integration Test Kos Budget',
        description: 'Budget kos for integration testing',
        price: 350000,
        name: 'Test Kos Budget',
        address: 'Jl. Test Budget No. 2',
        city: 'Bandung',
        facilities: 'WiFi, Kamar Mandi Luar',
        latitude: -6.8951,
        longitude: 107.6134,
        averageRating: '3.8',
        reviewCount: 8,
        viewCount: 50,
        favoriteCount: 5,
        photoCount: 3,
        isFeatured: false
      }
    ];

    // Insert test data
    for (const kosData of kosTestData) {
      const [post] = await db.insert(posts).values({
        userId: sellerUser.id,
        title: kosData.title,
        description: kosData.description,
        price: kosData.price,
        averageRating: kosData.averageRating,
        reviewCount: kosData.reviewCount,
        viewCount: kosData.viewCount,
        favoriteCount: kosData.favoriteCount,
        photoCount: kosData.photoCount,
        isFeatured: kosData.isFeatured
      }).returning();

      await db.insert(kos).values({
        postId: post.id,
        name: kosData.name,
        address: kosData.address,
        city: kosData.city,
        facilities: kosData.facilities,
        latitude: kosData.latitude,
        longitude: kosData.longitude
      });
    }
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('HTTP Integration Tests', () => {
    it('should search kos via HTTP GET request', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?q=Integration`);
      
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.results.length).toBeGreaterThan(0);
      
      // Verify response contains search term
      const hasSearchTerm = data.data.results.some((result: any) => 
        result.title.includes('Integration') || 
        result.description.includes('Integration')
      );
      expect(hasSearchTerm).toBe(true);
    });

    it('should filter by city via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?city=Jakarta`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(result.city).toBe('Jakarta');
      });
    });

    it('should filter by price range via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?min_price=300000&max_price=500000`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(result.price).toBeGreaterThanOrEqual(300000);
        expect(result.price).toBeLessThanOrEqual(500000);
      });
    });

    it('should filter by rating via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?min_rating=4.0`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(parseFloat(result.averageRating)).toBeGreaterThanOrEqual(4.0);
      });
    });

    it('should paginate results via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?limit=1&page=1`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.pagination.limit).toBe(1);
      expect(data.data.pagination.currentPage).toBe(1);
    });

    it('should sort results via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?sort=price_asc`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      if (data.data.results.length > 1) {
        const prices = data.data.results.map((r: any) => r.price);
        expect(prices).toEqual([...prices].sort((a, b) => a - b));
      }
    });

    it('should handle complex search via HTTP', async () => {
      const params = new URLSearchParams({
        q: 'Test',
        city: 'Jakarta',
        min_price: '500000',
        max_price: '1000000',
        min_rating: '4.0',
        sort: 'rating',
        limit: '10',
        page: '1'
      });
      
      const response = await fetch(`${baseUrl}/api/kos/search?${params.toString()}`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.filters).toMatchObject({
        query: 'Test',
        city: 'Jakarta',
        minPrice: 500000,
        maxPrice: 1000000,
        minRating: 4.0,
        sortBy: 'rating'
      });
    });

    it('should return 400 for invalid pagination via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?page=0&limit=100`);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid pagination parameters');
    });

    it('should handle facilities filter via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?facilities=WiFi`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(result.facilities).toContain('WiFi');
      });
    });

    it('should include all required response fields via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('results');
      expect(data.data).toHaveProperty('pagination');
      expect(data.data).toHaveProperty('filters');
      
      if (data.data.results.length > 0) {
        const result = data.data.results[0];
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('address');
        expect(result).toHaveProperty('city');
        expect(result).toHaveProperty('price');
        expect(result).toHaveProperty('averageRating');
        expect(result).toHaveProperty('owner');
        expect(result.owner).toHaveProperty('id');
        expect(result.owner).toHaveProperty('name');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await fetch(`${baseUrl}/api/kos/search?q=Test&sort=quality`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.ok).toBe(true);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        fetch(`${baseUrl}/api/kos/search?page=${i + 1}&limit=2`)
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
      
      const dataArray = await Promise.all(
        responses.map(response => response.json())
      );
      
      dataArray.forEach(data => {
        expect(data.success).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search results gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?q=NonExistentSearchTerm12345`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(0);
      expect(data.data.pagination.totalCount).toBe('0');
    });

    it('should handle special characters in search', async () => {
      const response = await fetch(`${baseUrl}/api/kos/search?q=${encodeURIComponent('Test & Premium')}`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      // Should not crash and should return proper response structure
      expect(data.data).toHaveProperty('results');
      expect(data.data).toHaveProperty('pagination');
    });

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(1000);
      const response = await fetch(`${baseUrl}/api/kos/search?q=${encodeURIComponent(longQuery)}`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.filters.query).toBe(longQuery);
    });
  });
});
