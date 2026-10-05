# FireMaint V1 — Phase 4 Maintenance Planning, Jobs & Technician Assignment Vertical Slice Implementation Pack

## Bismillah.

Phase 4 builds the operational scheduling spine of FireMaint.

```text
MAINTENANCE PLAN
      ↓
MAINTENANCE JOB
      ↓
JOB EQUIPMENT
      ↓
TECHNICIAN ASSIGNMENT
      ↓
TECHNICIAN WORK QUEUE
```

# 1. Objective

Implement:

1. Maintenance Plans
2. Frequency / recurrence handling
3. Maintenance Jobs
4. Server-generated job numbers
5. Explicit Job Equipment selection
6. Technician assignment
7. Controlled job state transitions
8. Technician work queue
9. Derived overdue state
10. Tests and Phase 5 handoff

# 2. Non-Goals

Do not implement yet:

- inspection-result persistence
- findings
- photos
- offline sync
- PDF reports
- client report portal

Phase 5 executes inspections against the jobs created here.

# 3. Domain Flow

```text
Client
  ↓
Site
  ↓
Maintenance Plan
  ↓
Scheduled Job
  ↓
Selected Equipment
  ↓
Assigned Technician
  ↓
Technician Work Queue
```

# 4. Existing Tables

Reuse:

```text
maintenance_plans
maintenance_jobs
job_equipment
profiles
equipment
```

Do not duplicate migration-pack tables.

# 5. Maintenance Plan

Fields:

```text
organisation_id
client_id
site_id
name
frequency
interval_days
start_date
end_date
active
```

Frequency:

```text
MONTHLY
QUARTERLY
HALF_YEARLY
YEARLY
CUSTOM
```

CUSTOM requires `interval_days > 0`.

# 6. Job Model

Fields:

```text
maintenance_plan_id
client_id
site_id
building_id
job_number
scheduled_date
started_at
submitted_at
completed_at
status
assigned_technician_id
supervisor_id
notes
```

Status:

```text
SCHEDULED
IN_PROGRESS
SUBMITTED
UNDER_REVIEW
COMPLETED
CANCELLED
```

OVERDUE is derived, never stored.

# 7. Derived Overdue

```text
scheduled_date < today
AND status NOT IN (COMPLETED, CANCELLED)
```

# 8. Job Number

Generate server-side.

Example:

```text
FM-JOB-20261002-ABC123
```

Browser must not determine authoritative job numbers.

# 9. Job Equipment

Every job explicitly selects assets.

```text
job_id
equipment_id
status
notes
```

Status:

```text
PENDING
IN_PROGRESS
COMPLETED
SKIPPED
```

Unique:

```text
job_id + equipment_id
```

# 10. Job Creation Flow

```text
Select Client
   ↓
Select Site
   ↓
Optional Building
   ↓
Load Equipment
   ↓
Select Assets
   ↓
Assign Technician
   ↓
Schedule Date
   ↓
Create Job
```

# 11. Technician Eligibility

Assigned profile must:

- belong to current organisation
- have role TECHNICIAN
- be active

# 12. State Machine

```text
SCHEDULED
   ↓
IN_PROGRESS
   ↓
SUBMITTED
   ↓
UNDER_REVIEW
   ↓
COMPLETED
```

Cancellation:

```text
SCHEDULED → CANCELLED
IN_PROGRESS → CANCELLED
```

Controlled server-side actions only.

# 13. Technician Work Queue

Technician sees only assigned jobs.

```text
TODAY

ABC Manufacturing
24 assets
Scheduled
[ OPEN ]
```

Phase 4 stops before full inspection entry.

# 14. Recurrence Utility

Create:

```text
calculateNextDueDate()
```

Rules:

```text
MONTHLY      +1 calendar month
QUARTERLY    +3 calendar months
HALF_YEARLY  +6 calendar months
YEARLY       +1 calendar year
CUSTOM       +interval_days
```

Use calendar-aware month arithmetic.

# 15. Cross-Entity Validation

Before plan create:

```text
client belongs to org
site belongs to client/org
```

Before job create:

```text
plan belongs to org
client/site valid
technician active TECHNICIAN in org
equipment belongs to selected site/org
```

# 16. Security

Management writes:

```text
OWNER
ADMIN
SUPERVISOR
```

