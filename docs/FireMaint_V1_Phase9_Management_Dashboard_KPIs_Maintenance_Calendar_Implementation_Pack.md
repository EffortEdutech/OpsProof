# FireMaint V1 — Phase 9 Management Dashboard, KPIs & Maintenance Calendar Implementation Pack

## Bismillah.

Phase 9 turns FireMaint operational data into management visibility.

The dashboard must answer:

> **What needs my attention?**

# 1. Objective

Implement:

1. Management dashboard
2. Job KPIs
3. Finding KPIs
4. Report KPIs
5. Upcoming maintenance
6. Maintenance calendar
7. Client/site overview
8. Efficient aggregate queries
9. Basic trend views
10. Tests and Phase 10 handoff

# 2. Dashboard Cards

## Jobs

```text
Scheduled
In Progress
Submitted
Overdue
Completed Today
```

## Findings

```text
Open
Critical
High
Medium
Low
```

## Reports

```text
Pending Review
Reviewed
Issued
Void
```

## Upcoming

```text
Next 7 Days
Next 30 Days
```

# 3. Performance Rule

Do not fetch all rows to calculate cards.

Use:

```text
COUNT
FILTER
GROUP BY
RPC / VIEW
```

server-side.

# 4. Dashboard Queries

Recommended:

```text
dashboard_job_summary()
dashboard_finding_summary()
dashboard_report_summary()
dashboard_upcoming_maintenance()
dashboard_client_summary()
```

# 5. Today View

Example:

```text
TODAY

12 Scheduled
3 In Progress
7 Completed
2 Overdue
```

# 6. Findings Attention

```text
CRITICAL  2
HIGH      8
MEDIUM   21
LOW      14
```

Click-through to filtered findings.

# 7. Report Attention

```text
9 Pending Review
16 Issued This Month
```

# 8. Maintenance Calendar

Route:

```text
/maintenance/calendar
```

Views:

```text
Month
Week
List
```

Event:

```text
ABC Manufacturing
Quarterly Maintenance
02 Oct 2026
Technician: Ahmad
Status: Scheduled
```

# 9. Calendar Filters

```text
Client
Site
Technician
Status
```

# 10. Client/Site Overview

Client detail dashboard:

```text
Active Sites
Active Assets
Open Findings
Last Maintenance
Next Maintenance
Issued Reports
```

Site overview:

```text
Assets
Systems
Open Findings
Upcoming Maintenance
Recent Reports
```

# 11. Finding Trends

V1 basic trend:

- findings by severity
- findings opened vs closed
- repeat findings by equipment
- overdue unresolved findings

Do not add AI.

# 12. Job Completion Metrics

Useful:

```text
scheduled this month
completed this month
completion rate
overdue count
average days late
```

# 13. KPI Date Windows

Support:

```text
Today
7 Days
30 Days
This Month
Custom later
```

# 14. Query Design

Prefer:

- SQL views
- RPCs
- indexed filters
- compact result objects

Avoid nested multi-megabyte joins.

# 15. Index Review

Before production dashboard:

Verify indexes on:

```text
maintenance_jobs(organisation_id,status,scheduled_date)
findings(organisation_id,status,severity,created_at)
reports(organisation_id,status,issued_at)
maintenance_plans(organisation_id,start_date)
```

# 16. Dashboard Route

```text
/dashboard
```

Management only.

Client has separate portal dashboard from Phase 8.

# 17. Access

```text
OWNER
ADMIN
SUPERVISOR
```

Technician uses technician-specific Today/Jobs views.

# 18. Empty States

Examples:

> No jobs scheduled today.

> No critical findings.

> No reports waiting for review.

Dashboard should remain useful even with little data.

# 19. Tests

Unit:

- KPI transforms
- date-window logic
- calendar grouping

Integration:

- aggregate query correctness
- tenant isolation
- overdue counts
- finding severity counts

E2E:

```text
Admin Login
 ↓
Dashboard
 ↓
Verify cards
 ↓
Open overdue jobs
 ↓
Open critical findings
 ↓
Open calendar
 ↓
Filter technician
```

# 20. Acceptance Criteria

```text
[ ] dashboard cards accurate
[ ] no full-table client calculation
[ ] overdue count accurate
[ ] finding severity counts accurate
[ ] report status counts accurate
[ ] next-7-day jobs accurate
[ ] calendar works
[ ] filters work
[ ] client/site overview works
[ ] tenant isolation holds
[ ] indexes reviewed
[ ] lint/typecheck/tests/build pass
```

# 21. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 9 ONLY.

Confirm Phases 0–8 pass.

OBJECTIVE:
Build management dashboard, KPI summaries and maintenance calendar.

DASHBOARD:
Jobs
Findings
Reports
Upcoming Maintenance

QUERY RULE:
Do not fetch full datasets just to count them.
Use aggregate SQL/RPC/view queries.

CALENDAR:
month/week/list
client/site/technician/status filters

CLIENT/SITE OVERVIEW:
assets
findings
last/next maintenance
reports

SECURITY:
Management roles only.
Tenant isolation remains authoritative.

TEST:
aggregate correctness
date windows
RLS
E2E

STOP:
Do not begin Phase 10.

END WITH:
IMPLEMENTATION SUMMARY
Ready for Phase 10: YES/NO
```

## Phase 9 Principle

> **The dashboard exists to surface action, not decoration.**
