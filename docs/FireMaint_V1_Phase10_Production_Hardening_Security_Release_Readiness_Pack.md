# FireMaint V1 — Phase 10 Production Hardening, Security & Release Readiness Pack

## Bismillah.

Phase 10 introduces no new customer features.

Its sole purpose is to make FireMaint safe, stable, observable and commercially releasable.

---

# 1. Objective

Audit and harden:

1. Authentication
2. Authorization
3. RLS
4. Cross-tenant integrity
5. Storage policies
6. Offline sync resilience
7. Report immutability
8. Audit logging
9. Performance
10. Indexes
11. Error handling
12. PWA behavior
13. Backup/recovery assumptions
14. Environment security
15. Release readiness

---

# 2. Rule

Phase 10 is a defect-fixing phase.

Do NOT add:
- new modules
- new workflows
- commercial extras
- AI
- quotation
- inventory
- accounting

---

# 3. Security Review

Verify:

```text
No service-role key in browser
No cross-tenant reads
No cross-tenant writes
No client-side-only authorization
No public report bucket
No public inspection-photo bucket
No IDOR through URL changes
No arbitrary report issuance
No technician access to unassigned jobs
No client access to internal operational data
```

---

# 4. RLS Review

Mandatory tables:

```text
organisations
profiles
clients
client_contacts
sites
buildings
systems
equipment_types
equipment
maintenance_plans
maintenance_jobs
job_equipment
inspection_templates
inspection_template_items
inspections
inspection_results
findings
finding_photos
reports
notifications
audit_logs
```

Every tenant-owned table must be verified.

---

# 5. Cross-Tenant Integrity

RLS is not enough if foreign keys allow invalid tenant relationships.

Verify server-side and/or DB constraints for:

```text
site.client_id
building.site_id
system.building_id
equipment.building_id
equipment.system_id
maintenance_plan.client_id/site_id
maintenance_job.client_id/site_id
job_equipment.job_id/equipment_id
inspection.job/equipment/template
finding.job/inspection/equipment
report.job
```

---

# 6. Storage Security

Buckets:

```text
inspection-photos
report-pdfs
company-assets
documents
```

Requirements:

- private by default
- tenant path prefix
- signed URLs
- no path traversal
- no client-controlled foreign-tenant path
- content-type validation where useful
- file size limits

---

# 7. Report Immutability

Once:

```text
ISSUED
```

the report content/PDF must not be silently overwritten.

Allowed:

```text
ISSUED → VOID
```

through controlled workflow only.

Correction requires a new report.

---

# 8. Offline Sync Hardening

Test:

- duplicate retries
- network loss mid-sync
- stale PROCESSING recovery
- failed photo upload
- remote cancellation
- remote reassignment
- remote lock
- app restart
- multiple sync trigger overlap
- queue cleanup

No silent data loss.

---

# 9. Error Handling

All primary surfaces require:

```text
loading
empty
validation error
authorization error
network error
server error
retry path
```

Avoid raw SQL/Postgres errors in user-facing UI.

---

# 10. Audit Coverage

Verify events exist for:

```text
AUTH / USER ROLE CHANGES
CLIENT / SITE / EQUIPMENT changes
JOB lifecycle
INSPECTION lifecycle
FINDING lifecycle
REPORT generated/reviewed/issued/voided
QR rotation
```

---

# 11. Performance

Review:

```text
dashboard aggregates
equipment list pagination
job list pagination
findings pagination
report list pagination
client/site detail joins
inspection result loading
photo signed URLs
offline package download size
```

---

# 12. Index Review

At minimum:

```text
maintenance_jobs(organisation_id,status,scheduled_date)
maintenance_jobs(assigned_technician_id,status)
equipment(organisation_id,asset_code)
equipment(building_id)
findings(organisation_id,status,severity)
reports(organisation_id,status,issued_at)
inspections(job_id,equipment_id)
inspection_results(inspection_id)
```

---

# 13. Production Logging

Log server-side:

- auth failures
- authorization denials
- sync failures
- report-generation failures
- PDF storage failures
- unexpected exceptions

Do not log:
- passwords
- tokens
- service-role key
- full sensitive payloads unnecessarily

---

# 14. Environment Review

Verify production has:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

Only where needed.

Production secrets must be configured in deployment environment, never committed.

---

# 15. PWA Hardening

Verify:

- installable manifest
- technician routes load reliably
- no stale service-worker behavior
- offline shell works
- sync status visible
- app updates do not destroy unsynced IndexedDB data

---

# 16. Backup & Recovery Assumptions

Document:

- Supabase database backup policy
- storage backup assumptions
- restore procedure
- migration rollback approach
- report PDF recovery
- local unsynced-data limitations

Artifact #17 expands this operationally.

---

# 17. Production Readiness Checklist

```text
[ ] Auth tested
[ ] RLS tested
[ ] tenant integrity tested
[ ] storage private
[ ] signed URLs tested
[ ] no secret leakage
[ ] offline sync stress tested
[ ] report immutability verified
[ ] audit coverage reviewed
[ ] indexes reviewed
[ ] dashboard performance acceptable
[ ] PWA install works
[ ] mobile technician UX verified
[ ] build passes
[ ] E2E passes
[ ] UAT blockers zero
```

---

# 18. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 10 ONLY.

This is a hardening phase.
Do not add new product features.

AUDIT:
Authentication
Authorization
RLS
Tenant integrity
Storage
Offline sync
Report immutability
Audit logs
Indexes
Performance
Error handling
PWA behavior
Environment security

FIX:
Only defects and production-readiness gaps.

RUN:
lint
typecheck
unit tests
integration tests
RLS tests
offline E2E
golden path E2E
production build

END WITH:
PRODUCTION READINESS REPORT

Critical issues:
High issues:
Medium issues:
Low issues:
Security:
Performance:
Offline:
Reports:
Build:
Ready for UAT: YES/NO
```

## Phase 10 Principle

> **No new features. Remove release risk.**
