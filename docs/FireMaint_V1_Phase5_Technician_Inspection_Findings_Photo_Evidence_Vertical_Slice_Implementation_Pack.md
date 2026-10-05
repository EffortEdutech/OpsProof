# FireMaint V1 — Phase 5 Technician Inspection Execution, Findings & Photo Evidence Vertical Slice Implementation Pack

## Bismillah.

Phase 5 turns scheduled work into real field execution.

```text
ASSIGNED JOB
    ↓
JOB EQUIPMENT
    ↓
INSPECTION
    ↓
ACTIVE TEMPLATE
    ↓
RESULTS
    ↓
PHOTO EVIDENCE
    ↓
FINDING
    ↓
COMPLETE INSPECTION
    ↓
SUBMIT JOB
```

# 1. Objective

Implement:

1. Inspection creation from Job Equipment
2. Active-template resolution
3. Dynamic technician inspection rendering
4. Inspection-result persistence
5. Finding creation
6. Severity and recommendation
7. Private photo evidence
8. Inspection completion and locking
9. Job-equipment completion / skip
10. Job submission
11. Management findings list
12. Tests and Phase 6 handoff

# 2. Non-Goals

Do not implement yet:

- offline local database
- sync queue
- PDF report engine
- supervisor review
- client portal
- dashboard KPIs

# 3. Existing Tables

Reuse:

```text
inspections
inspection_results
findings
finding_photos
maintenance_jobs
job_equipment
inspection_templates
inspection_template_items
equipment
profiles
```

# 4. Inspection Identity

An inspection belongs to `job_equipment`.

This ensures:

```text
Job
 ↓
Assigned Asset
 ↓
Inspection
```

One inspection per job-equipment record.

# 5. Active Template Resolution

Priority:

1. current-organisation ACTIVE template
2. global ACTIVE reference template
3. otherwise block inspection with clear error

Store:

```text
template_id
template_version
```

on inspection.

# 6. Inspection Lifecycle

```text
NOT_STARTED
    ↓
IN_PROGRESS
    ↓
COMPLETED
    ↓
LOCKED
```

V1 recommendation:

```text
complete inspection
→ validate
→ LOCKED
```

# 7. Inspection Results

Persist one result per template item:

```text
inspection_id
template_item_id
result_status
value_text
value_number
value_date
value_json
notes
```

Do not store one giant inspection JSON blob.

# 8. Result Status

```text
PASS
ATTENTION
FAIL
NA
```

Non-status fields may keep `result_status = null`.

# 9. Failure → Finding

If:

```text
fail_creates_finding = true
AND result_status = FAIL
```

then inspection completion requires a linked finding.

# 10. Finding Model

```text
job_id
inspection_id
equipment_id
template_item_id
title
description
severity
recommendation
status
created_by
```

Severity:

```text
OBSERVATION
LOW
MEDIUM
HIGH
CRITICAL
```

New finding status:

```text
OPEN
```

# 11. Finding UX

```text
FAIL
 ↓
Create Finding
 ↓
Title
Description
Severity
Recommendation
Photo
 ↓
Save
 ↓
Return to Inspection
```

Keep technician in context.

# 12. Photo Evidence

Private Supabase Storage bucket:

```text
inspection-photos
```

Path:

```text
/{organisation_id}/{job_id}/{equipment_id}/{inspection_id}/{uuid}.jpg
```

Database stores metadata only.

# 13. Technician Route

Recommended:

```text
/technician/jobs/[id]/equipment/[equipmentId]
```

It must:

1. validate assigned technician
2. validate equipment belongs to job
3. get/create inspection
4. resolve active template
5. render dynamic form
6. persist results
7. manage findings/photos
8. complete inspection

# 14. Job Equipment Status

```text
PENDING
  ↓
IN_PROGRESS
  ↓
COMPLETED
```

Alternative:

```text
SKIPPED
```

Skip requires reason.

# 15. Completion Validation

Before completion:

- every required template item has value
- SELECT values match configured options
- FAIL items that require findings have linked findings
- current technician owns assigned job
- inspection is not LOCKED

Then:

```text
inspection.status = LOCKED
job_equipment.status = COMPLETED
```

# 16. Job Submission

Submit only when every job-equipment row is:

```text
COMPLETED
or
SKIPPED with reason
```

Then:

```text
IN_PROGRESS → SUBMITTED
```

and set `submitted_at`.

# 17. Technician Review

Before submit:

```text
24 Assets
22 Completed
2 Skipped
5 Findings

Critical 0
High     1
Medium   3
Low      1

[ SUBMIT JOB ]
```

# 18. Management Findings

Route:

```text
/findings
```

Columns:

```text
Severity
Title
Asset
Client
Site
Job
Status
Created
```

# 19. Security

Technician can only:

- inspect own assigned-job equipment
- edit own IN_PROGRESS inspection
- create findings for own inspection
- upload evidence for own finding
- submit own job

