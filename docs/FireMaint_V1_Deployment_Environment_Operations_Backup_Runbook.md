# FireMaint V1 — Deployment, Environment, Operations & Backup Runbook

## Bismillah.

Artifact #17 defines how FireMaint is deployed, operated, monitored, backed up and recovered.

Target:

```text
Application: Vercel
Backend: Supabase
Database: PostgreSQL
Storage: Supabase Storage
Auth: Supabase Auth
```

---

# 1. Environments

Use separate environments:

```text
Development
Staging
Production
```

Never use production as development.

---

# 2. Supabase Projects

Recommended:

```text
firemaint-dev
firemaint-staging
firemaint-prod
```

Each has separate:

- database
- auth users
- storage
- secrets
- URLs/keys

---

# 3. Vercel Projects / Environments

At minimum:

```text
Preview
Production
```

Recommended staging domain:

```text
staging.firemaint...
```

Production:

```text
app.firemaint...
```

---

# 4. Environment Variables

Public:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

Server-only:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Never commit real secrets.

---

# 5. Migration Deployment

Rule:

> Database changes only through migrations.

Deployment sequence:

```text
Backup / confirm recovery point
 ↓
Apply migration to staging
 ↓
Run smoke tests
 ↓
Run RLS tests
 ↓
Deploy app staging
 ↓
UAT
 ↓
Apply migration production
 ↓
Deploy production app
 ↓
Smoke test
```

---

# 6. Migration Safety

Before production migration:

- verify non-destructive
- assess lock time
- assess large-table impact
- verify rollback or forward-fix plan
- snapshot/backup where available

Avoid irreversible production changes without explicit plan.

---

# 7. Release Procedure

```text
1. Freeze release candidate
2. Run Artifact #16 suite
3. GO decision
4. Confirm DB backup/recovery
5. Apply production migrations
6. Deploy application
7. Run smoke tests
8. Verify auth
9. Verify technician workflow
10. Verify report download
11. Monitor logs
```

---

# 8. Smoke Tests

Production smoke:

```text
/login loads
/api/health returns ok
admin login works
dashboard loads
client list query works
technician assigned-job query works
client portal loads
private report signed URL works
```

Do not create destructive sample data in production smoke unless using designated test tenant.

---

# 9. Rollback Strategy

Application:

```text
Vercel previous deployment
```

Database:

Prefer:

```text
forward-fix migration
```

For severe incidents:

```text
restore backup / point-in-time recovery
```

depending on Supabase plan/features.

Never assume app rollback reverses database migration.

---

# 10. Backup Runbook

Document actual production capabilities for:

- automated database backups
- point-in-time recovery if enabled
- storage object retention
- exported critical reports
- configuration/version history

Schedule periodic recovery drills.

---

# 11. Restore Drill

At least before commercial launch:

```text
restore database copy to isolated environment
 ↓
connect staging app
 ↓
verify tenant data
 ↓
verify reports/findings
 ↓
verify auth assumptions
```

A backup is not proven until restore is tested.

---

# 12. Monitoring

Monitor:

```text
application errors
auth failures
database errors
sync failures
storage upload failures
PDF generation failures
slow queries
deployment failures
```

---

# 13. Operational Alerts

High priority:

```text
production unavailable
database unavailable
auth unavailable
mass sync failures
report generation failures
storage failures
```

---

# 14. Incident Severity

```text
SEV-1
Production unavailable / data-loss risk

SEV-2
Major workflow unavailable

SEV-3
Partial feature degradation

SEV-4
Minor/cosmetic
```

---

# 15. SEV-1 Immediate Actions

1. Confirm scope.
2. Stop destructive releases.
3. Preserve evidence/logs.
4. Assess data-loss risk.
5. Roll back app if appropriate.
6. Disable affected mutation path if needed.
7. Restore/recover only with validated plan.
8. Record incident timeline.

---

# 16. Offline Sync Incident

If sync defect discovered:

- do not instruct users to clear browser data
- preserve IndexedDB
- disable unsafe cleanup
- export/recover local data where possible
- patch idempotency/conflict logic

---

# 17. Report Incident

If incorrect report issued:

```text
Do not overwrite.
VOID original.
Generate corrected report.
Re-issue.
Preserve audit history.
```

---

# 18. User Support Operational Data

Support should be able to obtain:

```text
organisation
user
job number
inspection id
report number
sync status
error timestamp
```

without requiring passwords.

---

# 19. Production Access

Limit production privileged access.

Principles:

- least privilege
- named accounts
- MFA
- no shared admin credentials
- no service-role key pasted into client tools

---

# 20. Scheduled Operational Reviews

Weekly initially:

```text
failed syncs
failed PDF generations
open critical incidents
slow queries
storage growth
database growth
backup status
```

Monthly:

```text
restore readiness
security review
dependency updates
performance review
```

---

# 21. Data Retention

Define retention for:

- audit logs
- notification logs
- generated PDFs
- inspection photos
- local offline cache
- deleted/deactivated business records

Avoid arbitrary hard deletion of maintenance evidence.

---

# 22. Launch-Day Checklist

```text
[ ] Production env vars
[ ] Production Supabase migrations
[ ] RLS suite pass
[ ] Storage policy pass
[ ] Production domain
[ ] SSL
[ ] Auth redirect URLs
[ ] PWA manifest
[ ] Health endpoint
[ ] Backup confirmed
[ ] Rollback identified
[ ] Demo/support admin account
[ ] Monitoring
[ ] Smoke test
```

---

# 23. Operations Prompt

```text
Bismillah.

Prepare FireMaint production deployment.

DO NOT add features.

VERIFY:
- approved release candidate
- Artifact #16 GO decision
- backup/recovery point
- production environment variables
- migration order
- RLS policies
- storage policies

DEPLOY:
1. migrations
2. application
3. smoke tests

MONITOR:
auth
database
sync
storage
PDF generation
errors

REPORT:
Version deployed:
Migrations:
Build:
Smoke tests:
Backup state:
Rollback target:
Incidents:
Production status: HEALTHY / DEGRADED / ROLLED BACK
```

## Artifact #17 Principle

> **Deployment is a controlled operational procedure, not a button press.**
