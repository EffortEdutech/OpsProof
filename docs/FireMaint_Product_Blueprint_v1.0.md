# FireMaint Product Blueprint v1.0

## FIREMAINT
### Digital Fire Maintenance & Reporting Platform
### Product Blueprint v1.0

**Product principle:**  
**Capture Once. Report Automatically. Track Everything.**

**Architecture:** Next.js + TypeScript + Supabase/PostgreSQL + PWA  
**Deployment:** Cloud-first, offline-capable technician PWA  
**Product model:** Multi-tenant SaaS  
**Initial vertical:** Fire protection maintenance  
**Expansion path:** M&E / Aircond / Electrical / Plumbing / Building Maintenance

---

# 1. PRODUCT VISION

FireMaint is a digital maintenance platform for fire-service contractors.

It replaces:

- paper inspection forms
- Excel equipment lists
- WhatsApp job instructions
- handwritten findings
- manually prepared maintenance reports
- disconnected photo folders
- fragmented maintenance history

with one connected workflow:

```text
CLIENT
   ↓
SITE
   ↓
EQUIPMENT REGISTER
   ↓
MAINTENANCE SCHEDULE
   ↓
TECHNICIAN JOB
   ↓
INSPECTION
   ↓
EVIDENCE
   ↓
FINDING
   ↓
REPORT
   ↓
CLIENT
   ↓
FOLLOW-UP
   ↓
NEXT MAINTENANCE
```

---

# 2. PRODUCT PROMISE

FireMaint should make the following promise:

> **From technician inspection to client-ready maintenance report — automatically.**

The technician captures the work once.

The platform reuses that information everywhere.

```text
ONE CAPTURE
     │
     ├── Equipment History
     ├── Finding Register
     ├── Maintenance Summary
     ├── Client Portal
     ├── PDF Report
     ├── Dashboard
     └── Future Quotation
```

---

# 3. MVP BOUNDARY

The first commercial release must NOT become an ERP.

## V1 MUST HAVE

### Organisation

- company profile
- users
- roles
- branding

### Client

- clients
- contacts
- sites
- buildings

### Equipment

- equipment register
- equipment types
- QR identification
- equipment history

### Maintenance

- maintenance plans
- scheduled jobs
- technician assignment
- job status

### Inspection

- configurable templates
- checklist items
- PASS / ATTENTION / FAIL / N/A
- notes
- photos
- findings
- recommendations

### Reporting

- automatic maintenance report
- report numbering
- PDF generation
- company branding
- photo evidence
- report history

### Dashboard

- jobs
- overdue jobs
- findings
- maintenance status
- client/project reporting

### Client Portal

- reports
- equipment
- findings
- maintenance history

### Offline

- cached assigned jobs
- local inspection data
- local photos
- sync queue
- retry mechanism

---

# 4. EXPLICITLY OUT OF V1

Do not build these initially:

- accounting
- payroll
- HR
- full CRM
- inventory ERP
- invoicing engine
- complicated AI assistant
- native Android application
- native iOS application
- complex quotation engine
- advanced predictive maintenance

The system must first perfect:

> Schedule → Inspect → Evidence → Finding → Report → History.

---

# 5. USER ROLES

## OWNER / ADMIN

Full access.

Can manage:

- company
- users
- clients
- sites
- equipment
- templates
- schedules
- jobs
- reports
- findings
- settings

## SUPERVISOR

Can manage:

- jobs
- technicians
- inspections
- findings
- reports
- equipment

Cannot change company-level security settings.

## TECHNICIAN

Can access:

- assigned jobs
- assigned sites
- assigned equipment
- inspections
- photos
- findings

Cannot access unrelated clients.

## CLIENT

Can access:

- own organisation/site
- equipment
- completed reports
- findings
- maintenance history

Read-only in V1.

---

# 6. TENANCY MODEL

FireMaint is multi-tenant from Day 1.

