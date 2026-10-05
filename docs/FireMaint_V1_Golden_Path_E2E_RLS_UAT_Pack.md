# FireMaint V1 — Golden Path E2E, RLS & UAT Pack

## Bismillah.

Artifact #16 defines the acceptance evidence required before release.

It is not merely a test list.

It is the formal proof that the complete FireMaint V1 workflow works end to end.

---

# 1. Test Layers

```text
Unit
 ↓
Integration
 ↓
RLS / Security
 ↓
E2E
 ↓
Offline E2E
 ↓
User Acceptance Testing
```

---

# 2. Golden Path

```text
ADMIN
 ↓
Create Client
 ↓
Create Site
 ↓
Create Building
 ↓
Create System
 ↓
Create Equipment
 ↓
Create Maintenance Plan
 ↓
Create Job
 ↓
Assign Technician

TECHNICIAN
 ↓
Download Job
 ↓
Go Offline
 ↓
Start Job
 ↓
Inspect Equipment
 ↓
Create Finding
 ↓
Capture Photo
 ↓
Complete Inspections
 ↓
Submit Offline
 ↓
Reconnect
 ↓
Sync

SYSTEM
 ↓
Generate Report

SUPERVISOR
 ↓
Review
 ↓
Issue

CLIENT
 ↓
Login
 ↓
View Dashboard
 ↓
Open Report
 ↓
Download PDF
```

---

# 3. Admin UAT

Validate:

- client creation
- site/building creation
- equipment registration
- QR identity
- template availability
- plan creation
- job creation
- assignment

Expected outcome:
No manual database intervention.

---

# 4. Technician UAT

Validate:

- assigned jobs only
- offline package download
- inspection rendering
- required fields
- failure → finding
- photo evidence
- completion
- offline submission
- reconnect sync
- no data loss

---

# 5. Supervisor UAT

Validate:

- submitted job visibility
- generated report
- finding/photo correctness
- mark reviewed
- issue report
- void workflow

---

# 6. Client UAT

Validate:

- client sees only own data
- issued reports only
- report download
- equipment list
- findings read-only
- no technician/admin data leakage

---

# 7. RLS Test Matrix

Mandatory tenant scenarios:

```text
Org A user cannot access Org B clients
Org A user cannot access Org B sites
Org A user cannot access Org B equipment
Org A technician cannot access Org B jobs
Org A user cannot access Org B findings
Org A user cannot access Org B reports
```

Technician scenarios:

```text
Tech A cannot access Tech B unassigned job
Tech A cannot edit Tech B inspection
Tech A cannot submit Tech B job
```

Client scenarios:

```text
Client A cannot access Client B site
Client A cannot access Client B equipment
Client A cannot access Client B report
Client A cannot see GENERATED report
Client A can see own ISSUED report
```

---

# 8. Negative E2E

Test:

- invalid URL IDs
- deactivated user
- deactivated client/site
- retired equipment
- missing template
- incomplete inspection
- failed finding requirement
- failed photo upload
- job cancelled offline
- report generation failure
- voided report access

---

# 9. Offline E2E

Mandatory:

```text
Download Job
Disable Network
Inspect
Create Finding
Capture Photo
Submit
Reload PWA
Verify Work
Reconnect
Sync
Verify Server
Queue = 0
```

---

# 10. PDF Acceptance

Check:

- report number
- logo/branding
- client/site
- technician
- equipment summary
- results
- findings
- recommendations
- photos
- pagination
- no overlapping content
- download works

---

# 11. UAT Sign-Off Roles

Recommended:

```text
Product Owner
Technical Lead
Fire Maintenance Supervisor
Technician Representative
Client Representative
```

Not every role must be a separate person in small pilot, but each perspective must be tested.

---

# 12. UAT Severity

```text
BLOCKER
CRITICAL
MAJOR
MINOR
COSMETIC
```

Release rule:

```text
BLOCKER = 0
CRITICAL = 0
MAJOR = accepted/mitigated only
```

---

# 13. UAT Case Template

```text
Case ID:
Role:
Feature:
Precondition:
Steps:
Expected:
Actual:
Status:
Severity:
Evidence:
Tester:
Date:
```

---

# 14. Release Candidate Test Dataset

Use:

```text
ABC Manufacturing Sdn Bhd

1 site
1 building
32 extinguishers
8 hose reels
1 fire alarm panel
42 emergency lights

Technician:
Ahmad

Quarterly maintenance
```

Include at least:

- one PASS-only asset
- one ATTENTION
- one FAIL finding
- one skipped asset with reason
- one photo evidence item

---

# 15. Exit Criteria

```text
[ ] Golden path passes
[ ] Offline golden path passes
[ ] RLS suite passes
[ ] Client isolation passes
[ ] PDF acceptance passes
[ ] No Blocker
[ ] No Critical
[ ] Production build passes
[ ] UAT sign-off recorded
```

---

# 16. Test-Agent Prompt

```text
Bismillah.

Execute FireMaint V1 release-candidate validation.

Do not add features.

RUN:
1. Unit suite
2. Integration suite
3. RLS/security suite
4. Golden path E2E
5. Offline E2E
6. PDF acceptance
7. Client portal isolation
8. UAT checklist

REPORT:
Passed:
Failed:
Blocked:
Security issues:
Data-loss issues:
PDF issues:
Offline issues:
UAT issues:
Release recommendation: GO / NO-GO
```

## Artifact #16 Principle

> **Release confidence comes from evidence, not from “it seems to work.”**
