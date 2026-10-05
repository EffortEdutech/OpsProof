# FireMaint V1 — Support, Incident & Data Recovery Runbook

## Bismillah.

This artifact defines how support handles operational issues after launch.

# Support Categories

- login/access
- data/configuration
- technician sync
- inspection
- photo upload
- report generation
- client portal
- billing/commercial

# Incident Priority

```text
P1 — production unavailable / data-loss risk
P2 — major workflow blocked
P3 — partial issue / workaround exists
P4 — minor request / cosmetic
```

# Technician Sync Incident

Never tell the user to clear browser/app data first.

Steps:
1. Record job number/user/device.
2. Check sync status.
3. Preserve IndexedDB/local work.
4. Retry safely.
5. Export/recover if needed.
6. Escalate before cleanup.

# Incorrect Issued Report

```text
Do not overwrite.
VOID incorrect report.
Generate corrected report.
Review.
Issue new report.
Preserve audit trail.
```

# Data Recovery

Use:
- server backups
- point-in-time recovery if enabled
- audit logs
- preserved local offline data
- report PDFs

# Support Case Data

Capture:
- organisation
- user
- job number
- asset code
- inspection ID
- report number
- timestamp
- error message
- screenshot
- sync state

# Escalation

P1:
- technical owner immediately
- freeze destructive changes
- preserve logs/evidence

P2:
- same business day target

# Principle

> **Protect evidence first; troubleshoot second.**