```text
Organisation
│
├── Users
├── Clients
├── Sites
├── Equipment
├── Templates
├── Maintenance Plans
├── Jobs
├── Inspections
├── Findings
└── Reports
```

Every business record must carry:

```text
organisation_id
```

No tenant should ever be able to access another tenant's data.

---

# 7. CORE DOMAIN MODEL

```text
ORGANISATION
     │
     ├── USERS
     │
     ├── CLIENT
     │      │
     │      └── SITE
     │             │
     │             └── BUILDING
     │                    │
     │                    └── SYSTEM
     │                           │
     │                           └── EQUIPMENT
     │
     ├── MAINTENANCE PLAN
     │
     ├── JOB
     │
     ├── INSPECTION
     │
     ├── FINDING
     │
     └── REPORT
```

---

# 8. DATABASE SCHEMA

## organisations

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
created_at
updated_at
```

## profiles

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

Authentication remains in Supabase Auth.

## clients

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

## client_contacts

```text
id
client_id
name
position
phone
email
is_primary
created_at
```

## sites

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

## buildings

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

## systems

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

Examples:

```text
Fire Alarm
Fire Extinguishing
Hose Reel
Sprinkler
Emergency Lighting
Exit Signage
```

---

# 9. EQUIPMENT REGISTER

## equipment_types

```text
id
organisation_id
name
category
code
description
template_id
active
created_at
updated_at
```

Examples:

```text
9kg Dry Powder Extinguisher
CO2 Extinguisher
Hose Reel
Smoke Detector
Heat Detector
Manual Call Point
Fire Alarm Panel
Emergency Light
Exit Sign
Sprinkler Head
```

## equipment

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

`asset_code` must be unique within an organisation.

Example:

```text
FE-001
FE-002
HR-001
FA-001
EL-001
```

---

# 10. MAINTENANCE PLANS

## maintenance_plans

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

Frequency enum:

```text
MONTHLY
QUARTERLY
HALF_YEARLY
YEARLY
CUSTOM
```

---

# 11. MAINTENANCE JOB

## maintenance_jobs

```text
id
organisation_id
maintenance_plan_id

client_id
site_id

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
OVERDUE
```

---

# 12. JOB EQUIPMENT

Do not assume that every job inspects every asset.

Create an explicit job-equipment relationship.

## job_equipment

```text
id
job_id
equipment_id
sequence
status
created_at
```

This allows a supervisor to decide exactly what is expected for a particular visit.

---

# 13. INSPECTION TEMPLATE ENGINE

This is one of the most important architectural decisions.

Do NOT hard-code:

```text
if equipment_type = extinguisher...
```

Instead create a reusable template system.

## inspection_templates

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

## inspection_template_items

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
```

Supported field types:

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

# 14. EXAMPLE TEMPLATE

## Fire Extinguisher

```text
SECTION: Identification

Equipment Type
Capacity
Serial Number
Location

SECTION: Physical

Accessible?
Condition?
Corrosion?
Label condition?

SECTION: Safety

Safety pin?
Seal intact?
Pressure normal?
Hose/nozzle condition?

SECTION: Result

Overall result
Technician note
Photo
```

---

# 15. INSPECTION DATA

## inspections

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

## inspection_results

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

This makes templates versionable.

---

# 16. FINDINGS

## findings

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

# 17. FINDING EVIDENCE

## finding_photos

```text
id
finding_id
storage_path
caption
taken_at
uploaded_at
created_by
```

Photos should be stored in Supabase Storage.

Do not store image binaries inside PostgreSQL.

---

# 18. REPORT MODEL

## reports

```text
id
organisation_id
job_id

report_number
report_type

status

generated_at
approved_at

pdf_path

created_by
created_at
updated_at
```

Example:

```text
FM-2026-000123
```

Report number generation must happen server-side.

---

# 19. REPORT GENERATION

The report engine receives structured data:

