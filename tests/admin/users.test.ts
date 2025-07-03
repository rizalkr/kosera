import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/admin/users/route';
import { createMockRequest, parseResponse, mockUsers } from '../helpers';

// Mock the database
const mockDbFrom = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: mockDbFrom,
    }),
  },
  users: {},
}));

// Mock middleware
vi.mock('@/lib/middleware', () => ({
  withAdmin: (handler: any) => handler,
}));

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all users successfully', async () => {
    const request = createMockRequest('GET') as any;
    
    // Mock authenticated admin request
    request.user = {
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
    };

    // Mock database response
    mockDbFrom.mockResolvedValue([
      {
        id: mockUsers.admin.id,
        name: mockUsers.admin.name,
        username: mockUsers.admin.username,
        contact: mockUsers.admin.contact,
        role: mockUsers.admin.role,
        createdAt: mockUsers.admin.createdAt,
      },
      {
        id: mockUsers.seller.id,
        name: mockUsers.seller.name,
        username: mockUsers.seller.username,
        contact: mockUsers.seller.contact,
        role: mockUsers.seller.role,
        createdAt: mockUsers.seller.createdAt,
      },
      {
        id: mockUsers.renter.id,
        name: mockUsers.renter.name,
        username: mockUsers.renter.username,
        contact: mockUsers.renter.contact,
        role: mockUsers.renter.role,
        createdAt: mockUsers.renter.createdAt,
      },
    ]);

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Users retrieved successfully');
    expect(result.data).toHaveProperty('users');
    expect(Array.isArray(result.data.users)).toBe(true);
    expect(result.data.users).toHaveLength(3);
    
    // Check that password is not included
    result.data.users.forEach((user: any) => {
      expect(user).not.toHaveProperty('password');
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('contact');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('createdAt');
    });
  });

  it('should return empty array when no users exist', async () => {
    const request = createMockRequest('GET') as any;
    
    // Mock authenticated admin request
    request.user = {
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
    };

    // Mock database response - no users
    mockDbFrom.mockResolvedValue([]);

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Users retrieved successfully');
    expect(result.data).toHaveProperty('users');
    expect(Array.isArray(result.data.users)).toBe(true);
    expect(result.data.users).toHaveLength(0);
  });

  it('should handle database errors', async () => {
    const request = createMockRequest('GET') as any;
    
    // Mock authenticated admin request
    request.user = {
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
    };

    // Mock database error
    mockDbFrom.mockRejectedValue(new Error('Database connection failed'));

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(500);
    expect(result.data).toHaveProperty('error', 'Internal server error');
  });

  it('should include all required user fields', async () => {
    const request = createMockRequest('GET') as any;
    
    // Mock authenticated admin request
    request.user = {
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
    };

    // Mock database response with single user
    mockDbFrom.mockResolvedValue([
      {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        contact: 'test@example.com',
        role: 'RENTER',
        createdAt: new Date('2024-01-01'),
      },
    ]);

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data.users[0]).toEqual({
      id: 1,
      name: 'Test User',
      username: 'testuser',
      contact: 'test@example.com',
      role: 'RENTER',
      createdAt: new Date('2024-01-01').toISOString(),
    });
  });
});
