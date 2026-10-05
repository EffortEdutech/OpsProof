# FireMaint V1 — Repository & Supabase Build Specification

## FIREMAINT V1
### Repository & Supabase Build Specification

**Version:** 1.0  
**Status:** Build Specification  
**Product:** FireMaint — Digital Fire Maintenance & Reporting Platform  
**Architecture:** Next.js + TypeScript + Supabase + PWA  
**Database:** PostgreSQL  
**Storage:** Supabase Storage  
**Authentication:** Supabase Auth  
**Deployment target:** Vercel + Supabase  
**Primary device:** Mobile phone for technician  
**Primary desktop users:** Admin / Supervisor / Client

---

# 1. BUILD PRINCIPLE

FireMaint must be built as a **real application from the first commit**.

Do not build:

- static mock dashboards
- fake API responses
- hard-coded inspection forms
- frontend-only permissions
- PDF-only data
- duplicated data-entry workflows
- a separate mobile application for V1

The core principle is:

> **Database → Domain Logic → UI**

not:

> UI → fake data → database later.

---

# 2. CORE PRODUCT LOOP

The entire V1 must support:

```text
Organisation
     ↓
Client
     ↓
Site
     ↓
Building
     ↓
System
     ↓
Equipment
     ↓
Maintenance Plan
     ↓
Maintenance Job
     ↓
Technician
     ↓
Inspection
     ↓
Evidence
     ↓
Finding
     ↓
Report
     ↓
Client
```

---

# 3. REPOSITORY ASSUMPTION

Before implementation, the coding agent MUST inspect the existing repository.

If the repository is empty:

```text
firemaint/
```

If an existing repository is supplied, the agent must preserve its existing conventions unless they conflict with this specification.

The agent must NOT blindly replace the existing application.

---

# 4. TARGET REPOSITORY STRUCTURE

```text
firemaint/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── forgot-password/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── sites/
│   │   ├── equipment/
│   │   ├── maintenance/
│   │   ├── findings/
│   │   ├── reports/
│   │   ├── technicians/
│   │   └── settings/
│   │
│   ├── technician/
│   │   ├── today/
│   │   ├── jobs/
│   │   ├── scan/
│   │   ├── findings/
│   │   └── profile/
│   │
│   ├── client/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── equipment/
│   │   └── findings/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── clients/
│   ├── sites/
│   ├── equipment/
│   ├── maintenance/
│   ├── inspections/
│   ├── findings/
│   ├── reports/
│   └── technician/
│
├── features/
│   ├── organisations/
│   ├── clients/
│   ├── sites/
│   ├── buildings/
│   ├── systems/
│   ├── equipment/
│   ├── maintenance/
│   ├── inspections/
│   ├── findings/
│   ├── reports/
│   └── sync/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   ├── storage/
│   ├── pdf/
│   ├── sync/
│   └── utils/
│
├── hooks/
├── types/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   ├── functions/
│   └── config.toml
│
├── public/
│   ├── icons/
│   └── manifest/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── product/
│   └── testing/
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.*
├── README.md
└── .env.example
```

---

# 5. TECHNOLOGY RULES

Use:

```text
Next.js
TypeScript
Supabase
PostgreSQL
Tailwind CSS
PWA
```

Use strict TypeScript.

Avoid unnecessary dependencies.

Every dependency added must have a reason.

---

# 6. ENVIRONMENT VARIABLES

Required:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional later:

```text
REPORT_STORAGE_BUCKET=
NEXT_PUBLIC_APP_URL=
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

---

# 7. DATABASE MIGRATION STRATEGY

Use sequential migrations.

```text
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
```

---

# 8. COMMON DATABASE CONVENTIONS

Every primary key:

```sql
id uuid primary key default gen_random_uuid()
```

Every business table should normally contain:

```sql
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Tenant-owned tables:

```sql
organisation_id uuid not null
```

Use foreign keys.

Avoid storing relational data as JSON unless the structure genuinely requires it.

---

# 9. EXTENSIONS

Migration 001:

```sql
create extension if not exists pgcrypto;
```

---

# 10. ORGANISATIONS

Migration 002.

```text
organisations
```

Columns:

```text
id
name
legal_name
registration_no
phone
email
address
logo_url
report_prefix
timezone
active
created_at
updated_at
```

Defaults:

```text
report_prefix = FM
timezone = Asia/Kuala_Lumpur
active = true
```

---

# 11. PROFILES

Migration 003.

Supabase Auth owns authentication identity.

```text
profiles
```

Columns:

```text
id
organisation_id
full_name
phone
role
avatar_url
active
created_at
updated_at
```

`id` references:

```text
auth.users.id
```

Role enum:

```text
OWNER
ADMIN
SUPERVISOR
TECHNICIAN
CLIENT
```

Do not create a second authentication system.

---

# 12. CLIENTS

Migration 004.

```text
clients
```

Fields:

```text
id
organisation_id
name
registration_no
phone
email
address
status
created_at
updated_at
```

Status:

```text
ACTIVE
INACTIVE
```

---

# 13. CLIENT CONTACTS

Migration 005.

```text
client_contacts
```

Fields:

```text
id
client_id
name
position
phone
email
is_primary
created_at
updated_at
```

---

# 14. SITES

Migration 006.

```text
sites
```

Fields:

```text
id
organisation_id
client_id
name
code
address
latitude
longitude
status
created_at
updated_at
```

---

# 15. BUILDINGS

Migration 007.

```text
buildings
```

Fields:

```text
id
site_id
name
code
floors
description
created_at
updated_at
```

---

# 16. SYSTEMS

Migration 008.

```text
systems
```

Fields:

```text
id
building_id
name
system_type
description
status
created_at
updated_at
```

Initial system types:

```text
FIRE_ALARM
FIRE_EXTINGUISHING
HOSE_REEL
SPRINKLER
EMERGENCY_LIGHTING
EXIT_SIGNAGE
OTHER
```

---

# 17. EQUIPMENT TYPES

Migration 009.

```text
equipment_types
```

Fields:

```text
id
organisation_id
name
category
code
description
active
created_at
updated_at
```

Reference equipment types:

```text
FIRE_EXTINGUISHER_DRY_POWDER
FIRE_EXTINGUISHER_CO2
HOSE_REEL
FIRE_ALARM_PANEL
SMOKE_DETECTOR
HEAT_DETECTOR
MANUAL_CALL_POINT
FIRE_ALARM_SOUNDER
EMERGENCY_LIGHT
EXIT_SIGN
SPRINKLER_HEAD
```

---

# 18. EQUIPMENT

Migration 010.

```text
equipment
```

Fields:

```text
id
organisation_id
site_id
building_id
system_id
equipment_type_id

asset_code
serial_number

brand
model
capacity
location_description

installation_date

status

qr_token

last_inspection_at
next_inspection_at

created_at
updated_at
```

Status:

```text
ACTIVE
INACTIVE
REMOVED
```

Unique:

```text
organisation_id + asset_code
```

`qr_token` must not expose the internal database UUID.

---

# 19. MAINTENANCE PLANS

Migration 011.

```text
maintenance_plans
```

Fields:

```text
id
organisation_id
client_id
site_id
name
frequency
frequency_value
start_date
next_due_date
active
created_at
updated_at
```

Frequency:

```text
MONTHLY
QUARTERLY
HALF_YEARLY
YEARLY
CUSTOM
```

---

# 20. MAINTENANCE JOBS

Migration 012.

```text
maintenance_jobs
```

Fields:

```text
id
organisation_id
maintenance_plan_id
client_id
site_id

job_number

scheduled_date
started_at
completed_at

assigned_to

status

notes

created_at
updated_at
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

`OVERDUE` should be derived, not stored.

---

# 21. JOB EQUIPMENT

Migration 013.

```text
job_equipment
```

Fields:

```text
id
job_id
equipment_id
sequence
status
created_at
updated_at
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

---

# 22. INSPECTION TEMPLATES

Migration 014.

```text
inspection_templates
```

Fields:

```text
id
organisation_id
name
equipment_type_id
version
active
created_at
updated_at
```

---

# 23. INSPECTION TEMPLATE ITEMS

Migration 015.

```text
inspection_template_items
```

Fields:

```text
id
template_id
section
label
description
field_type
required
sort_order
options_json
validation_json
severity_if_failed
created_at
updated_at
```

Field types:

```text
PASS_FAIL
YES_NO
SELECT
NUMBER
TEXT
PHOTO
DATE
SIGNATURE
```

---

# 24. INSPECTIONS

Migration 016.

```text
inspections
```

Fields:

```text
id
organisation_id
job_id
equipment_id
template_id
template_version
technician_id
started_at
completed_at
overall_status
notes
created_at
updated_at
```

