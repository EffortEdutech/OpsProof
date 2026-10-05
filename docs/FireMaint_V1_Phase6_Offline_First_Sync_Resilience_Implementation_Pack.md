# FireMaint V1 — Phase 6 Offline-First Sync & Resilience Implementation Pack

## Bismillah.

Phase 6 converts the technician workflow from online-first to local-first.

```text
UI
 ↓
LOCAL DATABASE
 ↓
SYNC QUEUE
 ↓
SERVER
```

The technician must be able to complete maintenance work without network access and synchronize later without losing data.

# 1. Objective

Implement:

1. Local job/equipment/template cache
2. Local inspections/results/findings/photos
3. Durable sync queue
4. Dependency-aware sync
5. Retry/backoff
6. Connectivity detection
7. Idempotent synchronization
8. Conflict handling
9. Photo upload queue
10. Sync status UI
11. Restart recovery
12. Offline submission
13. Offline E2E coverage

# 2. Local Stores

Recommended IndexedDB stores:

```text
jobs
job_equipment
equipment
templates
template_items
inspections
inspection_results
findings
photos
sync_queue
sync_metadata
```

Use IndexedDB via Dexie or the repository's existing abstraction.

Do not use localStorage for field records/photos.

# 3. Save Rule

Every technician mutation follows:

```text
Validate Locally
 ↓
Write IndexedDB
 ↓
Update UI
 ↓
Enqueue Sync
 ↓
Return Success
```

The network is not part of immediate save success.

# 4. Stable IDs

Locally created records use stable UUIDs.

```text
crypto.randomUUID()
```

Prefer using the same logical ID on the server so retries remain idempotent.

# 5. Sync Queue

```typescript
type SyncOperation = {
  id: string;
  entityType:
    | "inspection"
    | "inspection_result"
    | "finding"
    | "photo"
    | "job_equipment"
    | "job";
  entityId: string;
  operation: "CREATE" | "UPSERT" | "UPDATE" | "UPLOAD";
  payload: unknown;
  dependencyIds: string[];
  status: "PENDING" | "PROCESSING" | "FAILED" | "COMPLETED";
  attemptCount: number;
  nextAttemptAt?: string;
  lastAttemptAt?: string;
  error?: string;
  createdAt: string;
};
```

# 6. Dependency Ordering

Example:

```text
Inspection
 ↓
Inspection Result
 ↓
Finding
 ↓
Photo
 ↓
Job Equipment
 ↓
Job Submission
```

Dependent operations cannot run before their dependencies complete.

# 7. Retry Strategy

Recommended:

```text
Attempt 1: immediate
Attempt 2: +5 sec
Attempt 3: +15 sec
Attempt 4: +60 sec
Attempt 5+: +5 min cap
```

Manual retry remains available.

# 8. Connectivity

Show:

```text
Online
Offline
Syncing
Sync Issue
```

Do not rely only on `navigator.onLine`.

Confirm with `/api/health` or an equivalent lightweight probe.

# 9. Sync Screen

Route:

```text
/technician/sync
```

Display:

```text
Connection
Pending
Failed
Last successful sync
Sync Now
Retry Failed
```

# 10. Photo Handling

Flow:

```text
Capture
 ↓
Resize / Compress
 ↓
Store Blob in IndexedDB
 ↓
Queue Upload
 ↓
Upload when Online
 ↓
Create Metadata
 ↓
Mark SYNCED
```

Never delete the local photo because an upload failed.

# 11. Offline Package

Before field work:

```text
[ DOWNLOAD FOR OFFLINE USE ]
```

Cache:

- job
- client/site summary
- job equipment
- equipment
- required active templates/items

Mark:

```text
Ready Offline
```

only after package completeness is verified.

# 12. Conflict Policy

V1 avoids automatic merging.

Block automatic sync when:

```text
server inspection = LOCKED
job cancelled remotely
job reassigned remotely
```

Policy:

1. Preserve local data.
2. Stop destructive sync.
3. Show explicit conflict.
4. Require supervisor/manual resolution.

# 13. Job Submission Offline

Technician may submit while offline.

Local state:

```text
SUBMISSION_PENDING
```

Server becomes:

```text
SUBMITTED
```

only after all dependencies synchronize successfully.

# 14. Restart Recovery

On application start:

1. open IndexedDB
2. recover queue
3. reset stale PROCESSING → PENDING
4. detect connectivity
5. resume sync
6. restore local job state

# 15. Cleanup

Never delete local job data while any of these exist:

```text
PENDING queue item
FAILED queue item
unsynced photo
unsynced finding
job submission pending
```

Cleanup only after server acknowledgement.

# 16. Sign-Out Protection

If unsynced work exists:

```text
Unsynced work exists on this device.
```

Do not silently clear local data.

# 17. Security

Offline mode does not bypass authorization.

Every server sync operation must still validate:

- authenticated technician
- organisation
- assignment
- state
- RLS

# 18. Unit Tests

Test:

- retry/backoff
- dependency ordering
- stale PROCESSING recovery
- conflict classification
- cleanup eligibility
- submission dependency readiness

# 19. Integration Tests

```text
download job
disconnect
inspect
save findings
save photo
reload
reconnect
sync
verify server
verify queue empty
```

# 20. Failure Tests

```text
photo upload failure
server 500
network loss mid-sync
duplicate retry
job cancelled remotely
job reassigned remotely
inspection remotely locked
restart during PROCESSING
```

# 21. Offline E2E Golden Path

```text
Technician Login
 ↓
Download Job
 ↓
Ready Offline
 ↓
Disable Network
 ↓
Inspect Equipment
 ↓
Create Finding
 ↓
Capture Photo
 ↓
Complete Job
 ↓
Submit Offline
 ↓
Reload App
 ↓
Verify Local Work
 ↓
Enable Network
 ↓
Sync
 ↓
Verify Server Inspection/Finding/Photo
 ↓
Verify Job SUBMITTED
 ↓
Queue = 0
```

# 22. Acceptance Criteria

```text
[ ] offline package downloads
[ ] job opens offline
[ ] templates render offline
[ ] inspection saves locally
[ ] findings save locally
[ ] photos save locally
[ ] restart preserves work
[ ] queue survives restart
[ ] dependency ordering works
[ ] retry/backoff works
[ ] idempotent retry works
[ ] failed photo preserved
[ ] conflicts preserve local data
[ ] offline submission queues
[ ] reconnect syncs complete job
[ ] queue reaches zero
[ ] cleanup is safe
[ ] sign-out protects unsynced data
[ ] lint passes
[ ] typecheck passes
[ ] unit tests pass
[ ] integration tests pass
[ ] offline E2E passes
[ ] production build passes
```

# 23. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 6 ONLY.

Confirm Phases 0–5 pass.

OBJECTIVE:
Make the Phase 5 technician workflow offline-first.

LOCAL STORAGE:
Use IndexedDB via Dexie or the existing abstraction.

Create stores for:
jobs
job_equipment
equipment
templates
template_items
inspections
inspection_results
findings
photos
sync_queue
sync_metadata

SAVE RULE:
validate locally
persist locally
update UI
enqueue sync
return success without requiring network

SYNC:
- durable
- dependency-aware
- idempotent
- retryable
- restart-safe

PHOTOS:
Store Blob locally.
Queue upload.
Never discard after failed upload.

CONFLICTS:
Block auto-sync if:
- remote inspection LOCKED
- job cancelled
- job reassigned

Preserve local data.

SUBMISSION:
Allow offline submit.
Sync server SUBMITTED state only after dependencies complete.

UX:
Show Online / Offline / Syncing / Sync Issue.
Show pending and failed counts.
Add /technician/sync.

SECURITY:
Server validates all synced operations.
RLS remains authoritative.

TEST:
unit
integration
network interruption
restart recovery
photo failure
conflict
offline E2E

VERIFY:
lint
typecheck
tests
offline E2E
production build

STOP:
Do not begin Phase 7.

END WITH:
IMPLEMENTATION SUMMARY

Local stores:
Files changed:
Sync operations:
Conflict rules:
Photo handling:
Tests:
Build:
Known issues:
Ready for Phase 7: YES/NO
```

# 24. Phase 7 Handoff

Phase 7 uses server-authoritative synchronized data only:

```text
Submitted Job
 ↓
Report Assembler
 ↓
MaintenanceReportData
 ↓
PDF Renderer
 ↓
Private Storage
 ↓
Report Record
```

## Phase 6 Principle

> **A technician's work is saved the moment they record it — network or no network.**