```text
Job
+
Client
+
Site
+
Equipment
+
Inspection Results
+
Findings
+
Photos
+
Technician
+
Company Branding
```

and generates:

```text
Maintenance Report PDF
```

The PDF is an output, not the primary data store.

Never design the database around the PDF.

---

# 20. REPORT STRUCTURE

Recommended report:

### Cover

Company branding

```text
FIRE MAINTENANCE REPORT

Client
Site
Maintenance Date
Report Number
Technician
```

### 1. Maintenance Summary

### 2. Equipment Summary

### 3. Inspection Results

### 4. Findings

### 5. Recommendations

### 6. Photographic Evidence

### 7. Technician Declaration

### 8. Client Acknowledgement

### 9. Next Maintenance

### 10. Appendix

---

# 21. REPORT STATUS

```text
DRAFT
GENERATED
REVIEWED
ISSUED
VOID
```

Technician should never directly issue the final report.

Recommended flow:

```text
TECHNICIAN
    ↓
SUBMIT
    ↓
SUPERVISOR REVIEW
    ↓
REPORT GENERATED
    ↓
ISSUED
    ↓
CLIENT
```

For small companies, Admin can configure:

```text
Auto Issue = ON
```

---

# 22. TECHNICIAN PWA

The technician interface should have only five major areas:

```text
TODAY
JOBS
SCAN
FINDINGS
PROFILE
```

---

# 23. TECHNICIAN HOME

```text
Good morning, Ahmad

TODAY
────────────────

3 Jobs

09:00
ABC Manufacturing
24 assets

[ START ]

14:00
XYZ Mall
18 assets

[ VIEW ]

────────────────

SYNC

✓ All data synced
```

The sync state must always be visible.

---

# 24. JOB FLOW

```text
JOB
 ↓
START
 ↓
SITE CONFIRMATION
 ↓
EQUIPMENT LIST
 ↓
INSPECT
 ↓
FINDINGS
 ↓
REVIEW
 ↓
SUBMIT
```

---

# 25. SITE CONFIRMATION

Optional GPS verification:

```text
ABC Manufacturing

Site location detected

● Within site area

[ CONFIRM ARRIVAL ]
```

GPS must not be required for the basic workflow.

---

# 26. EQUIPMENT SCREEN

```text
24 ASSETS

✓ 18 completed
● 4 pending
⚠ 2 findings

[ FE-001 ]
[ FE-002 ]
[ FE-003 ]
[ HR-001 ]
[ FA-001 ]
```

Use large touch targets.

---

# 27. QR SCAN

Technician can:

```text
SCAN QR
   ↓
Equipment found
   ↓
Current inspection
   ↓
History
```

QR must resolve to an opaque secure token, not expose internal database IDs.

---

# 28. INSPECTION SCREEN

Use a vertical checklist.

```text
FE-001

9kg Dry Powder

ACCESSIBILITY
[ PASS ] [ FAIL ]

SAFETY PIN
[ PASS ] [ FAIL ]

SEAL
[ PASS ] [ FAIL ]

PRESSURE
[ NORMAL ] [ LOW ]

CONDITION
[ GOOD ] [ ATTENTION ]

PHOTO
[ TAKE PHOTO ]

NOTE
[................]

[ SAVE & NEXT ]
```

The most common action should require the fewest taps.

---

# 29. ISSUE FLOW

If technician selects FAIL:

```text
FAIL
 ↓
Finding required
 ↓
Severity
 ↓
Photo
 ↓
Recommendation
 ↓
Save
```

Do not make the technician navigate to another page.

---

# 30. OFFLINE ARCHITECTURE

This is mandatory.

The technician app should have a local data layer.

Conceptually:

```text
SERVER
   ↕
SYNC ENGINE
   ↕
LOCAL DATABASE
   ↕
PWA
```

The local database stores:

