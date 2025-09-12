# API Response Standard

This document defines the standardized JSON response envelope used across all Kosera API endpoints.

## Envelope Structure

All responses MUST be JSON objects with one of the following shapes:

Success:
```
{
  "success": true,
  "message": string,        // human-readable summary
  "data": { ... }           // payload (object, array, primitive)
}
```
Error:
```
{
  "success": false,
  "error": string,          // machine-readable snake_case error code
  "message": string?,       // optional human-friendly message (may be localized)
  "details": unknown?       // optional structured metadata (validation issues, etc.)
}
```

## Core Principles
1. Deterministic shape: clients first inspect `success` boolean.
2. Stable error codes: ALL lowercase snake_case identifiers.
3. Messages: required for success, optional for error (only if adds value beyond the code).
4. Validation: use `validation_error` plus structured zod flatten result in `details`.
5. Never leak internal implementation (SQL fragments, stack traces) to clients.
6. Lists must wrap items inside an object (never top-level arrays) and include pagination metadata when pageable.
7. HTTP status communicates transport outcome; body does not duplicate status.
8. Use specific codes over generic ones. Reserve `internal_error` for unexpected faults.

## Pagination Structure
```
{
  "success": true,
  "message": "<summary>",
  "data": {
    "items": T[],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number,
      "hasNext": boolean,
      "hasPrev": boolean
    }
  }
}
```
Optional: `filters` key for echoed validated query params.

## Helper Functions
Defined in `src/types/api.ts`:
- `ok(message, data, init?)` → Response
- `fail(error, message?, details?, init?)` → Response
- `createSuccess(message, data)` → envelope object
- `createError(error, message?, details?)` → envelope object

All helpers emit proper `Content-Type: application/json` header.

## Standard Error Codes (Current Set)

Authentication & Authorization:
- unauthorized
- forbidden
- invalid_token

Validation / Request Formatting:
- invalid_json
- validation_error
- invalid_id (generic) / invalid_user_id / invalid_kos_id / invalid_photo_id / invalid_kos_ids / invalid_ids
- invalid_pagination
- invalid_coordinates
- missing_coordinates
- invalid_radius
- invalid_limit
- invalid_range
- invalid_date
- invalid_rooms

Conflict / Uniqueness / State:
- username_exists
- contact_exists
- conflict
- duplicate_review
- cannot_delete_self
- invalid_transition

Resource Lookup:
- not_found (generic)
- kos_not_found
- photo_not_found
- review_not_found

Domain Operations / Processing:
- update_failed
- photo_upload_failed
- photo_delete_failed
- review_create_failed
- set_primary_failed
- seller_kos_detail_failed
- cloudinary_usage_failed

System / Infra:
- internal_error
- network_error
- upstream_unavailable
- rate_limited

## HTTP Status Guidelines
- 200 OK: Successful retrieval / mutation (including delete soft operations)
- 201 Created: (Optional) resource creation (currently many endpoints return 200 for simplicity)
- 400 Bad Request: Input / validation / semantic issues
- 401 Unauthorized: Missing / invalid authentication
- 403 Forbidden: Authenticated but lacks required role/ownership
- 404 Not Found: Resource does not exist or filtered out (soft-deleted)
- 409 Conflict: Duplicate / uniqueness violation / unsafe state change
- 429 Too Many Requests: Rate limiting (planned / partially implemented)
- 500 Internal Server Error: Unhandled server fault
- 503 Service Unavailable: Upstream dependency degraded (`upstream_unavailable`)

## Examples

Successful List:
```
{
  "success": true,
  "message": "Bookings retrieved",
  "data": {
    "items": [ { "id": 1, "status": "confirmed" }, { "id": 2, "status": "pending" } ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```
Validation Error:
```
{
  "success": false,
  "error": "validation_error",
  "message": "Invalid input",
  "details": {
    "fieldErrors": { "username": ["String must contain at least 3 character(s)"] }
  }
}
```
Conflict Example:
```
{
  "success": false,
  "error": "username_exists",
  "message": "Username already exists"
}
```
Internal Error:
```
{
  "success": false,
  "error": "internal_error",
  "message": "Failed to create booking"
}
```

## Implementation Checklist Per Endpoint
- [ ] Uses `ok` / `fail` helpers only (no `NextResponse`)
- [ ] All error codes snake_case
- [ ] No `any` types; strong typing for payload & query parsing
- [ ] Input validated with zod (`safeParse`) before side effects
- [ ] Pagination metadata returned for collections
- [ ] Sensitive internal errors are logged, not exposed
- [ ] Tests assert on `success` and `error` fields (not brittle message-only assertions)
- [ ] Conflict scenarios mapped to 409 with proper code

## Migration Notes
- Legacy code `username_taken` replaced by `username_exists` (409)
- Some older endpoints used mixed-case codes; these were normalized
- Tests must be updated to assert new codes where changed

## Future Enhancements (TODO)
- Central registry (enum) of error codes exported for test compile-time safety
- Structured booking transition errors: include `from`, `to`, `allowed` arrays in `details`
- Consistent i18n layer for `message` with locale negotiation
- Rate limit responses include `details.retryAfterSeconds`
- Add correlation ID injection for tracing (surface in `details` for internal_error in non-production only)