Status:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
LOCKED
```

---

# 25. INSPECTION RESULTS

Migration 017.

```text
inspection_results
```

Fields:

```text
id
inspection_id
template_item_id
value_json
result_status
note
created_at
updated_at
```

Result status:

```text
PASS
ATTENTION
FAIL
NA
```

---

# 26. FINDINGS

Migration 018.

```text
findings
```

Fields:

```text
id
organisation_id
job_id
inspection_id
equipment_id
title
description
severity
recommendation
status
created_by
created_at
updated_at
```

Severity:

```text
OBSERVATION
LOW
MEDIUM
HIGH
CRITICAL
```

Status:

```text
OPEN
IN_PROGRESS
RESOLVED
VERIFIED
CLOSED
```

---

# 27. FINDING PHOTOS

Migration 019.

```text
finding_photos
```

Fields:

```text
id
finding_id
storage_path
caption
taken_at
uploaded_at
created_by
created_at
```

---

# 28. REPORTS

Migration 020.

```text
reports
```

Fields:

```text
id
organisation_id
job_id
report_number
report_type
status
generated_at
approved_at
issued_at
pdf_path
created_by
created_at
updated_at
```

Status:

```text
DRAFT
GENERATED
REVIEWED
ISSUED
VOID
```

---

# 29. AUDIT LOG

Migration 021.

```text
audit_logs
```

Fields:

```text
id
organisation_id
actor_id
entity_type
entity_id
action
old_data
new_data
created_at
```

Use JSONB for before/after snapshots.

---

# 30. NOTIFICATIONS

Migration 022.

```text
notifications
```

Fields:

```text
id
organisation_id
user_id
type
title
message
read_at
created_at
```

Initial types:

```text
JOB_ASSIGNED
JOB_DUE
JOB_OVERDUE
REPORT_READY
FINDING_CREATED
FINDING_ESCALATED
```

---

# 31. RLS

Migration 023.

RLS must be enabled on all tenant-owned tables.

The fundamental rule:

```text
authenticated user
        ↓
profile
        ↓
organisation_id
        ↓
row.organisation_id
```

Never trust a frontend-supplied organisation ID.

---

# 32. RLS HELPER FUNCTION

Create:

```text
get_current_organisation_id()
```

Policies can then use:

```sql
organisation_id = get_current_organisation_id()
```

---

# 33. ROLE HELPERS

Create:

```text
is_owner()
is_admin()
is_supervisor()
is_technician()
is_client()
```

Technicians additionally require assignment checks.

Clients additionally require client ownership checks.

---

# 34. TECHNICIAN ACCESS

Technician can access:

```text
assigned maintenance jobs
```

and related:

```text
job equipment
equipment
inspection templates
inspections
findings
photos
```

They must not be able to browse another technician's jobs.

---

# 35. CLIENT ACCESS

Client users must only access:

```text
their client
their sites
their buildings
their equipment
their reports
their findings
their maintenance history
```

They cannot access:

```text
internal notes
other clients
technician management
company settings
other organisations
```

---

# 36. STORAGE

Create private buckets:

```text
inspection-photos
report-pdfs
company-assets
documents
```

Storage is private by default.

Access via signed URLs.

---

# 37. STORAGE PATH CONVENTION

Inspection:

```text
/{organisation_id}/
/{job_id}/
/{equipment_id}/
/{inspection_id}/
{uuid}.jpg
```

Finding:

```text
/{organisation_id}/
/findings/
{finding_id}/
{uuid}.jpg
```

Report:

```text
/{organisation_id}/
/reports/
{year}/
{report_id}.pdf
```

---

# 38. INDEXES

Migration 026.

Required indexes:

```text
clients(organisation_id)

sites(organisation_id)
sites(client_id)

buildings(site_id)

systems(building_id)

equipment(organisation_id)
equipment(site_id)
equipment(building_id)
equipment(system_id)
equipment(asset_code)
equipment(qr_token)

maintenance_plans(organisation_id)
maintenance_plans(next_due_date)

maintenance_jobs(organisation_id)
maintenance_jobs(scheduled_date)
maintenance_jobs(assigned_to)
maintenance_jobs(status)

job_equipment(job_id)
job_equipment(equipment_id)

inspections(job_id)
inspections(equipment_id)
inspections(technician_id)

inspection_results(inspection_id)

findings(organisation_id)
findings(status)
findings(severity)
findings(equipment_id)

