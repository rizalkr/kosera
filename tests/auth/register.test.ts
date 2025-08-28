import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/auth/register/route';
import { createMockRequest, parseResponse, mockUsers } from '../helpers';

// Mock the database
const mockDbLimit = vi.fn();
const mockDbReturning = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: mockDbLimit,
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: mockDbReturning,
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
    hashPassword: vi.fn(),
  };
});

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const { hashPassword } = await import('../../src/lib/auth');
    
    // Mock database responses
    mockDbLimit.mockResolvedValue([]); // No existing user
    (hashPassword as any).mockResolvedValue('hashedPassword123');
    mockDbReturning.mockResolvedValue([{
      id: 4,
      name: 'New User',
      username: 'newuser',
      contact: 'newuser@example.com',
      role: 'RENTER',
      createdAt: new Date(),
    }]);

    const request = createMockRequest('POST', {
      name: 'New User',
      username: 'newuser',
      contact: 'newuser@example.com',
      password: 'newuser123',
      role: 'RENTER',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(201);
    expect(result.data).toHaveProperty('message', 'User registered successfully');
    expect(result.data).toHaveProperty('data');
    expect(result.data.data).toHaveProperty('user');
    expect(result.data.data).toHaveProperty('token');
    expect(result.data.data.user).toHaveProperty('username', 'newuser');
    expect(result.data.data.user).not.toHaveProperty('password');
  });

  it('should fail with missing required fields', async () => {
    const request = createMockRequest('POST', {
      name: 'New User',
      username: 'newuser',
      // missing contact and password
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(400);
    expect(result.data).toHaveProperty('error', 'Name, username, contact, and password are required');
  });

  it('should fail with existing username', async () => {
    // Mock database response - username exists
    mockDbLimit.mockResolvedValueOnce([mockUsers.admin]);

    const request = createMockRequest('POST', {
      name: 'New User',
      username: 'admin', // existing username
      contact: 'newuser@example.com',
      password: 'newuser123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(409);
    expect(['Username already exists','Username sudah digunakan']).toContain(result.data.error);
  });

  it('should fail with existing contact', async () => {
    // Mock database responses
    mockDbLimit
      .mockResolvedValueOnce([]) // Username doesn't exist
      .mockResolvedValueOnce([mockUsers.admin]); // Contact exists

    const request = createMockRequest('POST', {
      name: 'New User',
      username: 'newuser',
      contact: 'admin@example.com', // existing contact
      password: 'newuser123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(409);
    expect(['Contact already exists','Contact sudah digunakan']).toContain(result.data.error);
  });

  it('should default to RENTER role when not specified', async () => {
    const { hashPassword } = await import('../../src/lib/auth');
    
    // Mock database responses
    mockDbLimit.mockResolvedValue([]); // No existing user
    (hashPassword as any).mockResolvedValue('hashedPassword123');
    mockDbReturning.mockResolvedValue([{
      id: 4,
      name: 'New User',
      username: 'newuser',
      contact: 'newuser@example.com',
      role: 'RENTER',
      createdAt: new Date(),
    }]);

    const request = createMockRequest('POST', {
      name: 'New User',
      username: 'newuser',
      contact: 'newuser@example.com',
      password: 'newuser123',
      // role not specified
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(201);
    expect(result.data.data.user).toHaveProperty('role', 'RENTER');
  });

  it('should handle database errors', async () => {
    // Mock database error
    mockDbLimit.mockRejectedValue(new Error('Database connection failed'));

    const request = createMockRequest('POST', {
      name: 'New User',
      username: 'newuser',
      contact: 'newuser@example.com',
      password: 'newuser123',
    });

    const response = await POST(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(500);
    expect(result.data).toHaveProperty('error', 'Internal server error');
  });
});