- assigned jobs
- job equipment
- inspection templates
- inspection results
- findings
- photo references
- sync status

---

# 31. SYNC QUEUE

Every mutation should create a local queue record.

```text
sync_queue

id
entity_type
entity_id
operation
payload
created_at
attempt_count
last_attempt_at
status
error
```

Operations:

```text
CREATE
UPDATE
DELETE
UPLOAD
```

---

# 32. SYNC RULE

Never rely on:

```text
"Save button → API call → hope network works"
```

Instead:

```text
USER SAVES
   ↓
LOCAL SAVE
   ↓
UI CONFIRMS SAVE
   ↓
SYNC QUEUE
   ↓
NETWORK AVAILABLE
   ↓
SERVER SYNC
```

---

# 33. PHOTO SYNC

Photos should follow:

```text
CAPTURE
 ↓
COMPRESS
 ↓
LOCAL STORAGE
 ↓
CREATE PHOTO RECORD
 ↓
SYNC METADATA
 ↓
UPLOAD FILE
 ↓
MARK UPLOADED
```

---

# 34. CONFLICT STRATEGY

V1 should avoid complicated collaborative editing.

Rule:

> **Technician owns an assigned inspection while the job is IN_PROGRESS.**

Supervisor cannot modify an active technician inspection.

After submission:

```text
SUBMITTED
```

the inspection becomes immutable except through controlled correction/revision.

---

# 35. STATE MACHINE

## Job

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

Alternative:

```text
SCHEDULED → CANCELLED
```

Overdue is preferably a derived condition:

```text
scheduled_date < today
AND status NOT IN (COMPLETED, CANCELLED)
```

---

# 36. INSPECTION

```text
NOT_STARTED
    ↓
IN_PROGRESS
    ↓
COMPLETED
    ↓
LOCKED
```

---

# 37. FINDING

```text
OPEN
 ↓
IN_PROGRESS
 ↓
RESOLVED
 ↓
VERIFIED
 ↓
CLOSED
```

---

# 38. CLIENT PORTAL

Client sees:

```text
Dashboard

ABC Manufacturing

Fire Maintenance Status

● Last maintenance
02 Oct 2026

● Next maintenance
02 Jan 2027

Equipment
83

Open Findings
5

Reports
12
```

---

# 39. CLIENT REPORT VIEW

```text
October 2026

Maintenance Report
FM-2026-000123

Status
ISSUED

[ VIEW ]

[ DOWNLOAD PDF ]
```

Client should not see internal technician notes unless explicitly configured.

---

# 40. WEB DASHBOARD

The dashboard should answer:

## What needs my attention?

### Today's Jobs

```text
12 scheduled
7 completed
3 in progress
2 overdue
```

### Findings

```text
2 critical
8 high
21 medium
14 low
```

### Reports

```text
9 pending review
16 issued
```

### Upcoming

```text
Next 7 days
31 jobs
```

---

# 41. PROJECT DASHBOARD

When opening a project/site:

```text
ABC MANUFACTURING

83 Assets

Last Maintenance
02 Oct 2026

Next Maintenance
02 Jan 2027

────────────────

Assets
83

Open Findings
5

Reports
12

Maintenance Jobs
36
```

Tabs:

```text
Overview
Equipment
Maintenance
Findings
Reports
Documents
```

---

# 42. EQUIPMENT HISTORY

Every equipment record should provide:

```text
FE-017

Current Status
ATTENTION

────────────────

Asset Details

Type
9kg Dry Powder

Serial
XXXX

Location
Production Area

────────────────

Maintenance History

02 Oct 2026
LOW PRESSURE

02 Jul 2026
PASS

02 Apr 2026
PASS

02 Jan 2026
PASS
```

---

# 43. ADMIN CONFIGURATION

Admin needs:

```text
Company Profile
Users
Roles
Equipment Types
Inspection Templates
Report Templates
Finding Categories
Severity Rules
Maintenance Frequencies
Notification Settings
```

