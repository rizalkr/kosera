/** Lightweight fetch wrappers for tests */
import { parseResponse, type ParsedResponse } from './envelope';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export interface JsonInit extends Omit<RequestInit, 'body'> { body?: unknown }

export async function testFetch<T = unknown>(path: string, init: JsonInit = {}): Promise<ParsedResponse<T>> {
  const headers: Record<string, string> = { 'content-type': 'application/json', ...(init.headers as Record<string, string> | undefined) };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  return parseResponse<T>(res);
}

export async function authFetch<T = unknown>(path: string, token: string, init: JsonInit = {}): Promise<ParsedResponse<T>> {
  return testFetch<T>(path, {
    ...init,
    headers: { ...(init.headers as Record<string, string> | undefined), authorization: `Bearer ${token}` },
  });
}
