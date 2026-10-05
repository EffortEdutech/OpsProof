# FireMaint V1 — Phase 8 Supervisor Review, Report Issuance & Client Portal Implementation Pack

## Bismillah.

Phase 8 converts generated reports into controlled, client-visible records.

```text
GENERATED
   ↓
SUPERVISOR REVIEW
   ↓
REVIEWED
   ↓
ISSUED
   ↓
CLIENT PORTAL
```

# 1. Objective

Implement:

1. Supervisor review queue
2. Report review detail
3. Review approval
4. Report issuance
5. Controlled void flow
6. Client portal dashboard
7. Client reports
8. Client equipment/history
9. Client findings view
10. Client-only RLS
11. Tests and Phase 9 handoff

# 2. Review Queue

Route:

```text
/reports
```

Show:

```text
Report Number
Client
Site
Job
Generated
Status
Reviewer
```

Filters:

```text
GENERATED
REVIEWED
ISSUED
VOID
```

# 3. Review Detail

Supervisor sees:

- maintenance summary
- equipment results
- findings
- photos
- PDF preview/download
- technician
- dates

Actions:

```text
MARK REVIEWED
ISSUE REPORT
VOID REPORT
```

# 4. Authorization

Review/issue:

```text
OWNER
ADMIN
SUPERVISOR
```

Technician cannot issue.

Client cannot mutate.

# 5. Status Rules

```text
GENERATED → REVIEWED
REVIEWED → ISSUED
ISSUED → VOID
```

Do not allow:

```text
GENERATED → ISSUED
```

unless explicitly configured later.

# 6. Controlled Void

`voidReport(reportId, reason)`

Requirements:

- authorized management role
- reason required
- issued PDF remains preserved
- status becomes VOID
- audit event written
- replacement report created separately

# 7. Client Portal Routes

```text
/client/dashboard
/client/reports
/client/reports/[id]
/client/equipment
/client/equipment/[id]
/client/findings
```

# 8. Client Dashboard

Show:

```text
Last Maintenance
Next Maintenance
Active Assets
Open Findings
Recent Reports
```

No internal operational notes.

# 9. Client Reports

Only:

```text
ISSUED
```

reports should be visible.

VOID may be shown as historical/voided if desired, but not as current valid report.

# 10. Client Equipment

Read-only.

Show:

- asset code
- type
- location
- current status
- last maintenance
- next maintenance
- maintenance history foundation

# 11. Client Findings

Read-only.

Show:

```text
OPEN
IN_PROGRESS
RESOLVED
VERIFIED
CLOSED
```

Do not expose internal technician-only notes unless explicitly configured.

# 12. Client RLS

Client user access must be constrained by:

```text
profile.client_id
```

The client can only read:

```text
their client
their sites
their buildings
their equipment
their issued reports
their findings
their maintenance history
```

# 13. Signed PDF Access

Client download flow:

```text
Client requests report
 ↓
RLS confirms report belongs to client
 ↓
Server generates signed URL
 ↓
Client downloads private PDF
```

Do not make report bucket public.

# 14. Notifications

Phase 8 can trigger:

```text
REPORT_READY
```

Optional email later.

# 15. Audit Events

```text
REPORT_REVIEWED
REPORT_ISSUED
REPORT_VOIDED
CLIENT_REPORT_VIEWED
CLIENT_REPORT_DOWNLOADED
```

# 16. Tests

RLS:

- Client A cannot read Client B reports
- Client cannot read GENERATED report
- Client can read own ISSUED report
- Client cannot mutate findings/equipment/reports

E2E:

```text
Supervisor Login
 ↓
Review Generated Report
 ↓
Mark Reviewed
 ↓
Issue
 ↓
Client Login
 ↓
Dashboard
 ↓
Open Report
 ↓
Download PDF
```

# 17. Acceptance Criteria

```text
[ ] review queue works
[ ] generated report detail works
[ ] review transition works
[ ] issue transition works
[ ] void requires reason
[ ] issued PDF preserved
[ ] client dashboard works
[ ] own reports visible
[ ] only issued reports visible
[ ] equipment read-only
[ ] findings read-only
[ ] signed PDF download works
[ ] cross-client access denied
[ ] internal data not leaked
[ ] lint/typecheck/tests/build pass
```

# 18. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 8 ONLY.

Confirm Phases 0–7 pass.

OBJECTIVE:
Supervisor Review → Report Issuance → Client Portal

REPORT WORKFLOW:
GENERATED → REVIEWED → ISSUED
ISSUED → VOID only through controlled function with reason.

CLIENT PORTAL:
- dashboard
- reports
- report detail/download
- equipment
- equipment detail
- findings

SECURITY:
Client access based on profile.client_id.
Issued reports only.
Read-only client portal.
Private PDF bucket with signed URLs.

TEST:
RLS
review/issue transitions
void flow
client portal E2E

STOP:
Do not begin Phase 9.

END WITH:
IMPLEMENTATION SUMMARY
Ready for Phase 9: YES/NO
```

## Phase 8 Principle

> **The client sees trusted, issued maintenance evidence — not internal operational noise.**