---

# 44. RLS SECURITY MODEL

Supabase RLS must be enabled from the beginning.

Every organisation-owned table must enforce:

```text
user.organisation_id = row.organisation_id
```

Client users additionally require:

```text
client_id = user's client_id
```

Technicians require assignment-based access for jobs.

Never rely on frontend filtering for security.

---

# 45. STORAGE SECURITY

Buckets:

```text
company-assets
inspection-photos
report-pdfs
documents
```

Storage paths should be tenant scoped:

```text
/{organisation_id}/
    /sites/
    /inspections/
    /findings/
    /reports/
```

Use signed URLs for private files.

---

# 46. AUDIT LOG

Create:

```text
audit_logs

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

Record important events:

```text
JOB_CREATED
JOB_ASSIGNED
INSPECTION_SUBMITTED
FINDING_CREATED
FINDING_UPDATED
REPORT_GENERATED
REPORT_ISSUED
REPORT_VOIDED
```

---

# 47. NOTIFICATION ENGINE

V1:

```text
IN_APP
EMAIL
```

Events:

```text
JOB_ASSIGNED
JOB_DUE
JOB_OVERDUE
REPORT_READY
FINDING_CREATED
FINDING_ESCALATED
```

---

# 48. DASHBOARD METRICS

Initial KPIs:

### Operations

- scheduled jobs
- completed jobs
- overdue jobs
- completion rate

### Maintenance

- assets maintained
- assets overdue
- upcoming maintenance

### Findings

- open findings
- findings by severity
- unresolved findings
- repeat findings

### Reporting

- pending reports
- issued reports
- reports by client

---

# 49. REPEAT-FINDING INTELLIGENCE

Do not build AI yet.

Use structured data.

Example:

```text
FE-017

Finding:
Low pressure

Previous:
Low pressure

Previous:
Low pressure
```

Dashboard can flag:

> **Recurring finding**

---

# 50. FUTURE AI LAYER

Once enough structured data exists:

```text
Inspection
    ↓
Structured Finding
    ↓
AI Interpretation
    ↓
Suggested Recommendation
```

Potential features:

- report narrative generation
- finding classification
- photo-assisted defect suggestion
- recurring defect detection
- maintenance trend analysis
- natural language dashboard queries

AI suggestions must remain reviewable.

---

# 51. DESIGN SYSTEM

### Technician

- large touch controls
- minimal text
- high contrast
- clear status indicators
- fixed bottom navigation
- fast transitions

### Office

- dense information
- tables
- filters
- dashboard cards
- charts
- side navigation

### Client

- clean
- professional
- report-oriented
- minimal administrative complexity

---

# 52. MOBILE NAVIGATION

```text
┌──────────────────────────────┐
│                              │
│       CONTENT                │
│                              │
│                              │
├──────────────────────────────┤
│ Today │ Jobs │ Scan │ More  │
└──────────────────────────────┘
```

Avoid a large enterprise sidebar on mobile.

---

# 53. DESIGN PRINCIPLE

Every screen should answer:

> **What is the next action?**

Examples:

Job:

**START JOB**

Equipment:

**INSPECT**

Finding:

**RESOLVE**

Report:

**ISSUE**

Dashboard:

**WHAT NEEDS ATTENTION?**

---

# 54. V1 VERTICAL SLICE

Do NOT build every screen first.

Build one complete journey:

```text
Create Client
      ↓
Create Site
      ↓
Create Equipment
      ↓
Create Maintenance Job
      ↓
Assign Technician
      ↓
Technician Opens PWA
      ↓
Inspects Equipment
      ↓
Adds Photo
      ↓
Creates Finding
      ↓
Submits Job
      ↓
Supervisor Reviews
      ↓
Report Generated
      ↓
