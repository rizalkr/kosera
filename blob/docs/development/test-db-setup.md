# Neon Test Database Setup

This document describes how to configure and maintain the isolated Neon-hosted Postgres database used exclusively for automated tests.

## Purpose
The test database provides:
- Deterministic, isolated state for integration tests.
- Fast branching via Neon storage branching (optional future enhancement).
- Safety guard preventing destructive operations against production data.

## Environment Variables
Add the following variables to `.env.test` (never commit real credentials):
```
DATABASE_URL=postgres://<user>:<password>@<host>/<db>?sslmode=require
TEST_DB=true
```
`TEST_DB=true` is required for destructive reset helpers to run.

## Migrations
Use the dedicated test scripts defined in `package.json`:
```
npm run db:migrate:test   # Applies latest migrations
npm run db:push:test      # (If using drizzle-kit push in future)
npm run db:seed:test      # (If added) Seeds baseline data
```
Currently seeding for tests is handled inline within specific test factories for precision. Avoid running the main `seed` script against the test DB unless you need large sample data for performance tests.

## Reset Strategy
A lightweight reset helper truncates or deletes tables between test suites when necessary. The guard requires `TEST_DB=true` to proceed. This prevents accidental data loss in development or production databases.

## Branching (Planned)
Future improvement: leverage Neon branching to create ephemeral per-PR databases. Workflow outline:
1. CI job creates a branch from the main test database.
2. Runs migrations and tests against the branch.
3. Destroys the branch post-run.

## Connection Pooling
Prefer a single pooled connection (Neon driver or pg with Neon config) shared across tests. Avoid creating new clients per test to reduce overhead.

## Common Issues
| Symptom | Cause | Fix |
| ------- | ----- | --- |
| ECONNRESET / SSL errors | Missing `sslmode=require` | Append query param to `DATABASE_URL` |
| Auth failures | Incorrect user/password | Regenerate Neon role password |
| Hanging tests | Open handles (unclosed pool) | Ensure global teardown closes connections |

## Safety Checklist
- Never reuse production credentials for tests.
- Always guard destructive helpers with `TEST_DB` flag.
- Rotate test DB credentials periodically.

## TODO
- Add automated branch creation/deletion in CI
- Add seed script variant optimized for integration tests
- Add metrics collection for test query performance
