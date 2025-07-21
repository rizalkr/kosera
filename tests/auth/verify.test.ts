import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/api/auth/verify/route';
import { createMockRequest, createAuthenticatedRequest, parseResponse, testTokens } from '../helpers';

// Mock auth functions
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual('@/lib/auth');
  return {
    ...actual,
    verifyToken: vi.fn(),
    extractTokenFromHeader: vi.fn(),
  };
});

describe('GET /api/auth/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify valid token successfully', async () => {
    const { verifyToken, extractTokenFromHeader } = await import('../../src/lib/auth');
    
    // Mock auth functions
    (extractTokenFromHeader as any).mockReturnValue('valid-token');
    (verifyToken as any).mockReturnValue({
      userId: 1,
      username: 'admin',
      role: 'ADMIN',
    });

    const request = createAuthenticatedRequest('GET', 'admin');

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('message', 'Token is valid');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toHaveProperty('userId', 1);
    expect(result.data.user).toHaveProperty('username', 'admin');
    expect(result.data.user).toHaveProperty('role', 'ADMIN');
  });

  it('should fail with no token provided', async () => {
    const { extractTokenFromHeader } = await import('../../src/lib/auth');
    
    // Mock auth functions
    (extractTokenFromHeader as any).mockReturnValue(null);

    const request = createMockRequest('GET');

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(401);
    expect(result.data).toHaveProperty('error', 'No token provided');
  });

  it('should fail with invalid token', async () => {
    const { verifyToken, extractTokenFromHeader } = await import('../../src/lib/auth');
    
    // Mock auth functions
    (extractTokenFromHeader as any).mockReturnValue('invalid-token');
    (verifyToken as any).mockReturnValue(null);

    const request = createAuthenticatedRequest('GET', 'admin');

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(401);
    expect(result.data).toHaveProperty('error', 'Invalid or expired token');
  });

  it('should fail with malformed authorization header', async () => {
    const { extractTokenFromHeader } = await import('../../src/lib/auth');
    
    // Mock auth functions
    (extractTokenFromHeader as any).mockReturnValue(null);

    const request = createMockRequest('GET', undefined, {
      authorization: 'InvalidHeader token',
    });

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(401);
    expect(result.data).toHaveProperty('error', 'No token provided');
  });

  it('should handle token verification errors', async () => {
    const { verifyToken, extractTokenFromHeader } = await import('../../src/lib/auth');
    
    // Mock auth functions
    (extractTokenFromHeader as any).mockReturnValue('valid-token');
    (verifyToken as any).mockImplementation(() => {
      throw new Error('Token verification failed');
    });

    const request = createAuthenticatedRequest('GET', 'admin');

    const response = await GET(request);
    const result = await parseResponse(response);

    expect(result.status).toBe(500);
    expect(result.data).toHaveProperty('error', 'Internal server error');
  });
});