Client Views Report
```

---

# 55. IMPLEMENTATION PHASES

## PHASE 0 — FOUNDATION

Create:

```text
Next.js application
Supabase project
environment configuration
database migrations
auth
organisation model
RLS
storage
design system
PWA shell
```

Acceptance:

> User can securely log in and access only their organisation.

## PHASE 1 — CLIENT + SITE

Build:

```text
Clients
Client Contacts
Sites
Buildings
```

Acceptance:

> Admin can create a client and site and view it from the dashboard.

## PHASE 2 — EQUIPMENT

Build:

```text
Equipment Types
Systems
Equipment
QR tokens
Equipment history
```

Acceptance:

> Admin can create equipment and technician can find it through the job or QR scan.

## PHASE 3 — TEMPLATE ENGINE

Build:

```text
Inspection Templates
Template Items
Versioning
Field types
Validation
```

Start with Fire Extinguisher.

## PHASE 4 — MAINTENANCE JOB

Build:

```text
Maintenance Plan
Job generation
Assignment
Job status
Job equipment
```

## PHASE 5 — TECHNICIAN INSPECTION

Build:

```text
Job screen
Equipment list
Inspection
Finding
Photo
Submission
```

## PHASE 6 — OFFLINE

Add:

```text
local database
sync queue
offline detection
photo queue
retry
sync status
```

## PHASE 7 — REPORT ENGINE

Build:

```text
Report template
report data assembler
PDF renderer
photo layout
report numbering
report storage
```

## PHASE 8 — SUPERVISOR + CLIENT

Build:

```text
Review
Issue report
Client portal
Report history
Equipment history
```

## PHASE 9 — DASHBOARD

Build:

```text
KPI cards
job dashboard
finding dashboard
maintenance calendar
client/project dashboard
```

## PHASE 10 — COMMERCIAL HARDENING

Before selling:

```text
tenant isolation test
RLS test
offline test
photo upload test
PDF test
permission test
audit test
mobile usability test
performance test
backup/recovery test
```

---

# 56. CODE STRUCTURE

Recommended:

```text
src/
│
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── technician/
│   ├── client/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── equipment/
│   ├── inspection/
│   ├── findings/
│   ├── reports/
│   └── dashboard/
│
├── features/
│   ├── organisations/
│   ├── clients/
│   ├── sites/
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
│   ├── storage/
│   ├── pdf/
│   └── sync/
│
└── types/
```

---

# 57. SUPABASE MIGRATION ORDER

Use sequential migrations.

```text
001_extensions
002_organisations
003_profiles_roles
004_clients
005_client_contacts
006_sites
007_buildings
008_systems
009_equipment_types
010_equipment
011_maintenance_plans
012_maintenance_jobs
013_job_equipment
014_inspection_templates
015_inspection_template_items
016_inspections
017_inspection_results
018_findings
019_finding_photos
020_reports
021_audit_logs
022_notifications
023_rls_policies
024_storage_policies
025_functions
026_indexes
```

---

# 58. DATABASE FUNCTIONS / RPC

Keep business-critical operations server-side.

Initial functions:

```text
create_maintenance_job()
assign_job()
start_job()
submit_inspection()
submit_job()
generate_report_number()
issue_report()
create_next_maintenance_job()
resolve_finding()
verify_finding()
```

---

# 59. IMPORTANT PERFORMANCE RULES

Do NOT make every dashboard load the entire database.

Use:

- server-side aggregation
- pagination
- selective queries
- indexed foreign keys
- summary RPCs
- lazy loading
- cached reference data
- limited joins
- proper Supabase query selection

Dashboard should receive small summary datasets rather than all operational records.

---

# 60. INDEXES

At minimum:

```text
clients(organisation_id)

sites(organisation_id)
sites(client_id)

equipment(organisation_id)
equipment(site_id)
equipment(asset_code)

maintenance_jobs(organisation_id)
maintenance_jobs(scheduled_date)
maintenance_jobs(assigned_to)
maintenance_jobs(status)

