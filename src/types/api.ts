/**
 * Shared API response envelope types and helpers.
 * Standardizes all JSON responses for consistency and easier test assertions.
 *
 * Pattern:
 *  Success: { success: true, message: string, data: T }
 *  Error:   { success: false, error: string, message?: string, details?: unknown }
 */

import type { ErrorCode } from '@/types/error-codes';

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  /** Short machine-readable / user-friendly error label */
  error: string;
  /** Optional extended human readable message */
  message?: string;
  /** Optional structured details (validation issues, field errors, etc.) */
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Generic pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Wrap paginated resource */
export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Build a success envelope */
export function createSuccess<T>(message: string, data: T): ApiSuccess<T> {
  return { success: true, message, data };
}

/** Build an error envelope */
export function createError(error: string, message?: string, details?: unknown): ApiError {
  return { success: false, error, ...(message ? { message } : {}), ...(details !== undefined ? { details } : {}) };
}

/** Type guard for success */
export function isSuccess<T>(res: ApiResponse<T>): res is ApiSuccess<T> {
  return res.success === true;
}

/**
 * Create a Response object with JSON body and proper headers.
 * Avoids NextResponse for easier direct invocation & Node 18+/Fetch compatibility.
 */
export function jsonResponse<T>(body: ApiResponse<T>, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
}

/** Helper to quickly send success */
export function ok<T>(message: string, data: T, init?: ResponseInit): Response {
  return jsonResponse(createSuccess(message, data), init);
}

/** Helper to quickly send error */
export function fail(error: ErrorCode, message?: string, details?: unknown, init?: ResponseInit & { status?: number }): Response {
  return jsonResponse(createError(error, message, details), { status: init?.status, headers: init?.headers });
}