reports(organisation_id)
reports(job_id)
reports(status)
```

---

# 39. UPDATED_AT TRIGGERS

All mutable domain tables should automatically update:

```text
updated_at
```

Use one reusable PostgreSQL trigger function.

---

# 40. SERVER-SIDE FUNCTIONS

Migration 025.

Implement controlled business operations.

## `create_maintenance_job()`

Creates:

```text
maintenance_jobs
+
job_equipment
```

atomically.

## `start_maintenance_job()`

Validates:

- authenticated technician
- technician assigned to job
- job is scheduled

Then:

```text
SCHEDULED → IN_PROGRESS
```

## `submit_inspection()`

Validates:

- technician owns assignment
- required items complete
- required evidence present
- inspection not already locked

Then:

```text
IN_PROGRESS → COMPLETED
```

## `submit_job()`

Validates all required inspections.

Then:

```text
IN_PROGRESS → SUBMITTED
```

## `generate_report_number()`

Must be server-side.

Example:

```text
FM-2026-000001
FM-2026-000002
FM-2026-000003
```

## `issue_report()`

Only Supervisor/Admin/Owner.

Changes:

```text
REVIEWED → ISSUED
```

## `create_next_maintenance_job()`

Used later by recurring scheduling.

---

# 41. FIRE EXTINGUISHER V1 TEMPLATE

Seed one complete template.

## Template

```text
Fire Extinguisher — Standard Inspection
Version 1
```

### Section A — Identification

```text
Equipment type
Capacity
Serial number
Location
```

### Section B — Accessibility

```text
Accessible?
Correct location?
Obstruction?
```

### Section C — Physical Condition

```text
Cylinder condition
Corrosion
Damage
Label condition
```

### Section D — Safety

```text
Safety pin intact?
Seal intact?
Pressure indicator normal?
Hose/nozzle condition?
```

### Section E — Overall

```text
Overall condition
Technician notes
Photo
```

---

# 42. TEMPLATE CONFIGURATION

The template must be data-driven.

The UI renders:

```text
inspection_template_items
```

It must NOT contain equipment-specific checklist hard-coding.

---

# 43. FIRST SEED DATA

Migration 027 should contain reference data only.

Seed equipment types:

```text
9kg Dry Powder Fire Extinguisher
CO2 Fire Extinguisher
Hose Reel
Fire Alarm Panel
Smoke Detector
Heat Detector
Manual Call Point
Emergency Light
Exit Sign
Sprinkler Head
```

---

# 44. DEMO DATA

Development seed:

```text
Client:
ABC Manufacturing Sdn Bhd

Site:
ABC Manufacturing Plant

Building:
Building A

Equipment:

FE-001
FE-002
FE-003
FE-004
FE-005

HR-001
HR-002

FA-001

EL-001
EL-002
EL-003
```

Create one simulated finding:

```text
FE-003
Low pressure
MEDIUM
```

---

# 45. TYPE GENERATION

Supabase database types should be generated and committed:

```text
types/database.ts
```

Preferred flow:

```text
Postgres
 ↓
Supabase generated types
 ↓
Application domain types
```

---

# 46. DOMAIN TYPES

Create explicit types for:

```text
UserRole
JobStatus
EquipmentStatus
InspectionStatus
InspectionResultStatus
FindingSeverity
FindingStatus
ReportStatus
```

---

# 47. VALIDATION

Use a schema validation library.

Validate:

- client forms
- site forms
- equipment
- maintenance jobs
- inspections
- findings
- report configuration

Security-critical operations must be validated server-side.

---

# 48. QR ARCHITECTURE

QR code contains a public-safe route such as:

```text
/equipment/scan/{token}
```

The token:

- must be random
- must not be sequential
- must not expose database UUID
- must be revocable

---

# 49. OFFLINE DATA MODEL

Introduce a local persistence layer.

Recommended conceptual tables:

```text
local_jobs
local_job_equipment
local_inspections
local_inspection_results
local_findings
local_photos
sync_queue
```

---

# 50. LOCAL RECORD IDS

Every offline-created record needs:

```text
client_generated_id
```

Use UUID.

---

# 51. SYNC QUEUE

```typescript
type SyncOperation = {
  id: string
  entityType: string
  entityId: string
  operation: "CREATE" | "UPDATE" | "UPLOAD"
  payload: unknown
  status: "PENDING" | "PROCESSING" | "FAILED" | "COMPLETED"
  attemptCount: number
  lastAttemptAt?: string
  error?: string
}
```

---

# 52. OFFLINE RULE

The technician should see:

```text
● Online
```

or:

```text
○ Offline
```

and:

```text
3 items waiting to sync
```

Never silently lose work.

---

# 53. SYNC FAILURE

If upload fails:

```text
FAILED
```

The inspection remains locally available.

---

# 54. PHOTO PROCESSING

Before upload:

```text
camera
 ↓
resize/compress
 ↓
local storage
 ↓
queue
 ↓
