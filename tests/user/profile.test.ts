import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/api/user/profile/route';
import { createMockRequest, createAuthenticatedRequest, parseResponse } from '../helpers';

// Mock middleware
vi.mock('@/lib/middleware', () => ({
  withAnyRole: (handler: any) => handler,
}));

describe('GET /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user profile successfully', async () => {
    const request = createMockRequest('GET') as any;
    
    // Mock authenticated request with user data
    request.user = {
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
    };

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Profile retrieved successfully');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toHaveProperty('userId', 1);
    expect(result.data.user).toHaveProperty('username', 'admin');
    expect(result.data.user).toHaveProperty('role', 'ADMIN');
  });

  it('should return seller profile successfully', async () => {
    const request = createMockRequest('GET') as any;
    
    // Mock authenticated request with seller user data
    request.user = {
      userId: 2,
      username: 'seller',
      role: 'SELLER',
    };

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Profile retrieved successfully');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toHaveProperty('userId', 2);
    expect(result.data.user).toHaveProperty('username', 'seller');
    expect(result.data.user).toHaveProperty('role', 'SELLER');
  });

  it('should return renter profile successfully', async () => {
    const request = createMockRequest('GET') as any;
    
    // Mock authenticated request with renter user data
    request.user = {
      userId: 3,
      username: 'renter',
      role: 'RENTER',
    };

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Profile retrieved successfully');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toHaveProperty('userId', 3);
    expect(result.data.user).toHaveProperty('username', 'renter');
    expect(result.data.user).toHaveProperty('role', 'RENTER');
  });
});
