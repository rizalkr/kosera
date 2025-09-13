/** Envelope assertion utilities aligned with src/types/api.ts */
import { expect } from 'vitest';
import type { ApiError, ApiSuccess } from '../../src/types/api';
import type { ErrorCode } from '@/types/error-codes';

export interface ParsedResponse<T = unknown> {
  status: number;
  body: T;
  /** Raw text body (always captured for debug) */
  raw: string;
  /** Response content-type header (may influence parsing) */
  contentType?: string | null;
}

/**
 * Parse fetch Response with resilient JSON handling.
 * - Always records raw text for better failure diagnostics.
 * - Attempts strict JSON.parse first.
 * - If fails but the body "looks" like JSON (starts with { or [), will trim and retry once.
 * - If still fails, returns string but (when DEBUG_TEST_RESPONSES=1) logs a structured diagnostic.
 */
export async function parseResponse<T = unknown>(res: Response): Promise<ParsedResponse<T>> {
  const contentType = res.headers.get('content-type');
  const raw = await res.text();

  const debug = process.env.DEBUG_TEST_RESPONSES === '1';

  const tryParse = (input: string): T | undefined => {
    try {
      return JSON.parse(input) as T;
    } catch {
      return undefined;
    }
  };

  // First attempt
  let parsed = tryParse(raw);

  // Heuristic retry if it *looks* like JSON but first parse failed (maybe BOM / whitespace / trailing chars)
  if (!parsed && /^(\s*[\[{])/.test(raw)) {
    parsed = tryParse(raw.trim());
  }

  if (!parsed && debug) {
    // Emit a concise diagnostic snapshot (avoid flooding logs with huge bodies)
    console.warn('[parseResponse] JSON parse failed', {
      status: res.status,
      contentType,
      length: raw.length,
      preview: raw.slice(0, 160),
    });
  }

  return {
    status: res.status,
    body: (parsed ?? (raw as unknown)) as T,
    raw,
    contentType,
  };
}

export function expectSuccess<T = unknown>(parsed: ParsedResponse): asserts parsed is ParsedResponse<ApiSuccess<T>> {
  if (typeof parsed.body !== 'object' || parsed.body === null) {
    // Provide richer context on failure
    console.error('[expectSuccess] Non-object body', {
      status: parsed.status,
      contentType: parsed.contentType,
      rawPreview: parsed.raw.slice(0, 200),
    });
  }
  expect(typeof parsed.body).toBe('object');
  const body = parsed.body as Record<string, unknown>;
  expect(body.success).toBe(true);
  expect(typeof body.message).toBe('string');
  expect(body).toHaveProperty('data');
}

export function expectError(parsed: ParsedResponse, code?: ErrorCode): asserts parsed is ParsedResponse<ApiError> {
  if (typeof parsed.body !== 'object' || parsed.body === null) {
    console.error('[expectError] Non-object body', {
      status: parsed.status,
      contentType: parsed.contentType,
      rawPreview: parsed.raw.slice(0, 200),
    });
  }
  expect(typeof parsed.body).toBe('object');
  const body = parsed.body as Record<string, unknown>;
  expect(body.success).toBe(false);
  expect(typeof body.error).toBe('string');
  if (code) expect(body.error).toBe(code);
}
