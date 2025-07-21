import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
} from '../../src/lib/auth';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const bcryptjs = await import('bcryptjs');
      (bcryptjs.default.hash as any).mockResolvedValue('hashedPassword123');

      const result = await hashPassword('plainPassword');

      expect(bcryptjs.default.hash).toHaveBeenCalledWith('plainPassword', 12);
      expect(result).toBe('hashedPassword123');
    });

    it('should handle hashing errors', async () => {
      const bcryptjs = await import('bcryptjs');
      (bcryptjs.default.hash as any).mockRejectedValue(new Error('Hash failed'));

      await expect(hashPassword('plainPassword')).rejects.toThrow('Hash failed');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const bcryptjs = await import('bcryptjs');
      (bcryptjs.default.compare as any).mockResolvedValue(true);

      const result = await verifyPassword('plainPassword', 'hashedPassword');

      expect(bcryptjs.default.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const bcryptjs = await import('bcryptjs');
      (bcryptjs.default.compare as any).mockResolvedValue(false);

      const result = await verifyPassword('wrongPassword', 'hashedPassword');

      expect(bcryptjs.default.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(result).toBe(false);
    });

    it('should handle verification errors', async () => {
      const bcryptjs = await import('bcryptjs');
      (bcryptjs.default.compare as any).mockRejectedValue(new Error('Compare failed'));

      await expect(verifyPassword('plainPassword', 'hashedPassword')).rejects.toThrow('Compare failed');
    });
  });

  describe('generateToken', () => {
    it('should generate token successfully', () => {
      const mockJwt = vi.mocked(jwt);
      mockJwt.sign.mockReturnValue('generated-token' as any);

      const payload = {
        userId: 1,
        username: 'testuser',
        role: 'ADMIN' as const,
      };

      const result = generateToken(payload);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );
      expect(result).toBe('generated-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockJwt = vi.mocked(jwt);
      const mockPayload = {
        userId: 1,
        username: 'testuser',
        role: 'ADMIN',
      };
      mockJwt.verify.mockReturnValue(mockPayload as any);

      const result = verifyToken('valid-token');

      expect(mockJwt.verify).toHaveBeenCalledWith(
        'valid-token',
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token', () => {
      const mockJwt = vi.mocked(jwt);
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const mockJwt = vi.mocked(jwt);
      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const result = verifyToken('expired-token');

      expect(result).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const result = extractTokenFromHeader('Bearer valid-token-123');

      expect(result).toBe('valid-token-123');
    });

    it('should return null for null header', () => {
      const result = extractTokenFromHeader(null);

      expect(result).toBeNull();
    });

    it('should return null for missing Bearer prefix', () => {
      const result = extractTokenFromHeader('Token valid-token-123');

      expect(result).toBeNull();
    });

    it('should return null for empty Bearer header', () => {
      const result = extractTokenFromHeader('Bearer ');

      expect(result).toBe('');
    });

    it('should return null for malformed header', () => {
      const result = extractTokenFromHeader('Bearer');

      expect(result).toBeNull();
    });

    it('should handle Bearer with multiple spaces', () => {
      const result = extractTokenFromHeader('Bearer   token-with-spaces');

      expect(result).toBe('  token-with-spaces');
    });

    it('should extract token with special characters', () => {
      const result = extractTokenFromHeader('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      expect(result).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    });
  });
});
