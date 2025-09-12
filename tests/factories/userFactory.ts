/** User factory utilities */
import { testFetch } from '../helpers/testFetch';
import type { ParsedResponse } from '../helpers/envelope';

interface RegisterPayload {
  name: string;
  username: string;
  contact: string;
  role: 'ADMIN' | 'SELLER' | 'RENTER';
  password: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  const res = await testFetch('/api/auth/register', { method: 'POST', body: payload });
  return res;
}

export async function loginUser(payload: LoginPayload): Promise<ParsedResponse<{ token: string }>> {
  return testFetch('/api/auth/login', { method: 'POST', body: payload });
}

export async function createAndLogin(role: RegisterPayload['role'] = 'RENTER') {
  const username = `test_${role}_${Date.now()}`;
  const password = 'Password123!';
  await registerUser({
    name: `${role} user`,
    username,
    contact: `${username}@example.com`,
    role,
    password,
  });
  const login = await loginUser({ username, password });
  return { username, password, token: (login.body as any).data?.token ?? (login.body as any).token };
}
