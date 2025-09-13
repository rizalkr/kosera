import { describe, it, expect, beforeAll } from 'vitest';
import { createAndLogin } from '../factories/userFactory';
import { authFetch, testFetch } from '../helpers/testFetch';
import { expectSuccess, expectError, type ParsedResponse } from '../helpers/envelope';

interface VerifySuccessUserEnvelope {
  success: true;
  message: string;
  data?: { user?: { id: string; username: string; role: string } };
  user?: { id: string; username: string; role: string };
}

/** Integration tests for /api/auth/verify route */
describe('Auth Verify API', () => {
  let token: string;

  beforeAll(async () => {
    const user = await createAndLogin('RENTER');
    token = user.token;
  });

  it('returns user data for a valid token (supports nested data.user)', async () => {
    const res = await authFetch('/api/auth/verify', token) as ParsedResponse<VerifySuccessUserEnvelope>;
    expectSuccess(res);
    expect(res.status).toBe(200);
    const body = res.body;
    const extractedUser = body.user || body.data?.user;
    expect(extractedUser).toBeTruthy();
    expect(extractedUser?.username).toBeDefined();
  });

  it('rejects missing token', async () => {
    const res = await testFetch('/api/auth/verify');
    expectError(res, 'unauthorized');
    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await authFetch('/api/auth/verify', token + 'tampered');
    expectError(res, 'invalid_token');
    expect(res.status).toBe(401);
  });
});
