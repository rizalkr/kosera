import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestUser, createAuthToken, cleanupTestData } from '../utils/mock-factory';
import { db } from '../../src/db';
import { users, posts, kos } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { GET as getKos, POST as createKos } from '../../src/app/api/kos/route';
import { GET as getKosById, PUT as updateKos, DELETE as deleteKos } from '../../src/app/api/kos/[id]/route';
import { GET as getMyKos } from '../../src/app/api/kos/my/route';

describe('Kos CRUD API', () => {
  let sellerUser: any;
  let renterUser: any;
  let adminUser: any;
  let sellerToken: string;
  let renterToken: string;
  let adminToken: string;
  let testKosId: number;

  beforeAll(async () => {
    // Create test users
    sellerUser = await createTestUser('seller', 'SELLER');
    renterUser = await createTestUser('renter', 'RENTER');
    adminUser = await createTestUser('admin', 'ADMIN');

    // Generate tokens
    sellerToken = createAuthToken({
      userId: sellerUser.id,
      username: sellerUser.username,
      role: sellerUser.role
    });
    renterToken = createAuthToken({
      userId: renterUser.id,
      username: renterUser.username,
      role: renterUser.role
    });
    adminToken = createAuthToken({
      userId: adminUser.id,
      username: adminUser.username,
      role: adminUser.role
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  beforeEach(async () => {
    // Clean up kos and posts before each test
    await db.delete(kos).execute();
    await db.delete(posts).execute();
  });

  describe('POST /api/kos - Create Kos', () => {
    it('should create kos successfully with SELLER role', async () => {
      const kosData = {
        name: 'Kos Mawar',
        address: 'Jl. Mawar No. 123',
        city: 'Jakarta',
        facilities: 'WiFi, AC, Kamar Mandi Dalam',
        title: 'Kos Nyaman di Jakarta Pusat',
        description: 'Kos dengan fasilitas lengkap',
        price: 1500000,
        totalRooms: 10
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify(kosData)
      });

      const response = await createKos(request);
      const result = await response.json();
      
      expect(response.status).toBe(201);
      expect(result.message).toBe('Kos created successfully');
      expect(result.data.name).toBe(kosData.name);
      expect(result.data.price).toBe(kosData.price);

      testKosId = result.data.id;
    });

    it('should reject creation with RENTER role', async () => {
      const kosData = {
        name: 'Kos Renter',
        address: 'Jl. Renter No. 789',
        city: 'Surabaya',
        facilities: 'WiFi',
        title: 'Kos Renter Test',
        description: 'Should not be created',
        price: 1000000
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${renterToken}`
        },
        body: JSON.stringify(kosData)
      });

      const response = await createKos(request);
      const result = await response.json();
      
      expect(response.status).toBe(403);
      expect(result.error).toBe('Insufficient permissions');
    });

    it('should reject creation without authentication', async () => {
      const kosData = {
        name: 'Kos Unauthorized',
        address: 'Jl. Unauthorized No. 999',
        city: 'Medan',
        facilities: 'WiFi',
        title: 'Unauthorized Kos',
        description: 'Should not be created',
        price: 800000
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(kosData)
      });

      const response = await createKos(request);
      const result = await response.json();
      
      expect(response.status).toBe(401);
      expect(result.error).toBe('Authentication required');
    });

    it('should reject creation with missing required fields', async () => {
      const incompleteData = {
        name: 'Kos Incomplete',
        // Missing address, city, title, description, price
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify(incompleteData)
      });

      const response = await createKos(request);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.error).toContain('Missing required fields');
    });

    it('should reject creation with invalid price', async () => {
      const invalidPriceData = {
        name: 'Kos Invalid Price',
        address: 'Jl. Invalid No. 123',
        city: 'Jakarta',
        facilities: 'WiFi',
        title: 'Invalid Price Kos',
        description: 'Kos with invalid price',
        price: -1000 // Invalid negative price
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify(invalidPriceData)
      });

      const response = await createKos(request);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Price must be a positive number');
    });
  });

  describe('GET /api/kos - Get All Kos', () => {
    beforeEach(async () => {
      // Create test kos for GET tests
      const kosData = {
        name: 'Test Kos for GET',
        address: 'Jl. Test No. 123',
        city: 'Jakarta',
        facilities: 'WiFi, AC',
        title: 'Test Kos',
        description: 'Test description',
        price: 1500000,
        totalRooms: 10
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify(kosData)
      });

      const response = await createKos(request);
      const result = await response.json();
      testKosId = result.data.id;
    });

    it('should get all kos without authentication (public endpoint)', async () => {
      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'GET'
      });

      const response = await getKos(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Kos retrieved successfully');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should filter kos by city', async () => {
      const request = new NextRequest('http://localhost:3000/api/kos?city=Jakarta', {
        method: 'GET'
      });

      const response = await getKos(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.every((kos: any) => kos.city === 'Jakarta')).toBe(true);
    });

    it('should filter kos by price range', async () => {
      const request = new NextRequest('http://localhost:3000/api/kos?minPrice=1000000&maxPrice=2000000', {
        method: 'GET'
      });

      const response = await getKos(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.every((kos: any) => kos.price >= 1000000 && kos.price <= 2000000)).toBe(true);
    });
  });

  describe('GET /api/kos/[id] - Get Specific Kos', () => {
    beforeEach(async () => {
      // Create test kos
      const kosData = {
        name: 'Test Kos for GET by ID',
        address: 'Jl. Test ID No. 123',
        city: 'Jakarta',
        facilities: 'WiFi, AC',
        title: 'Test Kos ID',
        description: 'Test description for ID',
        price: 1500000,
        totalRooms: 10
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify(kosData)
      });

      const response = await createKos(request);
      const result = await response.json();
      testKosId = result.data.id;
    });

    it('should get specific kos by ID', async () => {
      const request = new NextRequest(`http://localhost:3000/api/kos/${testKosId}`, {
        method: 'GET'
      });

      const response = await getKosById(request, { params: { id: testKosId.toString() } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Kos retrieved successfully');
      expect(result.data.id).toBe(testKosId);
      expect(result.data.name).toBe('Test Kos for GET by ID');
    });

    it('should return 404 for non-existent kos', async () => {
      const request = new NextRequest('http://localhost:3000/api/kos/99999', {
        method: 'GET'
      });

      const response = await getKosById(request, { params: { id: '99999' } });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('Kos not found');
    });

    it('should return 400 for invalid kos ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/kos/invalid-id', {
        method: 'GET'
      });

      const response = await getKosById(request, { params: { id: 'invalid-id' } });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid kos ID');
    });
  });

  describe('GET /api/kos/my - Get My Kos', () => {
    beforeEach(async () => {
      // Create test kos for seller
      const kosData = {
        name: 'My Test Kos',
        address: 'Jl. My Test No. 123',
        city: 'Jakarta',
        facilities: 'WiFi, AC',
        title: 'My Test Kos',
        description: 'My test description',
        price: 1500000,
        totalRooms: 10
      };

      const request = new NextRequest('http://localhost:3000/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify(kosData)
      });

      await createKos(request);
    });

    it('should get kos owned by current seller', async () => {
      const request = new NextRequest('http://localhost:3000/api/kos/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sellerToken}`
        }
      });

      const response = await getMyKos(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.message).toBe('Your kos retrieved successfully');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should reject access for RENTER role', async () => {
      const request = new NextRequest('http://localhost:3000/api/kos/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${renterToken}`
        }
      });

      const response = await getMyKos(request);
      const result = await response.json();
      
      expect(response.status).toBe(403);
      expect(result.error).toBe('Insufficient permissions');
    });
  });
});
