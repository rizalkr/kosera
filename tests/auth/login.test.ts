import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { createMockRequest, parseResponse, mockUsers } from '../helpers';
import { hashPassword } from '@/lib/auth';

// Mock the database
const mockDbSelect = vi.fn();
const mockDbFrom = vi.fn();
const mockDbWhere = vi.fn();
const mockDbLimit = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: mockDbLimit,
        }),
      }),
    }),
  },
  users: {},
}));

// Mock auth functions
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual('@/lib/auth');
  return {
    ...actual,
    verifyPassword: vi.fn(),
  };
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const { verifyPassword } = await import('@/lib/auth');
    
    // Mock database response
    mockDbLimit.mockResolvedValue([mockUsers.admin]);
    (verifyPassword as any).mockResolvedValue(true);

    const request = createMockRequest('POST', {
      username: 'admin',
      password: 'admin123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Login successful');
    expect(result.data).toHaveProperty('user');
    expect(result.data).toHaveProperty('token');
    expect(result.data.user).toHaveProperty('username', 'admin');
    expect(result.data.user).not.toHaveProperty('password');
  });

  it('should fail with missing username', async () => {
    const request = createMockRequest('POST', {
      password: 'admin123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(400);
    expect(result.data).toHaveProperty('error', 'Username and password are required');
  });

  it('should fail with missing password', async () => {
    const request = createMockRequest('POST', {
      username: 'admin',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(400);
    expect(result.data).toHaveProperty('error', 'Username and password are required');
  });

  it('should fail with invalid username', async () => {
    // Mock database response - user not found
    mockDbLimit.mockResolvedValue([]);

    const request = createMockRequest('POST', {
      username: 'nonexistent',
      password: 'admin123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(401);
    expect(result.data).toHaveProperty('error', 'Invalid credentials');
  });

  it('should fail with invalid password', async () => {
    const { verifyPassword } = await import('@/lib/auth');
    
    // Mock database response
    mockDbLimit.mockResolvedValue([mockUsers.admin]);
    (verifyPassword as any).mockResolvedValue(false);

    const request = createMockRequest('POST', {
      username: 'admin',
      password: 'wrongpassword',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(401);
    expect(result.data).toHaveProperty('error', 'Invalid credentials');
  });

  it('should login with contact email', async () => {
    const { verifyPassword } = await import('@/lib/auth');
    
    // Mock database response - first query returns empty, second returns user
    mockDbLimit
      .mockResolvedValueOnce([]) // First query by username
      .mockResolvedValueOnce([mockUsers.admin]); // Second query by contact
    (verifyPassword as any).mockResolvedValue(true);

    const request = createMockRequest('POST', {
      username: 'admin@example.com',
      password: 'admin123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Login successful');
    expect(result.data).toHaveProperty('user');
    expect(result.data).toHaveProperty('token');
  });

  it('should handle database errors', async () => {
    // Mock database error
    mockDbLimit.mockRejectedValue(new Error('Database connection failed'));

    const request = createMockRequest('POST', {
      username: 'admin',
      password: 'admin123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(500);
    expect(result.data).toHaveProperty('error', 'Internal server error');
  });
});
