import { describe, it, expect, beforeAll } from 'vitest';
import { createAndLogin, loginUser } from '../factories/userFactory';
import { authFetch } from '../helpers/testFetch';
import { expectError, expectSuccess } from '../helpers/envelope';

/** Integration tests for password update endpoint */
describe('Password Update API', () => {
  let token: string;
  let username: string;
  let currentPassword: string;

  beforeAll(async () => {
    const user = await createAndLogin('RENTER');
    token = user.token;
    username = user.username;
    currentPassword = user.password;
  });

  it('validates mismatched confirmation', async () => {
    const res = await authFetch('/api/user/password', token, {
      method: 'PUT',
      body: { currentPassword, newPassword: 'NewPassword456!', confirmNewPassword: 'Different789!' },
    });
    expectError(res, 'validation_error');
    expect(res.status).toBe(400);
  });

  it('validates weak password', async () => {
    const res = await authFetch('/api/user/password', token, {
      method: 'PUT',
      body: { currentPassword, newPassword: 'short', confirmNewPassword: 'short' },
    });
    expectError(res, 'validation_error');
    expect(res.status).toBe(400);
  });

  it('rejects same current/new password', async () => {
    const res = await authFetch('/api/user/password', token, {
      method: 'PUT',
      body: { currentPassword, newPassword: currentPassword, confirmNewPassword: currentPassword },
    });
    expectError(res, 'validation_error');
    expect(res.status).toBe(400);
  });

  it('rejects incorrect current password', async () => {
    const res = await authFetch('/api/user/password', token, {
      method: 'PUT',
      body: { currentPassword: 'WrongPass123!', newPassword: 'NewPassword456!', confirmNewPassword: 'NewPassword456!' },
    });
    expectError(res, 'invalid_credentials');
    expect(res.status).toBe(400);
  });

  it('updates password successfully and old password no longer works', async () => {
    const newPassword = 'NewPassword456!';
    const updateRes = await authFetch('/api/user/password', token, {
      method: 'PUT',
      body: { currentPassword, newPassword, confirmNewPassword: newPassword },
    });
    expectSuccess(updateRes);
    expect(updateRes.status).toBe(200);

    // Login with old password should fail
    const oldLogin = await loginUser({ username, password: currentPassword });
    expectError(oldLogin, 'invalid_credentials');
    expect(oldLogin.status).toBe(401);

    // Login with new password should succeed
    const newLogin = await loginUser({ username, password: newPassword });
    expectSuccess(newLogin);
  });
});
