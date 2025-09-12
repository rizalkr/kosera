/** Envelope assertion utilities aligned with src/types/api.ts */
import { expect } from 'vitest';
import type { ApiError, ApiSuccess } from '../../src/types/api';
import type { ErrorCode } from '@/types/error-codes';

export interface ParsedResponse<T = unknown> {
  status: number;
  body: T;
}

export async function parseResponse<T = unknown>(res: Response): Promise<ParsedResponse<T>> {
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) as T };
  } catch {
    return { status: res.status, body: text as unknown as T };
  }
}

export function expectSuccess<T = unknown>(parsed: ParsedResponse): asserts parsed is ParsedResponse<ApiSuccess<T>> {
  expect(typeof parsed.body).toBe('object');
  const body = parsed.body as Record<string, unknown>;
  expect(body.success).toBe(true);
  expect(typeof body.message).toBe('string');
  expect(body).toHaveProperty('data');
}

export function expectError(parsed: ParsedResponse, code?: ErrorCode): asserts parsed is ParsedResponse<ApiError> {
  expect(typeof parsed.body).toBe('object');
  const body = parsed.body as Record<string, unknown>;
  expect(body.success).toBe(false);
  expect(typeof body.error).toBe('string');
  if (code) expect(body.error).toBe(code);
}
