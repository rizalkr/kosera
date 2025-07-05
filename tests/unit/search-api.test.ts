import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as searchKos } from '@/app/api/kos/search/route';
import { createTestUser, cleanupTestData } from '../utils/mock-factory';
import { db } from '@/db';
import { users, posts, kos, reviews, favorites } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Helper function to create a test request
function createSearchRequest(params: Record<string, string> = {}): NextRequest {
  const searchParams = new URLSearchParams(params);
  const url = `http://localhost:3000/api/kos/search?${searchParams.toString()}`;
  return new NextRequest(url, { method: 'GET' });
}

describe('Kos Search API Unit Tests', () => {
  let sellerUser: any;
  let testKosData: any[] = [];

  beforeAll(async () => {
    // Create test user
    sellerUser = await createTestUser('search_seller', 'SELLER');
    
    // Create sample kos data for testing
    const kosTestData = [
      {
        title: 'Kos Putri Premium Jakarta',
        description: 'Kos nyaman dengan fasilitas lengkap di Jakarta Selatan',
        price: 800000,
        name: 'Kos Mawar Indah',
        address: 'Jl. Mawar No. 15, Kebayoran Baru',
        city: 'Jakarta',
        facilities: 'AC, WiFi, Kamar Mandi Dalam, Dapur Bersama',
        latitude: -6.2088,
        longitude: 106.8456,
        averageRating: '4.5',
        reviewCount: 20,
        viewCount: 150,
        favoriteCount: 25,
        photoCount: 8,
        isFeatured: true
      },
      {
        title: 'Kos Budget Friendly Bandung',
        description: 'Kos murah dan bersih untuk mahasiswa di Bandung',
        price: 350000,
        name: 'Kos Melati',
        address: 'Jl. Dipatiukur No. 20, Coblong',
        city: 'Bandung',
        facilities: 'WiFi, Kamar Mandi Luar, Parkir Motor',
        latitude: -6.8951,
        longitude: 107.6134,
        averageRating: '3.8',
        reviewCount: 12,
        viewCount: 80,
        favoriteCount: 10,
        photoCount: 4,
        isFeatured: false
      },
      {
        title: 'Kos Mewah Surabaya',
        description: 'Kos eksklusif dengan pemandangan kota Surabaya',
        price: 1200000,
        name: 'Kos Royal Palace',
        address: 'Jl. Raya Darmo No. 100, Wonokromo',
        city: 'Surabaya',
        facilities: 'AC, WiFi, Kamar Mandi Dalam, Gym, Swimming Pool, Laundry',
        latitude: -7.2575,
        longitude: 112.7521,
        averageRating: '4.8',
        reviewCount: 35,
        viewCount: 200,
        favoriteCount: 45,
        photoCount: 15,
        isFeatured: true
      },
      {
        title: 'Kos Ekonomis Yogyakarta',
        description: 'Kos sederhana dekat kampus UGM',
        price: 300000,
        name: 'Kos Kenanga',
        address: 'Jl. Kaliurang KM 5, Sleman',
        city: 'Yogyakarta',
        facilities: 'WiFi, Dapur Bersama, Parkir Motor',
        latitude: -7.7956,
        longitude: 110.3695,
        averageRating: '3.5',
        reviewCount: 8,
        viewCount: 45,
        favoriteCount: 5,
        photoCount: 3,
        isFeatured: false
      }
    ];

    // Insert test data
    for (const kosData of kosTestData) {
      // Create post first
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

      // Create kos
      const [kosRecord] = await db.insert(kos).values({
        postId: post.id,
        name: kosData.name,
        address: kosData.address,
        city: kosData.city,
        facilities: kosData.facilities,
        latitude: kosData.latitude,
        longitude: kosData.longitude
      }).returning();

      testKosData.push({ post, kos: kosRecord });
    }
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Basic Search Functionality', () => {
    it('should return all kos when no filters applied', async () => {
      const request = createSearchRequest();
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(4);
      expect(parseInt(data.data.pagination.totalCount)).toBe(4);
    });

    it('should return paginated results', async () => {
      const request = createSearchRequest({ limit: '2', page: '1' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(2);
      expect(data.data.pagination.currentPage).toBe(1);
      expect(data.data.pagination.totalPages).toBe(2);
      expect(data.data.pagination.hasNextPage).toBe(true);
    });

    it('should validate pagination parameters', async () => {
      const request = createSearchRequest({ limit: '100', page: '0' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid pagination parameters');
    });
  });

  describe('Text Search', () => {
    it('should search by kos name', async () => {
      const request = createSearchRequest({ q: 'Mawar' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].name).toContain('Mawar');
    });

    it('should search by title (case insensitive)', async () => {
      const request = createSearchRequest({ q: 'premium' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].title.toLowerCase()).toContain('premium');
    });

    it('should search by description', async () => {
      const request = createSearchRequest({ q: 'mahasiswa' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results.length).toBeGreaterThan(0);
    });

    it('should search by address', async () => {
      const request = createSearchRequest({ q: 'Kebayoran' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].address).toContain('Kebayoran');
    });

    it('should search by city', async () => {
      const request = createSearchRequest({ q: 'Bandung' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].city).toBe('Bandung');
    });
  });

  describe('City Filter', () => {
    it('should filter by city', async () => {
      const request = createSearchRequest({ city: 'Jakarta' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].city).toBe('Jakarta');
    });

    it('should return empty results for non-existent city', async () => {
      const request = createSearchRequest({ city: 'NonExistentCity' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(0);
    });
  });

  describe('Facilities Filter', () => {
    it('should filter by single facility', async () => {
      const request = createSearchRequest({ facilities: 'AC' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results.length).toBeGreaterThan(0);
      data.data.results.forEach((result: any) => {
        expect(result.facilities).toContain('AC');
      });
    });

    it('should filter by multiple facilities (AND condition)', async () => {
      const request = createSearchRequest({ facilities: 'AC,WiFi' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(result.facilities).toContain('AC');
        expect(result.facilities).toContain('WiFi');
      });
    });

    it('should return empty results for non-existent facility', async () => {
      const request = createSearchRequest({ facilities: 'NonExistentFacility' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(0);
    });
  });

  describe('Price Range Filter', () => {
    it('should filter by minimum price', async () => {
      const request = createSearchRequest({ min_price: '500000' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(result.price).toBeGreaterThanOrEqual(500000);
      });
    });

    it('should filter by maximum price', async () => {
      const request = createSearchRequest({ max_price: '500000' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(result.price).toBeLessThanOrEqual(500000);
      });
    });

    it('should filter by price range', async () => {
      const request = createSearchRequest({ min_price: '300000', max_price: '800000' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(result.price).toBeGreaterThanOrEqual(300000);
        expect(result.price).toBeLessThanOrEqual(800000);
      });
    });

    it('should ignore invalid price values', async () => {
      const request = createSearchRequest({ min_price: 'invalid', max_price: '-100' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should return all results since invalid prices are ignored
      expect(data.data.results).toHaveLength(4);
    });
  });

  describe('Rating Filter', () => {
    it('should filter by minimum rating', async () => {
      const request = createSearchRequest({ min_rating: '4.0' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.results.forEach((result: any) => {
        expect(parseFloat(result.averageRating)).toBeGreaterThanOrEqual(4.0);
      });
    });

    it('should ignore invalid rating values', async () => {
      const request = createSearchRequest({ min_rating: '10' }); // Invalid: > 5
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should return all results since invalid rating is ignored
      expect(data.data.results).toHaveLength(4);
    });

    it('should ignore negative rating values', async () => {
      const request = createSearchRequest({ min_rating: '-1' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should return all results since invalid rating is ignored
      expect(data.data.results).toHaveLength(4);
    });
  });

  describe('Sorting', () => {
    it('should sort by price ascending', async () => {
      const request = createSearchRequest({ sort: 'price_asc' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const prices = data.data.results.map((r: any) => r.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should sort by price descending', async () => {
      const request = createSearchRequest({ sort: 'price_desc' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const prices = data.data.results.map((r: any) => r.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('should sort by rating descending', async () => {
      const request = createSearchRequest({ sort: 'rating' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const ratings = data.data.results.map((r: any) => parseFloat(r.averageRating));
      expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    });

    it('should sort by newest', async () => {
      const request = createSearchRequest({ sort: 'newest' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Check that dates are in descending order
      const dates = data.data.results.map((r: any) => new Date(r.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should sort by popularity (view count)', async () => {
      const request = createSearchRequest({ sort: 'popular' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const viewCounts = data.data.results.map((r: any) => r.viewCount);
      expect(viewCounts).toEqual([...viewCounts].sort((a, b) => b - a));
    });

    it('should sort by quality score (default)', async () => {
      const request = createSearchRequest({ sort: 'quality' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Quality score should be included in results
      data.data.results.forEach((result: any) => {
        expect(result.qualityScore).toBeDefined();
        expect(typeof result.qualityScore).toBe('string');
      });
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters simultaneously', async () => {
      const request = createSearchRequest({
        q: 'Kos',
        city: 'Jakarta',
        min_price: '500000',
        max_price: '1000000',
        min_rating: '4.0',
        sort: 'rating'
      });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should filter correctly
      data.data.results.forEach((result: any) => {
        expect(result.city).toBe('Jakarta');
        expect(result.price).toBeGreaterThanOrEqual(500000);
        expect(result.price).toBeLessThanOrEqual(1000000);
        expect(parseFloat(result.averageRating)).toBeGreaterThanOrEqual(4.0);
      });
    });

    it('should return filters in response', async () => {
      const request = createSearchRequest({
        q: 'test',
        city: 'Jakarta',
        facilities: 'AC,WiFi',
        min_price: '500000',
        max_price: '1000000',
        min_rating: '4.0',
        sort: 'rating'
      });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.filters).toEqual({
        query: 'test',
        city: 'Jakarta',
        facilities: ['AC', 'WiFi'],
        minPrice: 500000,
        maxPrice: 1000000,
        minRating: 4.0,
        sortBy: 'rating'
      });
    });
  });

  describe('Response Structure', () => {
    it('should include all required fields in response', async () => {
      const request = createSearchRequest();
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('results');
      expect(data.data).toHaveProperty('pagination');
      expect(data.data).toHaveProperty('filters');
    });

    it('should include all required kos fields', async () => {
      const request = createSearchRequest();
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      const result = data.data.results[0];
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('postId');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('facilities');
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('averageRating');
      expect(result).toHaveProperty('reviewCount');
      expect(result).toHaveProperty('viewCount');
      expect(result).toHaveProperty('qualityScore');
      expect(result).toHaveProperty('owner');
    });

    it('should include complete pagination info', async () => {
      const request = createSearchRequest({ limit: '2' });
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      const pagination = data.data.pagination;
      expect(pagination).toHaveProperty('currentPage');
      expect(pagination).toHaveProperty('totalPages');
      expect(pagination).toHaveProperty('totalCount');
      expect(pagination).toHaveProperty('limit');
      expect(pagination).toHaveProperty('hasNextPage');
      expect(pagination).toHaveProperty('hasPrevPage');
      expect(pagination).toHaveProperty('nextPage');
      expect(pagination).toHaveProperty('prevPage');
    });

    it('should include owner information', async () => {
      const request = createSearchRequest();
      const response = await searchKos(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      const owner = data.data.results[0].owner;
      expect(owner).toHaveProperty('id');
      expect(owner).toHaveProperty('name');
      expect(owner).toHaveProperty('username');
      expect(owner).toHaveProperty('contact');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed search parameters gracefully', async () => {
      // Test with extremely large pagination values that might cause issues
      const request = createSearchRequest({ 
        page: '999999999999999',
        limit: '999999999999999'
      });
      
      const response = await searchKos(request);
      const data = await response.json();
      
      // Should return error for invalid pagination
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid pagination parameters');
    });
  });
});