upload
```

---

# 55. REPORT DATA CONTRACT

```typescript
type MaintenanceReportData = {
  organisation: OrganisationSummary
  client: ClientSummary
  site: SiteSummary
  job: JobSummary
  technician: TechnicianSummary
  maintenanceDate: string

  equipmentSummary: EquipmentSummary[]
  inspections: InspectionReport[]
  findings: FindingReport[]
  photos: ReportPhoto[]

  nextMaintenanceDate?: string

  signatures?: {
    technician?: SignatureData
    client?: SignatureData
  }
}
```

The PDF renderer should not query the database directly.

---

# 56. REPORT GENERATION PIPELINE

```text
Database
   ↓
Report assembler
   ↓
MaintenanceReportData
   ↓
PDF renderer
   ↓
PDF buffer/file
   ↓
Supabase Storage
   ↓
reports.pdf_path
```

---

# 57. REPORT TEMPLATE

V1 report sections:

```text
Cover
Company Details
Client Details
Site Details
Maintenance Summary
Equipment Summary
Inspection Results
Findings
Recommendations
Photographs
Technician Declaration
Client Acknowledgement
Next Maintenance
```

---

# 58. REPORT IMMUTABILITY

Once a report is:

```text
ISSUED
```

do not silently overwrite its contents.

If correction is needed:

```text
Original Report
      ↓
Void
      ↓
Generate Corrected Report
```

---

# 59. API / SERVER ACTION RULE

Use Server Actions or Route Handlers for appropriate mutations.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to client-side code.

Sensitive operations must be server-side.

---

# 60. UI ROUTES

## Authentication

```text
/login
/forgot-password
```

## Management

```text
/dashboard

/clients
/clients/[id]

/sites
/sites/[id]

/equipment
/equipment/[id]

/maintenance
/maintenance/[id]

/findings
/findings/[id]

/reports
/reports/[id]

/technicians

/settings
```

---

# 61. TECHNICIAN ROUTES

```text
/technician/today
/technician/jobs
/technician/jobs/[id]
/technician/jobs/[id]/equipment/[equipmentId]
/technician/scan
/technician/findings
/technician/profile
```

---

# 62. CLIENT ROUTES

```text
/client/dashboard
/client/reports
/client/reports/[id]
/client/equipment
/client/equipment/[id]
/client/findings
```

---

# 63. UI STATES

Every major screen must implement:

```text
LOADING
EMPTY
ERROR
SUCCESS
```

---

# 64. DASHBOARD QUERY DESIGN

Create compact summary queries:

```text
dashboard_job_summary
dashboard_finding_summary
dashboard_report_summary
dashboard_upcoming_maintenance
```

---

# 65. PERFORMANCE RULE

No dashboard query should retrieve all operational records just to calculate summary values.

Use:

```text
COUNT
GROUP BY
FILTERED AGGREGATES
```

server-side.

---

# 66. TEST STRATEGY

Three layers:

```text
Unit
Integration
E2E
```

---

# 67. UNIT TESTS

Test:

```text
report number generation
date/frequency calculations
finding severity
template rendering
sync queue state transitions
validation schemas
```

---

# 68. INTEGRATION TESTS

Test:

```text
create client
create site
create equipment
create job
assign technician
create inspection
create finding
submit job
generate report
```

---

# 69. RLS TESTS

Mandatory:

```text
Organisation A user
cannot read
Organisation B records
```

```text
Technician A
cannot read
Technician B's unassigned job
```

```text
Client A
cannot read
Client B reports
```

---

# 70. E2E TEST

Golden path:

```text
Admin login
 ↓
Create client
 ↓
Create site
 ↓
Create equipment
 ↓
Create maintenance job
 ↓
Assign technician
 ↓
Technician login
 ↓
Open job
 ↓
Complete inspection
 ↓
Create finding
 ↓
Attach photo
 ↓
Submit
 ↓
Supervisor login
 ↓
Review
 ↓
Generate report
 ↓
Issue report
 ↓
Client login
 ↓
View report
```

---

# 71. OFFLINE E2E TEST

Critical test:

```text
Technician downloads job
        ↓
Disable network
        ↓
Complete inspection
        ↓
Take photo
        ↓
Create finding
        ↓
Submit locally
        ↓
Close/reopen application
        ↓
Enable network
        ↓
Synchronise
        ↓