inspections(job_id)
inspections(equipment_id)

findings(organisation_id)
findings(status)
findings(severity)
findings(equipment_id)

reports(organisation_id)
reports(job_id)
```

---

# 61. SAFE CODING RULE

Every implementation task must follow:

```text
READ
 ↓
UNDERSTAND
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
MIGRATE
 ↓
TEST
 ↓
VERIFY
```

---

# 62. CODING AGENT CONTRACT

Every task should specify:

### Objective

What is being built.

### Existing behaviour

What must not break.

### Files allowed

Which files may change.

### Database changes

Exact migration.

### Acceptance criteria

How success is verified.

### Tests

What must pass.

### Stop condition

When the agent must stop rather than expanding scope.

---

# 63. FIRST CODING AGENT PROMPT

```text
Implement FireMaint Phase 0 only.

Do not build client, equipment, maintenance,
inspection or reporting features yet.

Establish:

1. Next.js TypeScript application structure
2. Supabase integration
3. Authentication
4. Organisation model
5. Profile/role model
6. RLS foundation
7. Storage foundation
8. PWA shell
9. Shared design system
10. Error/loading/empty states

Requirements:

- TypeScript strict mode
- No mock production data
- No fake API responses
- Database changes through migrations
- RLS enabled from the beginning
- No cross-tenant access
- Existing application behaviour must not be broken

Before changing files:
inspect the repository structure.

After implementation:
run lint
run typecheck
run tests
run build

Report:
- files changed
- migrations created
- tests executed
- remaining issues
```

---

# 64. SECOND AGENT TASK

After Phase 0 is verified:

```text
Implement FireMaint Client + Site vertical slice.

Build:

Client
Client Contact
Site
Building

Connect:

Database
RLS
API/server actions
Forms
Validation
Dashboard
Mobile responsive UI

Do not implement equipment or maintenance jobs.

Acceptance:

Admin can create:
Client
→ Contact
→ Site
→ Building

User can edit and view them.

Tenant isolation must be tested.

Run:
lint
typecheck
tests
build
```

---

# 65. THIRD AGENT TASK

```text
Implement FireMaint Equipment vertical slice.

Build:

Equipment Types
Systems
Equipment
QR token
Equipment detail
Equipment history foundation

Connect to existing Client/Site/Building model.

Do not build inspection yet.

Acceptance:

Admin can register equipment.

Technician can locate equipment.

Equipment has stable asset code.

QR resolves to the correct equipment.

RLS prevents cross-tenant access.

Run all verification checks.
```

---

# 66. FOURTH AGENT TASK

Build the template engine.

```text
Equipment Type
      ↓
Inspection Template
      ↓
Template Version
      ↓
Template Items
      ↓
Inspection
      ↓
Results
```

Once this works, adding new fire systems becomes configuration rather than redevelopment.

---

# 67. PRODUCT EXPANSION ARCHITECTURE

```text
                 MAINTENANCE PLATFORM
                         │
             ┌───────────┴───────────┐
             │                       │
         FIRE DOMAIN            OTHER DOMAINS
             │                       │
      ┌──────┼──────┐         ┌──────┼──────┐
      │      │      │         │      │      │
 Exting.  Alarm  Hose       HVAC   Electrical Plumbing
```

---

# 68. FUTURE BIZKICK INTEGRATION

Do not implement this in V1.

But design the Finding entity so it can later support:

```text
Finding
   ↓
Service Recommendation
   ↓
Quotation Request
   ↓
BizKick
```

---

# 69. FUTURE WORKLEDGER CONNECTION

FireMaint can also produce universal work records:

```text
Maintenance Job
     ↓
Work Record
     ↓
Evidence
     ↓
Finding
     ↓
