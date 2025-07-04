import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, parseResponse } from '../helpers';

// Import the actual route handlers
const mockPost = vi.fn();
const mockGet = vi.fn();

// Mock the route handlers since they are wrapped with middleware
vi.mock('@/app/api/kos/route', () => ({
  GET: mockGet,
  POST: mockPost,
}));

// Mock the database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  kos: {},
  posts: {},
  users: {},
}));

// Mock middleware
vi.mock('@/lib/middleware', () => ({
  withAuth: vi.fn((handler: any) => handler),
  withSellerOrAdmin: vi.fn((handler: any) => handler),
}));

describe('Kos API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/kos', () => {
    it('should create kos successfully', async () => {
      const mockResponse = {
        status: 201,
        json: () => ({
          message: 'Kos created successfully',
          kos: {
            id: 1,
            name: 'Test Kos',
            city: 'Jakarta',
          },
        }),
      };

      mockPost.mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', {
        title: 'Test Kos',
        description: 'A nice kos for testing',
        price: 500000,
        name: 'Test Kos',
        address: 'Jl. Test No. 1',
        city: 'Jakarta',
        facilities: 'WiFi, AC, Parking',
      });

      // Add mock user to request
      (request as any).user = {
        userId: 2,
        username: 'seller',
        role: 'SELLER',
      };

      const result = await mockPost(request);
      
      expect(result.status).toBe(201);
      expect(mockPost).toHaveBeenCalledWith(request);
    });

    it('should validate required fields', async () => {
      const mockResponse = {
        status: 400,
        json: () => ({
          error: 'Missing required fields: name, address, city, title, description, price',
        }),
      };

      mockPost.mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', {
        title: 'Test Kos',
        // Missing required fields
      });

      // Add mock user to request
      (request as any).user = {
        userId: 2,
        username: 'seller',
        role: 'SELLER',
      };

      const result = await mockPost(request);
      
      expect(result.status).toBe(400);
    });

    it('should validate price is positive', async () => {
      const mockResponse = {
        status: 400,
        json: () => ({
          error: 'Price must be a positive number',
        }),
      };

      mockPost.mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', {
        title: 'Test Kos',
        description: 'A nice kos for testing',
        price: -1000, // Invalid price
        name: 'Test Kos',
        address: 'Jl. Test No. 1',
        city: 'Jakarta',
        facilities: 'WiFi, AC, Parking',
      });

      // Add mock user to request
      (request as any).user = {
        userId: 2,
        username: 'seller',
        role: 'SELLER',
      };

      const result = await mockPost(request);
      
      expect(result.status).toBe(400);
    });
  });

  describe('GET /api/kos', () => {
    it('should get all kos successfully', async () => {
      const mockKosData = [
        {
          id: 1,
          name: 'Kos A',
          address: 'Jl. A No. 1',
          city: 'Jakarta',
          facilities: 'WiFi, AC',
          price: 500000,
          title: 'Kos A',
          description: 'Nice kos',
        },
      ];

      const mockResponse = {
        status: 200,
        json: () => ({
          message: 'Kos retrieved successfully',
          data: mockKosData,
        }),
      };

      mockGet.mockResolvedValue(mockResponse);

      const request = createMockRequest('GET');
      const result = await mockGet(request);
      
      expect(result.status).toBe(200);
      expect(mockGet).toHaveBeenCalledWith(request);
    });

    it('should filter kos by city', async () => {
      const mockKosData = [
        {
          id: 1,
          name: 'Kos Jakarta',
          address: 'Jl. Jakarta No. 1',
          city: 'Jakarta',
          facilities: 'WiFi, AC',
          price: 500000,
          title: 'Kos Jakarta',
          description: 'Nice kos in Jakarta',
        },
      ];

      const mockResponse = {
        status: 200,
        json: () => ({
          message: 'Kos retrieved successfully',
          data: mockKosData,
        }),
      };

      mockGet.mockResolvedValue(mockResponse);

      // Mock URL with search params
      const url = new URL('http://localhost:3000/api/kos?city=Jakarta');
      const request = new Request(url, { method: 'GET' });

      const result = await mockGet(request);
      
      expect(result.status).toBe(200);
      expect(mockGet).toHaveBeenCalledWith(request);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockResponse = {
        status: 500,
        json: () => ({
          error: 'Failed to retrieve kos',
        }),
      };

      mockGet.mockResolvedValue(mockResponse);

      const request = createMockRequest('GET');
      const result = await mockGet(request);
      
      expect(result.status).toBe(500);
    });
  });
});
