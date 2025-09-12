/**
 * Central registry of all API error codes used across the application.
 *
 * - Codes MUST be snake_case strings.
 * - Add new codes here before using them in route handlers.
 * - Prefer generic/reusable codes over highly specific ones.
 *
 * This registry enables compile-time safety by constraining the `fail` helper
 * (see `api.ts`) to accept only declared codes. Update corresponding tests
 * when introducing new codes.
 */

export const ERROR_CODES = {
  // Auth / security
  unauthorized: 'unauthorized',
  invalid_token: 'invalid_token',
  invalid_credentials: 'invalid_credentials',
  forbidden: 'forbidden',
  cannot_delete_self: 'cannot_delete_self',

  // Validation & input
  validation_error: 'validation_error',
  invalid_json: 'invalid_json',
  invalid_body: 'invalid_body',
  invalid_id: 'invalid_id',
  invalid_user_id: 'invalid_user_id',
  invalid_kos_id: 'invalid_kos_id',
  invalid_ids: 'invalid_ids',
  invalid_photo_id: 'invalid_photo_id',
  invalid_rooms: 'invalid_rooms',
  invalid_pagination: 'invalid_pagination',
  invalid_date: 'invalid_date',
  invalid_query: 'invalid_query',
  invalid_range: 'invalid_range',
  invalid_coordinates: 'invalid_coordinates',
  invalid_radius: 'invalid_radius',
  invalid_limit: 'invalid_limit',
  invalid_action: 'invalid_action',
  invalid_transition: 'invalid_transition',
  invalid_duration: 'invalid_duration',

  // Missing / required
  missing_public_id: 'missing_public_id',
  missing_coordinates: 'missing_coordinates',
  missing_params: 'missing_params',
  no_files: 'no_files',
  no_valid_files: 'no_valid_files',

  // Conflict & uniqueness
  conflict: 'conflict',
  duplicate_review: 'duplicate_review',
  username_exists: 'username_exists',
  contact_exists: 'contact_exists',

  // Not found
  not_found: 'not_found',
  kos_not_found: 'kos_not_found',
  photo_not_found: 'photo_not_found',

  // Update / processing failures
  update_failed: 'update_failed',
  photo_upload_failed: 'photo_upload_failed',
  photo_delete_failed: 'photo_delete_failed',
  photos_retrieve_failed: 'photos_retrieve_failed',
  set_primary_failed: 'set_primary_failed',
  review_create_failed: 'review_create_failed',
  reviews_retrieve_failed: 'reviews_retrieve_failed',
  seller_kos_detail_failed: 'seller_kos_detail_failed',
  cloudinary_usage_failed: 'cloudinary_usage_failed',

  // External / upstream
  upstream_unavailable: 'upstream_unavailable',
  network_error: 'network_error',
  rate_limited: 'rate_limited',

  // Generic
  internal_error: 'internal_error',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/** Runtime guard (useful in tests) */
export function isErrorCode(value: string): value is ErrorCode {
  return Object.prototype.hasOwnProperty.call(ERROR_CODES, value as keyof typeof ERROR_CODES);
}