Report
```

---

# 70. COMMERCIAL V1 PACKAGE

The first sellable package should include:

### Technician PWA

- jobs
- equipment
- checklist
- photos
- findings
- offline mode

### Management Web

- clients
- sites
- equipment
- maintenance
- findings
- reports
- dashboard

### Client Portal

- reports
- equipment
- findings
- history

### Reporting

- branded PDF
- automatic numbering
- photographic evidence
- maintenance summary

---

# 71. CUSTOMER ONBOARDING

A new fire contractor should be able to go from:

```text
SIGN UP
   ↓
COMPANY PROFILE
   ↓
ADD CLIENT
   ↓
ADD SITE
   ↓
ADD EQUIPMENT
   ↓
CREATE MAINTENANCE PLAN
   ↓
ASSIGN TECHNICIAN
   ↓
FIRST JOB
```

---

# 72. THE FIRST DEMO SCENARIO

Use one realistic demonstration:

```text
Client:
ABC Manufacturing

Site:
ABC Manufacturing Plant

Assets:
32 Extinguishers
8 Hose Reels
1 Fire Alarm Panel
42 Emergency Lights

Technician:
Ahmad

Maintenance:
Quarterly

Job:
02 October 2026
```

---

# 73. DEFINITION OF DONE FOR V1

FireMaint V1 is commercially ready when:

```text
[ ] Multi-tenant auth works
[ ] RLS tested
[ ] Admin can create client
[ ] Admin can create site
[ ] Admin can register equipment
[ ] Admin can create maintenance job
[ ] Technician can receive job
[ ] Technician can work offline
[ ] Technician can inspect equipment
[ ] Technician can capture photos
[ ] Technician can create finding
[ ] Technician can submit job
[ ] Supervisor can review
[ ] PDF report generated automatically
[ ] Report can be issued
[ ] Client can access report
[ ] Equipment history works
[ ] Findings history works
[ ] Maintenance schedule works
[ ] Dashboard works
[ ] Audit trail works
[ ] Mobile workflow tested
[ ] Sync failure tested
[ ] Production build passes
```

---

# 74. FINAL PRODUCT ARCHITECTURE

```text
                         FIREMAINT
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     TECHNICIAN          MANAGEMENT           CLIENT
        PWA                  WEB              PORTAL
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                       APPLICATION
                           CORE
                             │
       ┌─────────────┬───────┼───────┬──────────────┐
       │             │       │       │              │
     CLIENT        ASSET    JOB   INSPECTION      REPORT
       │             │       │       │              │
       │             │       │       ├── Evidence   │
       │             │       │       └── Findings   │
       │             │       │                      │
       └─────────────┴───────┴──────────────────────┘
                             │
                         SUPABASE
                             │
                 ┌───────────┼───────────┐
                 │           │           │
              POSTGRES     STORAGE      AUTH
                 │
                RLS
```

---

# 75. PRODUCT DNA

FireMaint is NOT a digital form.

It is:

> **A maintenance evidence and reporting system.**

The form is only the technician interface.

The real product is the connected data layer underneath.

---

# 76. RECOMMENDED BUILD ORDER

```text
01  Repository / Foundation
        ↓
02  Auth + Organisation + RLS
        ↓
03  Client + Site
        ↓
04  Equipment Register
        ↓
05  Inspection Template Engine
        ↓
06  Maintenance Job
        ↓
07  Technician PWA
        ↓
08  Offline Sync
        ↓
09  Findings
        ↓
10  Report Engine
        ↓
11  Supervisor Review
        ↓
12  Client Portal
        ↓
13  Dashboard
        ↓
14  Production Hardening
```

---

# 77. FIRST RELEASE TARGET

The first release should demonstrate:

> **Create a client → create a site → create equipment → assign a maintenance job → technician completes inspection on phone → captures photo → records defect → submits → system generates professional PDF → client sees report.**

---

## FireMaint V1 Principle

> **Technician works.  
> FireMaint records.  
> Report writes itself.  
> Management sees everything.  
> Client gets the evidence.**
