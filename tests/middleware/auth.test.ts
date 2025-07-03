import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuth, withRole, withAdmin, withSellerOrAdmin, withAnyRole } from '@/lib/middleware';
import { createMockRequest, createAuthenticatedRequest, parseResponse } from '../helpers';
import { NextResponse } from 'next/server';

// Mock auth functions
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual('@/lib/auth');
  return {
    ...actual,
    verifyToken: vi.fn(),
    extractTokenFromHeader: vi.fn(),
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withAuth', () => {
    it('should pass through authenticated request', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 1,
        username: 'admin',
        role: 'ADMIN',
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ message: 'Success' })
      );

      const middleware = withAuth(mockHandler);
      const request = createAuthenticatedRequest('GET', 'admin');

      const response = await middleware(request);
      const result = await parseResponse(response);

      expect(mockHandler).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message', 'Success');
    });

    it('should reject request without token', async () => {
      const { extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue(null);

      const mockHandler = vi.fn();
      const middleware = withAuth(mockHandler);
      const request = createMockRequest('GET');

      const response = await middleware(request);
      const result = await parseResponse(response);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(401);
      expect(result.data).toHaveProperty('error', 'Authentication required');
    });

    it('should reject request with invalid token', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('invalid-token');
      (verifyToken as any).mockReturnValue(null);

      const mockHandler = vi.fn();
      const middleware = withAuth(mockHandler);
      const request = createAuthenticatedRequest('GET', 'admin');

      const response = await middleware(request);
      const result = await parseResponse(response);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(401);
      expect(result.data).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('withRole', () => {
    it('should allow access for correct role', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 1,
        username: 'admin',
        role: 'ADMIN',
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ message: 'Success' })
      );

      const middleware = withRole(['ADMIN'])(mockHandler);
      const request = createAuthenticatedRequest('GET', 'admin');

      const response = await middleware(request);
      const result = await parseResponse(response);

      expect(mockHandler).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message', 'Success');
    });

    it('should deny access for incorrect role', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 3,
        username: 'renter',
        role: 'RENTER',
      });

      const mockHandler = vi.fn();
      const middleware = withRole(['ADMIN'])(mockHandler);
      const request = createAuthenticatedRequest('GET', 'renter');

      const response = await middleware(request);
      const result = await parseResponse(response);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(403);
      expect(result.data).toHaveProperty('error', 'Insufficient permissions');
    });
  });

  describe('withAdmin', () => {
    it('should allow admin access', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 1,
        username: 'admin',
        role: 'ADMIN',
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ message: 'Admin access granted' })
      );

      const request = createAuthenticatedRequest('GET', 'admin');
      const response = await withAdmin(mockHandler)(request);
      const result = await parseResponse(response);

      expect(mockHandler).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message', 'Admin access granted');
    });

    it('should deny non-admin access', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 2,
        username: 'seller',
        role: 'SELLER',
      });

      const mockHandler = vi.fn();
      const request = createAuthenticatedRequest('GET', 'seller');
      const response = await withAdmin(mockHandler)(request);
      const result = await parseResponse(response);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(403);
      expect(result.data).toHaveProperty('error', 'Insufficient permissions');
    });
  });

  describe('withSellerOrAdmin', () => {
    it('should allow seller access', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 2,
        username: 'seller',
        role: 'SELLER',
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ message: 'Seller access granted' })
      );

      const request = createAuthenticatedRequest('GET', 'seller');
      const response = await withSellerOrAdmin(mockHandler)(request);
      const result = await parseResponse(response);

      expect(mockHandler).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message', 'Seller access granted');
    });

    it('should allow admin access', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 1,
        username: 'admin',
        role: 'ADMIN',
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ message: 'Admin access granted' })
      );

      const request = createAuthenticatedRequest('GET', 'admin');
      const response = await withSellerOrAdmin(mockHandler)(request);
      const result = await parseResponse(response);

      expect(mockHandler).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message', 'Admin access granted');
    });

    it('should deny renter access', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 3,
        username: 'renter',
        role: 'RENTER',
      });

      const mockHandler = vi.fn();
      const request = createAuthenticatedRequest('GET', 'renter');
      const response = await withSellerOrAdmin(mockHandler)(request);
      const result = await parseResponse(response);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(403);
      expect(result.data).toHaveProperty('error', 'Insufficient permissions');
    });
  });

  describe('withAnyRole', () => {
    it('should allow any authenticated user', async () => {
      const { verifyToken, extractTokenFromHeader } = await import('@/lib/auth');
      
      // Mock auth functions
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyToken as any).mockReturnValue({
        userId: 3,
        username: 'renter',
        role: 'RENTER',
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ message: 'Access granted' })
      );

      const request = createAuthenticatedRequest('GET', 'renter');
      const response = await withAnyRole(mockHandler)(request);
      const result = await parseResponse(response);

      expect(mockHandler).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message', 'Access granted');
    });
  });
});
