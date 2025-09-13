# Continuous Integration Workflow

This document describes the CI pipeline implemented via GitHub Actions in `.github/workflows/ci.yml`.

## Overview
The pipeline runs on:
- Pushes to `main`
- Pull requests targeting `main`
- Manual dispatch

## Job Structure
1. `test` job
   - Spins up a Postgres 16 service for the test database
   - Sets `DATABASE_URL` to `postgresql://kosera:kosera123@localhost:5433/kosera_test`
   - Steps:
     1. Checkout
     2. Setup Node (20.x) with npm cache
     3. Install dependencies (`npm ci`)
     4. `npm run db:push:test` (Drizzle schema sync; idempotent)
     5. Lint (`npm run lint`)
     6. Type check (`npm run typecheck`)
     7. Unit tests (`npm run test:unit`)
     8. Integration tests (`npm run test:integration`)
     9. Coverage collection (non-blocking)

2. `build` job
   - Depends on `test`
   - Re-installs deps and builds Next.js application
   - Uploads `.next` build artifact (retained 7 days)

## Environment Variables
- `NODE_ENV=test` during tests for safety guards
- `JWT_SECRET=ci-test-secret` (ephemeral; override with repo secret if needed)
- `NEXT_TELEMETRY_DISABLED=1` to avoid telemetry noise

## Database Strategy
We use a dedicated Postgres service container (not docker-compose). Schema is synced with `db:push:test` to reduce migration friction. For stricter migration validation you can replace with:
```yaml
- name: Run Migrations
  run: npm run db:migrate:test
```

## Caching
`actions/setup-node` with `cache: npm` handles dependency caching automatically.

## Adding New Test Suites
Add a new npm script then append a step under the `test` job. Keep critical suites (lint, typecheck, unit, integration) early to fail fast.

## Troubleshooting
| Symptom | Cause | Action |
| ------- | ----- | ------ |
| Connection refused to Postgres | Service not healthy yet | Increase health retries or add wait step |
| Drizzle fails on existing column | Use `db:push:test` instead of `migrate` in CI |
| OOM during build | Increase memory or prune dev deps | Optimize `next.config.ts` and disable large optional features |

## Future Enhancements
- Cache Drizzle generated artifacts
- Parallelize unit/integration via job matrix
- Add Lighthouse CI for performance budgets
- Add docker image build & push stage

---
Maintainer: CI setup automation.
