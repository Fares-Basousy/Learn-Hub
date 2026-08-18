# End-to-end tests

Playwright specs covering real browser flows: auth/route protection, the
public landing page, and admin CRUD (organizations, news).

## ⚠️ Never run against production

These tests create and delete real records (they clean up after themselves,
but a crash mid-test can leave test data behind, and the login test signs in
as a real admin user). **Only point `DATABASE_URL`/`postgresql` at a
disposable dev/test database**, never at production.

## Setup

```bash
# 1. Point .env at a dev/test database (see repo root README)
# 2. Seed it — this also creates the admin login used by these tests
pnpm seed

# 3. Install the Playwright browser (one-time)
npx playwright install chromium

# 4. Run the suite (starts `pnpm dev` automatically if not already running)
pnpm test:e2e
```

## Configuration

- `PLAYWRIGHT_BASE_URL` — override the URL under test (defaults to `http://localhost:3000`)
- `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` — override the login used by tests (defaults to the seed script's `admin@school.local` / `password123`)
