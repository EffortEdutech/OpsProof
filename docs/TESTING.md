# FireMaint Testing Runbook

Bismillah.

This project has three test layers:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Unit and Build Checks

- `npm run lint` checks code style and obvious React/TypeScript issues.
- `npm run test` runs Vitest unit tests.
- `npm run build` validates the production Next.js build and route compilation.

## E2E Smoke Tests

`npm run test:e2e` runs Playwright against `http://127.0.0.1:3060`.

The baseline e2e suite always runs:

- `/api/health` response check
- `/login` render check
- unauthenticated redirects for management, technician, and client routes

If Playwright browsers are missing on a new machine, install Chromium once:

```bash
npx playwright install chromium
```

## Optional Authenticated Smokes

Authenticated e2e tests are optional and skip unless credentials are provided through environment variables.

Do not commit real passwords.

```powershell
$env:E2E_OWNER_EMAIL = "owner@example.com"
$env:E2E_OWNER_PASSWORD = "..."
$env:E2E_TECHNICIAN_EMAIL = "technician@example.com"
$env:E2E_TECHNICIAN_PASSWORD = "..."
$env:E2E_CLIENT_A_EMAIL = "client_a@example.com"
$env:E2E_CLIENT_A_PASSWORD = "..."
$env:E2E_CLIENT_B_EMAIL = "client_b@example.com"
$env:E2E_CLIENT_B_PASSWORD = "..."

npm run test:e2e
```

Authenticated coverage currently checks:

- owner reaches dashboard, maintenance, and reports
- technician lands on `/technician/today`
- Client A reaches the issued report portal
- Client B remains isolated from Client A reports

## RLS Golden Boundary Test

After setting `SUPABASE_DB_URL`, run:

```bash
npm run test:rls
```

This executes `tests/integration/sql/rls_golden_boundaries.sql` against the configured database and rolls back its test data.