Technician cannot:

- update another technician's inspection
- update LOCKED inspection
- verify/close finding
- submit another technician's job

# 20. RLS Negative Tests

```text
Technician A cannot read Technician B inspection
Technician A cannot update Technician B results
Org A cannot read Org B findings
Org A cannot read Org B photo metadata
Client role cannot use technician workflow
```

# 21. Server Operations

Recommended:

```text
getOrCreateInspection()
saveInspectionResult()
createFinding()
registerFindingPhoto()
completeInspection()
skipJobEquipment()
submitJob()
```

# 22. Photo Rules

Phase 5 is online-first:

```text
Capture
 ↓
Optional Compress
 ↓
Upload private object
 ↓
Store metadata
 ↓
Signed URL for viewing
```

Phase 6 makes this local-first/offline.

# 23. Audit Events

```text
INSPECTION_CREATED
INSPECTION_STARTED
INSPECTION_RESULT_SAVED
INSPECTION_COMPLETED
INSPECTION_LOCKED
FINDING_CREATED
PHOTO_UPLOADED
JOB_EQUIPMENT_COMPLETED
JOB_EQUIPMENT_SKIPPED
JOB_SUBMITTED
```

# 24. Unit Tests

Test:

- required-result completeness
- fail→finding requirement
- job-submit readiness
- skip reason
- storage-path generation
- active-template priority

# 25. Integration Tests

```text
open assigned asset
create inspection once
resolve template
save results
FAIL triggers finding requirement
create finding
register photo
complete inspection
complete job equipment
submit completed job
```

Negative:

```text
other technician denied
locked inspection denied
missing required result blocks complete
missing required finding blocks complete
incomplete job blocks submit
```

# 26. E2E Golden Slice

```text
Technician Login
 ↓
Open Assigned Job
 ↓
Open FE-001
 ↓
Inspection Starts
 ↓
PASS several items
 ↓
FAIL pressure
 ↓
Create Finding
 ↓
Add Photo
 ↓
Complete Inspection
 ↓
Complete Remaining Assets
 ↓
Review
 ↓
Submit Job
```

# 27. Acceptance Criteria

```text
[ ] assigned asset opens
[ ] inspection created once
[ ] tenant template preferred
[ ] global fallback works
[ ] results persist
[ ] required validation works
[ ] failure can require finding
[ ] finding create works
[ ] severity/recommendation work
[ ] private photo upload works
[ ] metadata stored
[ ] signed photo view works
[ ] inspection locks
[ ] job equipment completes
[ ] skip requires reason
[ ] job submit readiness works
[ ] job submits
[ ] findings list works
[ ] other technician denied
[ ] cross-tenant denied
[ ] lint passes
[ ] typecheck passes
[ ] unit tests pass
[ ] integration tests pass
[ ] E2E passes
[ ] production build passes
```

# 28. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 5 ONLY.

Confirm Phases 0–4 pass.

OBJECTIVE:
Assigned Job
→ Job Equipment
→ Inspection
→ Dynamic Template
→ Results
→ Finding
→ Photo
→ Complete Inspection
→ Submit Job

DO NOT:
- build offline sync
- build PDF reports
- build supervisor review
- build client portal
- build dashboard KPIs

INSPECTION
- one inspection per job_equipment
- tenant ACTIVE template first
- global ACTIVE fallback
- store template id/version
- generic renderer only

RESULTS
- one row per template item
- safe upsert
- validate required items/options

FINDINGS
- link job + inspection + equipment + template item
- severity
- recommendation
- default OPEN

FAIL RULE
If fail_creates_finding=true and result=FAIL,
completion requires linked finding.

PHOTOS
- private Supabase Storage
- tenant-scoped path
- metadata row
- signed URL
- no DB binary/base64

JOB EQUIPMENT
- PENDING → IN_PROGRESS → COMPLETED
- SKIPPED requires reason

SUBMIT JOB
All rows must be COMPLETED or valid SKIPPED.
Then IN_PROGRESS → SUBMITTED.

SECURITY
Own assigned job only.
No cross-technician/cross-tenant mutation.
LOCKED inspections immutable.
RLS authoritative.

TEST
unit
integration
RLS
storage
E2E

VERIFY
lint
typecheck
tests
E2E
production build

STOP
Do not begin Phase 6.

END WITH:
IMPLEMENTATION SUMMARY

Files changed:
Database changes:
Storage changes:
Routes:
Inspection workflow:
Finding workflow:
RLS:
Tests:
Build:
Known issues:
Ready for Phase 6: YES/NO
```

# 29. Phase 6 Handoff

Phase 6 changes persistence order but preserves the same domain workflow:

```text
UI
 ↓
Local Database
 ↓
Sync Queue
 ↓
Server
```

## Phase 5 Principle

> **The technician completes the real maintenance record once, at the asset, with evidence attached to the result.**
