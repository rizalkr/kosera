import { expect } from 'vitest';
import type { ParsedResponse } from './envelope';
import type { ErrorCode } from '@/types/error-codes';

export function expectErrorCode(res: ParsedResponse, code: ErrorCode, status?: number) {
  const body = res.body as any; // test-only dynamic cast
  expect(body.success).toBe(false);
  expect(body.error).toBe(code);
  if (status !== undefined) expect(res.status).toBe(status);
}
