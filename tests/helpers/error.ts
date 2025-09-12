import { expect } from 'vitest';
import type { ParsedResponse } from './envelope';

export function expectErrorCode(res: ParsedResponse, code: string, status?: number) {
  const body = res.body as any;
  expect(body.success).toBe(false);
  expect(body.error).toBe(code);
  if (status !== undefined) expect(res.status).toBe(status);
}
