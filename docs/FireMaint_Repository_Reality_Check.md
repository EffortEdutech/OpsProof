# FireMaint Repository Reality Check

Date: 2026-10-05

## 1. Current Repository Structure

The repository was not a Git checkout at session start and contained only `docs/`, `supabase/`, `README.md`, and the migration pack zip.

Phase 0 application scaffolding has now been added: `app/`, `components/`, `lib/`, `tests/`, `public/`, package/config files, and a PWA manifest.

## 2. Framework / Package Versions

- Next.js `16.3.8`
- React `19.3.0`
- Supabase SSR `0.12.7`
- Vitest `5.0.3`
- jsdom pinned to `26.1.0` for local Node `22.14.0` compatibility

## 3. Build Status

Passes: `npm run build`

## 4. Typecheck Status

Passes: `npm run typecheck`

## 5. Test Status

Passes: `npm run test`

Current coverage is Phase 0 only: environment validation, role helpers, and health endpoint payload.

## 6. Database Migration Status

Migration files exist in the expected sequence. `025_functions.sql` was hardened by fixing a `submit_inspection` SQL syntax blocker and adding a per-organisation advisory transaction lock to `generate_report_number()`.

The migrations have not yet been applied to a live Supabase database in this session.

## 7. RLS Status

RLS policies exist in `023_rls_policies.sql`, but live cross-tenant, technician, client, and template-mutation tests are not yet implemented.

## 8. Storage Policy Status

Private storage buckets and organisation-folder policies exist in `024_storage_policies.sql`, but object access has not yet been verified against a live Supabase database.

## 9. Implemented Phases

Implemented now: Phase 0 foundation shell, protected route proxy boundary, Supabase browser/server client separation, management/technician/client route shells, health endpoint, PWA manifest, and local verification scripts.

Local development uses the `306#` port family, currently `3060`.

## 10. Missing Phases

Domain phases remain absent: clients/sites/buildings, equipment/QR, template engine, maintenance jobs, technician inspection, findings/photos, offline sync, report generation, supervisor issuance, client portal business data, dashboard/calendar metrics, and golden-path E2E.

## 11. Known Schema Mismatches

Confirmed from actual migrations: profile display field is `full_name`, not `name`; `client_id` exists on `profiles`.

Remaining schema names need verification phase by phase before feature code is written.

## 12. Security Blockers

Still blocking release: no live RLS verification, no Supabase-generated TypeScript database types, no cross-tenant integration tests, no storage policy integration tests, and no service-role usage policy tests.

## 13. Release Blockers

Release blockers remain: live Supabase migration apply/reset is unverified, the golden path is not implemented, offline sync is not implemented, PDF report generation is not implemented, and the client issued-report download flow is not implemented.

Full audit has dev-only `eslint-config-next` transitive high advisories through `braces`; production dependency audit is clean.

## 14. Recommended Implementation Order

1. Apply migrations to local Supabase and generate authoritative database types.
2. Add RLS/security integration tests.
3. Implement Phase 1 clients/sites/buildings using actual generated types.
4. Continue vertically through equipment, plans/jobs, technician inspection, findings/photos, report issuance, and client portal.
5. Add golden-path E2E once the vertical slices exist.