Technician:

- reads own assigned jobs
- reads own job equipment
- starts own SCHEDULED job

Technician cannot:

- create
- reassign
- cancel
- read another technician's assigned job

# 17. Routes

Management:

```text
/maintenance/plans
/maintenance/plans/new
/maintenance/plans/[id]

/jobs
/jobs/new
/jobs/[id]
```

Technician:

```text
/technician/jobs
/technician/jobs/[id]
```

# 18. Server Operations

Recommended:

```text
createMaintenancePlan()
updateMaintenancePlan()
deactivateMaintenancePlan()

createMaintenanceJob()
assignTechnician()
startMaintenanceJob()
cancelMaintenanceJob()
markJobUnderReview()
completeMaintenanceJob()
```

# 19. Audit Events

```text
MAINTENANCE_PLAN_CREATED
MAINTENANCE_PLAN_UPDATED
MAINTENANCE_PLAN_DEACTIVATED

JOB_CREATED
JOB_ASSIGNED
JOB_REASSIGNED
JOB_STARTED
JOB_CANCELLED
JOB_SUBMITTED
JOB_REVIEW_STARTED
JOB_COMPLETED

JOB_EQUIPMENT_ADDED
JOB_EQUIPMENT_REMOVED
```

# 20. Unit Tests

- recurrence calculator
- plan schema
- job schema
- overdue derivation
- transition guard
- technician eligibility

# 21. Integration Tests

```text
create plan
create job
select equipment
assign technician
technician sees own job
technician starts own job
other technician denied
management cancels/reassigns
```

# 22. E2E Golden Slice

```text
Admin Login
 ↓
Create Maintenance Plan
 ↓
Create Job
 ↓
Select Equipment
 ↓
Assign Technician
 ↓
Technician Login
 ↓
Open Jobs
 ↓
Open Assigned Job
 ↓
Start Job
 ↓
Status = IN_PROGRESS
```

# 23. Acceptance Criteria

```text
[ ] plan list/create/edit/deactivate works
[ ] recurrence correct
[ ] job list/create/detail works
[ ] job number server-generated
[ ] explicit equipment selection works
[ ] technician validation works
[ ] technician own queue works
[ ] technician can start own job
[ ] other technician denied
[ ] overdue derived correctly
[ ] management can cancel/reassign
[ ] cross-tenant access denied
[ ] lint passes
[ ] typecheck passes
[ ] unit tests pass
[ ] integration tests pass
[ ] E2E passes
[ ] production build passes
```

# 24. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 4 ONLY.

Confirm Phases 0–3 pass first.

OBJECTIVE:
Build Maintenance Plan → Maintenance Job → Job Equipment → Technician Assignment.

DO NOT:
- build inspection results
- build findings
- build photos
- build offline sync
- build reports

IMPLEMENT:

MAINTENANCE PLANS
- list
- create
- detail
- edit
- deactivate
- recurrence calculation

JOBS
- list
- create
- detail
- cancel
- reassign
- derived overdue

JOB EQUIPMENT
- explicit selection
- validate site ownership
- prevent duplicates

TECHNICIAN ASSIGNMENT
- active TECHNICIAN only
- same organisation
- own queue only
- own job only
- start own SCHEDULED job

STATE MACHINE
SCHEDULED
IN_PROGRESS
SUBMITTED
UNDER_REVIEW
COMPLETED
CANCELLED

Use controlled server-side transitions.

SECURITY
RLS authoritative.
No cross-tenant leakage.
No cross-technician leakage.

TEST
unit
integration
RLS
E2E

VERIFY
lint
typecheck
tests
E2E
production build

STOP
Do not begin Phase 5.

END WITH:
IMPLEMENTATION SUMMARY

Files changed:
Database changes:
Routes:
State transitions:
RLS:
Tests:
Build:
Known issues:
Ready for Phase 5: YES/NO
```

# 25. Phase 5 Handoff

Phase 5 executes:

```text
Job
 ↓
Job Equipment
 ↓
Inspection
 ↓
Template
 ↓
Results
 ↓
Finding
 ↓
Photo
 ↓
Submit
```

## Phase 4 Principle

> **A maintenance schedule becomes operational only when work is assigned to a technician against a defined set of assets.**
