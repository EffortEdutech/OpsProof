# FireMaint V1 — Supabase Migration Pack + Seed Pack

Bismillah.

This repository now contains the FireMaint V1 Supabase migration baseline and the Phase 0 Next.js application shell.

## Application

Install dependencies:

```bash
npm i
```

Create environment values from `.env.example`, then run:

```bash
npm run dev
```

Verify:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Health endpoint:

```text
/api/health
```

See `docs/FireMaint_Repository_Reality_Check.md` for the current implementation audit.

## Supabase

This pack is the database implementation baseline for FireMaint V1.

## Migration order

001_extensions.sql
002_organisations.sql
003_profiles.sql
004_clients.sql
005_client_contacts.sql
006_sites.sql
007_buildings.sql
008_systems.sql
009_equipment_types.sql
010_equipment.sql
011_maintenance_plans.sql
012_maintenance_jobs.sql
013_job_equipment.sql
014_inspection_templates.sql
015_inspection_template_items.sql
016_inspections.sql
017_inspection_results.sql
018_findings.sql
019_finding_photos.sql
020_reports.sql
021_audit_logs.sql
022_notifications.sql
023_rls_policies.sql
024_storage_policies.sql
025_functions.sql
026_indexes.sql
027_seed_reference_data.sql

## Apply

Preferred:
    supabase db reset

or:
    supabase migration up

The demo seed is intentionally separate from reference/config seed:
    psql "$DATABASE_URL" -f supabase/seed/001_demo_seed.sql

## Security rules

- `service_role` is server-only.
- All application tables are organisation-scoped except `organisations` and `profiles`.
- RLS is enabled on all application tables.
- Client users are restricted to their own client record.
- Technicians are restricted to jobs assigned to their profile.
- Issued reports are immutable through normal application roles.
- Storage buckets are private; application code should use signed URLs.
- QR tokens are opaque random tokens, not UUIDs or sequential IDs.

## Seed users

The demo seed creates organisation/business data but does NOT create auth.users.
Create auth users through Supabase Auth, then link their profile using the documented profile insert flow.

## Expected V1 vertical slice

Fire Extinguisher -> Maintenance Job -> Technician Inspection -> Finding/Photo
-> Submit -> Report -> Issue -> Client Portal.
