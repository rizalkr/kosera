# Docker-Based Testing Workflow

This document describes how to run the Kosera test suites in an isolated Docker environment using the dedicated `db_test` PostgreSQL service.

## Services

- `db` (development database) on host port 5432
- `db_test` (test database) on host port 5433 (internally 5432)
- `app` Next.js development container

The test database has its own volume `postgres_test_data` to isolate data from development.

## Environment Variables

The file `.env.test` is loaded automatically by the test bootstrap (`tests/setup/env.ts`). It now uses:
```
DATABASE_URL=postgresql://kosera:kosera123@db_test:5432/kosera_test
```
When running tests directly on the host (without `docker exec`) uncomment the localhost line inside `.env.test`:
```
# DATABASE_URL=postgresql://kosera:kosera123@localhost:5433/kosera_test
```

`NODE_ENV` is forced to `test` by all test scripts to enable safety checks in `tests/setup/db.ts`.

## Scripts Overview

| Script | Purpose |
| ------ | ------- |
| `npm run docker:test:setup` | Starts the `db_test` container (and leaves `app` untouched if already running) |
| `npm run docker:db:migrate:test` | Runs drizzle migrations inside the app container against test DB |
| `npm run docker:db:push:test` | Idempotent schema sync (safe if migrations already applied) |
| `npm run docker:test:unit` | Executes unit tests in the container |
| `npm run docker:test:integration` | Executes integration tests |
| `npm run test:unit` | Run unit tests on host (needs local Postgres accessible if using localhost DATABASE_URL) |

## Typical Workflow (Inside Docker)

1. Start core services (if not already):
   ```bash
   docker compose up -d app db db_test
   ```
2. Ensure test DB is healthy (optional check):
   ```bash
   docker ps --filter name=kosera-db-test
   ```
3. Apply migrations to test DB:
   ```bash
   npm run docker:db:migrate:test
   ```
   Or, if you just want to ensure schema is in sync without failing on already-applied changes:
   ```bash
   npm run docker:db:push:test
   ```
4. Run tests:
   ```bash
   npm run docker:test:unit
   npm run docker:test:integration
   ```

## Auto Migration Option

Set `DRIZZLE_MIGRATE_ON_TEST=1` when invoking tests to apply migrations automatically in `beforeAll` hook:
```bash
DRIZZLE_MIGRATE_ON_TEST=1 npm run docker:test:unit
```

## Adding New Tests

- Unit tests live in `tests/unit/` and do not hit live endpoints (pure functions, helpers)
- Integration tests in `tests/integration/` use `testFetch` / `authFetch` to call API routes
- Use response envelope helpers in `tests/helpers/envelope.ts` for consistent assertions

## Safety Mechanisms

`tests/setup/db.ts` enforces:
- `NODE_ENV` must be `test`
- Warns if `DATABASE_URL` does not contain `test`, `_test` or port `5433`

## Troubleshooting

| Issue | Cause | Fix |
| ----- | ----- | --- |
| `[resetDatabase] NODE_ENV must be test` | Test scripts not prefixed with `NODE_ENV=test` | Use provided npm scripts |
| Connection refused on test DB | `db_test` not started | `npm run docker:test:setup` |
| Migrations missing | Not applied to test DB | Run `npm run docker:db:migrate:test` or use env flag |

## Future Enhancements

- Add coverage collection inside container
- Add parallel test strategy with separate schemas
- Integrate CI pipeline using same scripts

## Persistence vs Isolation

Two modes of running integration tests:

1. Isolation (Default)
   - Command: `npm run docker:test:integration`
   - Behavior: Each test file triggers a TRUNCATE reset (implemented in `tests/setup/global.ts`).
   - Use When: Tests should not depend on ordering or shared state.

2. Persistence
   - Command: `npm run docker:test:integration:persist`
   - Env: Sets `INTEGRATION_PERSIST=1` to skip per-file reset.
   - Behavior: State (inserted rows) accumulates across test files allowing multi-step flows spanning files.
   - Use When: You need to inspect evolving state or run additive scenario tests (e.g., conflict detection sequences) without rebuilding fixtures repeatedly.

Guideline: Prefer Isolation for reliability. Switch to Persistence temporarily for exploratory debugging or scenario chaining, then revert.

---
Maintainer: Automated addition via test-docker setup task.
