import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken, extractTokenFromHeader, type JWTPayload } from '@/lib/auth';

describe('Auth Helpers', () => {
  it('extractTokenFromHeader returns token when Bearer prefix present', () => {
    const token = 'abc.def.ghi';
    const extracted = extractTokenFromHeader(`Bearer ${token}`);
    expect(extracted).toBe(token);
  });

  it('extractTokenFromHeader returns null when header missing or malformed', () => {
    expect(extractTokenFromHeader(null)).toBeNull();
    expect(extractTokenFromHeader('')).toBeNull();
    expect(extractTokenFromHeader('Token abc')).toBeNull();
  });

  it('generateToken + verifyToken round trip', () => {
    const payload: JWTPayload = { userId: 1, username: 'tester', role: 'RENTER' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.username).toBe(payload.username);
    expect(decoded?.role).toBe(payload.role);
  });

  it('verifyToken returns null for invalid token', () => {
    const invalid = 'invalid.token.value';
    const result = verifyToken(invalid);
    expect(result).toBeNull();
  });
});
