# API Response Standard

All API endpoints return a consistent JSON envelope to simplify client integration, automated testing, and error handling.

## Envelope Shapes

Success:
```
{
  "success": true,
  "message": string,        // Human-readable success message
  "data": { ... }           // Payload object (never null). Shape varies per endpoint
}
```
Error:
```
{
  "success": false,
  "error": string,          // Machine-friendly stable error code (snake_case)
  "message": string?,       // Optional human readable explanation (can be localized)
  "details": any?           // Optional structured validation / field level errors
}
```

## Conventions
- `error` MUST be a stable snake_case identifier (e.g. `invalid_json`, `validation_error`, `authentication_required`).
- Always include a descriptive `message` for successes. For errors include when it adds value beyond the code.
- Validation errors should use `validation_error` (or a more specific code) and put the flattened Zod output under `details`.
- Never return raw database / internal error messages to clients.
- Pagination responses embed metadata under `pagination` inside `data`.

## Helpers
Implemented in `src/types/api.ts`:
- `ok(message, data)` -> Response
- `fail(code, message?, details?, init?)` -> Response
- `createSuccess(message, data)` -> envelope object
- `createError(code, message?, details?)` -> envelope object

## Pagination Shape
```
{
  "success": true,
  "message": "...",
  "data": {
    "items" | "results": [...],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number,
      "hasNext": boolean,
      "hasPrev": boolean
    },
    "filters": { ... } // optional
  }
}
```

## HTTP Status Guidelines
- 200: Successful read/update/delete operations.
- 201: Resource creation (if needed; current pattern keeps 200 for simplicity but 201 allowed).
- 400: Validation / malformed input (`validation_error`, `invalid_json`, `invalid_*`).
- 401: Authentication failure (`authentication_required`, `invalid_token`).
- 403: Authorization failure (`forbidden`).
- 404: Resource not found (`*_not_found`).
- 409: Conflict/uniqueness (`username_exists`, `contact_exists`).
- 429: Rate limiting (`rate_limited`) – planned.
- 500: Unexpected server errors (`internal_error`).

## Migration Notes
- Legacy endpoints using `NextResponse.json` have been refactored to the Fetch API `Response` + helpers.
- Remaining tasks: unify any outstanding multipart/form-data utilities that still expect `NextRequest`.

## Testing Implications
- Tests should assert `success` boolean first, then branch on `data` or `error`.
- Avoid brittle field ordering checks—order is not guaranteed.

## TODO
- Introduce global error mapping util to collapse repetitive try/catch patterns.
- Add rate limit envelopes with `retryAfter` hint in `details`.
- Add i18n strategy for `message` field.