Server contains complete inspection
```

---

# 72. SECURITY TEST

Verify:

```text
No service role key in client bundle
No unrestricted storage bucket
No cross-tenant queries
No direct client manipulation of job status
No arbitrary report issuance
No IDOR through URL changes
```

---

# 73. CODING AGENT EXECUTION RULE

The agent must execute one phase at a time.

Never ask:

> "Build FireMaint completely."

---

# 74. AGENT STOP CONDITIONS

The agent must stop if:

- existing architecture conflicts with specification
- migration fails
- RLS causes unexpected access
- existing tests fail
- build fails
- required dependency is missing
- a destructive schema change appears necessary

---

# 75. AGENT OUTPUT CONTRACT

Every implementation phase must end with:

```text
IMPLEMENTATION SUMMARY

Files changed:
-

Database migrations:
-

Functions:
-

RLS changes:
-

Tests:
-

Build:
-

Known issues:
-

Next recommended phase:
-
```

---

# 76. PHASE 0 CODEX PROMPT

```text
Bismillah.

You are implementing FireMaint V1.

First inspect the entire repository before modifying anything.

Do NOT assume the repository structure.

Do NOT build the whole application.

Implement PHASE 0 ONLY.

OBJECTIVE

Establish the production foundation:

1. Next.js + TypeScript application structure
2. Supabase integration
3. Authentication
4. Organisation model
5. Profile/role model
6. Initial RLS foundation
7. Storage foundation
8. PWA shell
9. Shared UI/design system
10. Error/loading/empty states
11. Testing foundation

DATABASE

Create migrations only through:
supabase/migrations/

Do not manually edit production database state.

SECURITY

RLS must be enabled from the beginning.

No service-role key may reach browser code.

Every organisation-owned record must be tenant isolated.

ROLES

OWNER
ADMIN
SUPERVISOR
TECHNICIAN
CLIENT

IMPORTANT

Do not implement:
clients
sites
equipment
maintenance jobs
inspection engine
findings
reports

Those belong to later phases.

QUALITY

Run:
- lint
- typecheck
- tests
- production build

Do not ignore errors.

Before completing, report:
- repository structure discovered
- files changed
- migrations created
- dependencies added
- tests run
- build result
- unresolved issues

Stop after PHASE 0.
```

---

# 77. PHASE 1 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 1 ONLY.

Prerequisite:
PHASE 0 must already pass.

Build:

1. Clients
2. Client Contacts
3. Sites
4. Buildings

DATABASE

Create migrations:
clients
client_contacts
sites
buildings

RLS

All records must be tenant isolated.

UI

Build:
 /clients
 /clients/[id]
 /sites
 /sites/[id]

Support:
create
view
edit
archive/inactivate

Do not build:
equipment
maintenance
inspection
findings
reports

Use real Supabase data.
No mock production data.

Acceptance:

Admin can:
1. Create client
2. Add contact
3. Create site
4. Add building
5. View client/site hierarchy
6. Edit records
7. Deactivate records

Test tenant isolation.

Run:
lint
typecheck
tests
build

Stop after PHASE 1.
```

---

# 78. PHASE 2 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 2 ONLY.

Build:

1. Systems
2. Equipment Types
3. Equipment Register
4. Equipment detail
5. QR token generation

Equipment hierarchy:

Organisation
→ Client
→ Site
→ Building
→ System
→ Equipment

Equipment must support:

asset code
serial number
brand
model
capacity
location
installation date
status
QR token

Do not build inspections yet.

Acceptance:

Admin can register equipment.

Equipment can be viewed from the site.

Equipment has permanent asset code.

QR token is opaque and non-sequential.

Tenant isolation is enforced.

Run:
lint
typecheck
tests
build

Stop after PHASE 2.
```

---

# 79. PHASE 3 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 3 ONLY.

Build the data-driven Inspection Template Engine.

Create:

inspection_templates
inspection_template_items

Support:

PASS_FAIL
YES_NO
SELECT
NUMBER
TEXT
PHOTO
DATE
SIGNATURE

Templates must be versioned.

The inspection UI must eventually render from template data.

Do NOT hard-code equipment-specific checklists.

Create the first seed template:

Fire Extinguisher — Standard Inspection v1

Sections:

Identification
Accessibility
Physical Condition
Safety
Overall Condition

Acceptance:

Admin can view template.

Template contains configurable items.

Template version is preserved.

No checklist-specific React hard-coding.

Run:
lint
typecheck
tests
build

Stop after PHASE 3.
```

---

# 80. PHASE 4 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 4 ONLY.

Build maintenance planning and jobs.

Create:

maintenance_plans
maintenance_jobs
job_equipment

Support:

MONTHLY
QUARTERLY
HALF_YEARLY
YEARLY
CUSTOM

Job statuses:

SCHEDULED
IN_PROGRESS
SUBMITTED
UNDER_REVIEW
COMPLETED
CANCELLED

Implement:

create job
assign technician
start job
list job equipment

Technicians may only access assigned jobs.

Do not build the full inspection workflow yet.

Acceptance:

Admin creates maintenance job.

Equipment can be assigned to job.

Technician sees assigned job.

RLS prevents technician access to another technician's job.

Run all verification.
```

---

# 81. PHASE 5 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 5 ONLY.

Build the first complete Technician Inspection workflow.

Technician must be able to:

1. Open assigned job
2. View equipment
3. Start inspection
4. Render inspection template
5. Enter results
6. Add notes
7. Capture photo
8. Create finding
9. Complete inspection
10. Submit job

Build the real database integration.

No fake data.

Inspection must use the template engine.

Required checklist items must be validated.

Technician cannot submit incomplete required inspections.

Implement:

inspections
inspection_results
findings
finding_photos

Do not implement PDF generation yet.

Acceptance:

A technician can complete a real Fire Extinguisher inspection from a mobile browser.

Run:
lint
typecheck
tests
build

Stop after PHASE 5.
```

---

# 82. PHASE 6 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 6 ONLY.

Build offline-first technician support.

Requirements:

1. Cache assigned jobs
2. Cache inspection templates
3. Store inspection results locally
4. Store findings locally
5. Store photos locally
6. Implement sync queue
7. Retry failed sync
8. Display sync state
9. Prevent data loss

Critical test:

Disable network after job download.

Technician must still be able to:

inspect
save
capture photo
create finding
complete work

Re-enable network.

All data must synchronise to Supabase.

Do not silently discard failed operations.

Run offline E2E test.

Stop after PHASE 6.
```

---

# 83. PHASE 7 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 7 ONLY.

Build the report engine.

Pipeline:

database
→ report assembler
→ MaintenanceReportData
→ PDF renderer
→ Supabase Storage
→ reports.pdf_path

Report must contain:

1. Cover
2. Company details
3. Client details
4. Site
5. Maintenance summary
6. Equipment summary
7. Inspection results
8. Findings
9. Recommendations
10. Photos
11. Technician declaration
12. Client acknowledgement
13. Next maintenance

Generate report number server-side.

Example:

FM-2026-000001

Do not query the database directly from the PDF renderer.

Acceptance:

Submitted job can generate a professional PDF.

PDF is stored securely.

Report record points to stored PDF.

Run PDF generation test.
```

---

# 84. PHASE 8 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 8 ONLY.

Build:

Supervisor Review
Report Review
Report Issuance
Client Portal

Report states:

GENERATED
REVIEWED
ISSUED
VOID

Only authorised users may issue reports.

Client users may access only their own:

reports
sites
equipment
findings
maintenance history

Client must not see internal operational data.

Acceptance:

Supervisor reviews report.

Supervisor issues report.

Client logs in.

Client can view and download issued report.

RLS must be tested.

Stop after PHASE 8.
```

---

# 85. PHASE 9 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 9 ONLY.

Build management dashboards.

Do NOT load entire datasets.

Create efficient summary queries.

Dashboard metrics:

Today's jobs
Completed jobs
In-progress jobs
Overdue jobs
Open findings
Critical findings
Upcoming maintenance
Pending reports
Issued reports

Build:

/dashboard
/site/[id] overview
/findings
/maintenance calendar

Performance requirement:

Dashboard must use aggregate/filtered queries.

Do not retrieve all equipment, inspections, photos or reports merely to calculate summary values.

Run performance-oriented tests.
```

---

# 86. PHASE 10 PROMPT

```text
Bismillah.

Implement FireMaint V1 PHASE 10.

Production hardening only.

Audit:

Security
RLS
Storage policies
Authentication
Authorisation
Offline sync
Photo upload
PDF generation
Report immutability
Audit logs
Indexes
Performance
Error handling
Mobile UX
PWA install
Backup/recovery assumptions

Run:

lint
typecheck
unit tests
integration tests
RLS tests
E2E golden path
offline E2E
production build

Do not introduce new features.

Fix defects only.

At completion provide a production-readiness report.
```

---

# 87. GOLDEN PATH

```text
ADMIN
 ↓
Create Client
 ↓
Create Site
 ↓
Create Building
 ↓
Create Equipment
 ↓
Create Maintenance Job
 ↓
Assign Technician

TECHNICIAN
 ↓
Open PWA
 ↓
Open Job
 ↓
Inspect Equipment
 ↓
Capture Evidence
 ↓
Create Finding
 ↓
Submit

SYSTEM
 ↓
Validate
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
View Report
 ↓
Download PDF
```

---

# 88. V1 RELEASE GATE

Do not call FireMaint V1 complete until all are true:

```text
[ ] Auth works
[ ] Tenant isolation works
[ ] Client management works
[ ] Site management works
[ ] Building management works
[ ] Equipment register works
[ ] QR identification works
[ ] Template engine works
[ ] Fire Extinguisher template works
[ ] Maintenance jobs work
[ ] Technician workflow works
[ ] Findings work
[ ] Photos work
[ ] Offline workflow works
[ ] Sync works
[ ] Reports generate
[ ] Reports can be issued
[ ] Client portal works
[ ] Equipment history works
[ ] Dashboard works
[ ] Audit log works
[ ] RLS tests pass
[ ] E2E golden path passes
[ ] Production build passes
```

---

# 89. V1.0 COMMERCIAL DEMO

The demo should use:

```text
ABC Manufacturing Sdn Bhd

1 Site
1 Building

32 Fire Extinguishers
8 Hose Reels
1 Fire Alarm Panel
42 Emergency Lights

1 Technician

Quarterly Maintenance
```

---

# 90. IMPORTANT ARCHITECTURAL DECISION

The FireMaint core must remain domain-neutral underneath.

The domain-specific layer is:

```text
Equipment Types
Inspection Templates
Template Items
Finding Categories
Report Templates
```

The core engine is:

```text
Client
Site
Asset
Schedule
Job
Inspection
Evidence
Finding
Report
```

---

# 91. FUTURE INTEGRATION CONTRACT

Do not implement BizKick integration in V1.

Preserve the ability for:

```text
FireMaint Finding
        ↓
Service Recommendation
        ↓
Quotation Request
        ↓
BizKick
```

---

# 92. NON-NEGOTIABLE ENGINEERING RULES

### Rule 1

No fake production data.

### Rule 2

No frontend-only security.

### Rule 3

No hard-coded inspection checklists.

### Rule 4

No destructive database changes without explicit migration.

### Rule 5

No giant dashboard queries.

### Rule 6

No silent offline data loss.

### Rule 7

No direct database access from PDF renderer.

### Rule 8

No changing issued reports in place.

### Rule 9

No feature expansion during a phase.

### Rule 10

Every phase must pass its acceptance criteria before the next phase starts.

---

# 93. DEFINITION OF THE FIRST MVP

> **A multi-tenant PWA/web platform that allows fire-maintenance contractors to schedule technician inspections, capture structured equipment maintenance records and photographic evidence, automatically generate branded maintenance reports, retain equipment history and give clients access to their reports.**

---

# 94. FINAL ARCHITECTURE

```text
                        FIREMAINT
                            │
                ┌───────────┴───────────┐
                │                       │
          TECHNICIAN PWA          WEB PLATFORM
                │                       │
                │                 ADMIN / SUPERVISOR
                │                       │
                └───────────┬───────────┘
                            │
                     DOMAIN SERVICES
                            │
       ┌──────────┬─────────┼──────────┬──────────┐
       │          │         │          │          │
     CLIENT     ASSET      JOB     INSPECTION   REPORT
       │          │         │          │          │
       │          │         │       EVIDENCE      │
       │          │         │          │          │
       │          │         │       FINDING       │
       └──────────┴─────────┴──────────┴──────────┘
                            │
                         SUPABASE
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          POSTGRES        STORAGE         AUTH
             │
            RLS
```

---

# 95. BUILDING MANTRA

## Bismillah.

**Do not build the report first.**

Build the data.

**Do not build the dashboard first.**

Build the workflow.

**Do not build AI first.**

Build structured evidence.

**Do not build every fire-service feature.**

Build one complete vertical slice.

**Do not make the technician enter information twice.**

Capture once.

---

# 96. FIRST VERTICAL SLICE

```text
                    FIRE EXTINGUISHER
                           │
                           ▼
                    EQUIPMENT FE-001
                           │
                           ▼
                  MAINTENANCE JOB
                           │
                           ▼
                    TECHNICIAN PWA
                           │
                           ▼
                    INSPECTION FORM
                           │
                  ┌────────┴────────┐
                  │                 │
                 PASS             ISSUE
                                    │
                                  PHOTO
                                    │
                                 FINDING
                                    │
                                    ▼
                              SUBMIT JOB
                                    │
                                    ▼
                              PDF REPORT
                                    │
                                    ▼
                             CLIENT PORTAL
```

**This is the first thing we build and prove.**
