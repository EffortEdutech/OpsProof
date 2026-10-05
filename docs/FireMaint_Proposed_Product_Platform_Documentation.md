# Proposed Product: Fire Maintenance Reporting Platform

## Working Product Name

### FireMaint
**Digital Fire Maintenance & Reporting Platform**

Alternative product names considered:

- FireLog
- FireServe
- FireReport
- FireTrack
- FireCare
- FIRE360
- SafeFire

**Preferred working name:** FireMaint

The product should be positioned as a focused vertical SaaS platform for fire-maintenance contractors rather than as a generic reporting application.

---

# 1. Core Product Idea

The product is built around one simple operating principle:

> **Technician records the work once → the platform turns it into a professional maintenance record, evidence trail, client report and management dashboard automatically.**

FireMaint should provide two clearly separated experiences:

## Technician PWA

Designed for field use on a mobile phone.

Core journey:

```text
Phone
  ↓
Job
  ↓
Equipment
  ↓
Check
  ↓
Photo
  ↓
Finding
  ↓
Submit
```

The technician interface should be fast, simple and suitable for use on site.

## Office / Web Platform

Designed for administration, supervisors and management.

Core structure:

```text
Clients
  ↓
Projects / Sites
  ↓
Contracts
  ↓
Maintenance
  ↓
Reports
  ↓
Defects / Findings
  ↓
Dashboard
  ↓
History
```

The technician should not need to interact with a complicated ERP-style interface.

The office should receive a proper operational and reporting platform.

---

# 2. Complete Workflow

```text
                    FIREMAINT
                        │
          ┌─────────────┴─────────────┐
          │                           │
     TECHNICIAN PWA              WEB PLATFORM
          │                           │
          ▼                           ▼
   Today's Jobs                  Dashboard
          │                       Clients
          ▼                       Projects
   Select Project                Equipment
          │                       Contracts
          ▼                       Maintenance
   Select System                 Findings
          │                       Reports
          ▼                       Analytics
   Inspection
          │
     ┌────┴────┐
     │         │
   PASS      ISSUE
     │         │
     │      Photo/Evidence
     │      Description
     │      Recommendation
     │         │
     └────┬────┘
          ▼
     Submit Job
          │
          ▼
   AUTO GENERATE
      REPORT
          │
     ┌────┼──────────────┐
     ▼    ▼              ▼
    PDF   Client       Dashboard
          Portal
```

This is the fundamental FireMaint value proposition.

---

# 3. Technician PWA

The technician workflow should require as little typing as possible.

## Home Screen

Example:

```text
GOOD MORNING, AHMAD

Today's Jobs

┌───────────────────────────┐
│ 09:00                     │
│ ABC Manufacturing         │
│ Monthly Fire Maintenance  │
│                           │
│ 24 Equipment              │
│ ● Scheduled               │
│                           │
│ [ START JOB ]             │
└───────────────────────────┘

┌───────────────────────────┐
│ 14:00                     │
│ XYZ Shopping Centre       │
│ Quarterly Inspection      │
│                           │
│ [ VIEW JOB ]              │
└───────────────────────────┘
```

The PWA should be installable and usable from a technician's mobile device.

---

# 4. Job Screen

Once the technician starts a job:

```text
ABC MANUFACTURING

Monthly Maintenance
2 Oct 2026

Technician:
Ahmad

Progress

████████████░░░░  18 / 24

[ FIRE EXTINGUISHER ]
[ FIRE HOSE REEL ]
[ FIRE ALARM ]
[ EMERGENCY LIGHT ]
[ EXIT SIGN ]
```

The system should remember the equipment list from the project/site.

The technician should not need to recreate the asset list during every visit.

---

# 5. Equipment Inspection

Example: Fire Extinguisher

```text
FE-001

Location
Production Area

Type
ABC Dry Powder

Capacity
9kg

Serial No.
XXXXXX

────────────────

Condition

○ PASS
○ ATTENTION
○ FAIL
○ NOT ACCESSIBLE

────────────────

Checklist

☑ Accessible
☑ Correct location
☑ Safety pin intact
☑ Seal intact
☑ Pressure indicator normal
☑ Hose/nozzle condition
☑ Cylinder condition
☑ Label condition

────────────────

Photo

[ 📷 TAKE PHOTO ]

────────────────

Finding

[____________________]

Recommendation

[____________________]

[ SAVE ]
```

The system should minimise unnecessary manual entry.

---

# 6. Smart Inspection Templates

FireMaint should use configurable, equipment-specific inspection templates.

These templates must be data-driven rather than hard-coded in the application.

## Fire Extinguisher

Typical inspection items:

- Location
- Type
- Capacity
- Serial number
- Accessibility
- Physical condition
- Safety pin
- Seal
- Pressure
- Hose/nozzle
- Label
- Inspection result
- Photo

## Hose Reel

Typical inspection items:

- Cabinet condition
- Hose condition
- Nozzle
- Valve
- Accessibility
- Signage
- Leakage
- Pressure/test
- Photo

## Fire Alarm

Typical inspection items:

- Panel condition
- Power supply
- Battery
- Alarm indicator
- Detector
- Manual Call Point
- Bell/sounder
- Zone
- Functional test
- Fault indication
- Photo

## Emergency Light

Typical inspection items:

- Physical condition
- Charging indicator
- Lamp
- Test operation
- Battery
- Duration/test result
- Photo

## Exit Sign

Typical inspection items:

- Visibility
- Illumination
- Physical condition
- Direction
- Battery/emergency operation
- Photo

## Sprinkler

Typical inspection items:

- Head condition
- Obstruction
- Corrosion
- Leakage
- Valve condition
- Accessibility
- Identification
- Photo

The template system is one of the key commercial advantages of FireMaint because different contractors can configure the platform to suit their procedures.

---

# 7. PASS / ISSUE Workflow

The platform should allow inspection results to drive the operational workflow automatically.

```text
PASS
 ↓
Record result

ISSUE
 ↓
Finding created
 ↓
Photo required
 ↓
Recommendation
 ↓
Severity
 ↓
Follow-up
```

Example:

```text
ISSUE

Equipment:
FE-017

Problem:
Pressure below normal range

Severity:

○ Observation
● Attention
○ Critical

Photo:
IMG_20261002_1034

Recommendation:
Service / recharge extinguisher

Status:

OPEN
```

The office should not need to interpret unstructured technician notes manually.

---

# 8. Defect / Finding Management

Findings should become a central FireMaint module.

Example dashboard:

```text
OPEN FINDINGS

Critical        2
High            5
Medium         13
Low             8

────────────────────

FE-017
Low pressure
ABC Manufacturing
Critical
Open

HR-009
Hose damaged
ABC Manufacturing
High
Open

FA-102
Battery weak
XYZ Mall
Medium
Open
```

A finding should have a lifecycle:

```text
Finding
   ↓
Recommendation
   ↓
Quotation
   ↓
Repair
   ↓
Reinspection
   ↓
Closed
```

This also creates a future connection to quotation and commercial workflows.

---

# 9. Project / Client Architecture

Recommended structure:

```text
Company
│
├── Clients
│
│   ├── Client A
│   │
│   │   ├── Project / Premises 1
│   │   │
│   │   │   ├── Systems
│   │   │   ├── Equipment
│   │   │   ├── Maintenance
│   │   │   ├── Findings
│   │   │   ├── Reports
│   │   │   └── Documents
│   │   │
│   │   └── Project / Premises 2
│   │
│   └── Client B
```

This structure is more scalable than storing reports directly under a client because a client may operate many premises.

---

# 10. Equipment Register

Each fire protection asset should have a permanent digital identity.

Example:

```text
FE-001
ABC Manufacturing
Building A
Ground Floor
Production Area

Type:
Fire Extinguisher

Brand:
ABC

Model:
XYZ

Serial:
123456

Installed:
2024

Status:
ACTIVE

Last Maintenance:
02 Oct 2026

Next Maintenance:
02 Jan 2027

History:
────────────────
02 Oct 2026 PASS
02 Jul 2026 PASS
02 Apr 2026 ATTENTION
02 Jan 2026 PASS
```

The equipment register becomes the basis of a digital maintenance history.

---

# 11. QR Code Equipment Identification

Each equipment asset can have its own QR code.

Example:

```text
        ┌───────────┐
        │   QR CODE │
        └───────────┘

FE-001

ABC Manufacturing
Production Area
```

When scanned:

```text
Equipment History

Last Service
02 Jul 2026

Current Status
● Active

Previous Findings
None

[ START INSPECTION ]
```

QR-based asset identification reduces lookup time and improves traceability.

---

# 12. Automatic Report Generation

After the technician submits the maintenance job:

```text
MAINTENANCE COMPLETED
        ↓
SYSTEM VALIDATES
        ↓
REPORT GENERATED
```

The system should generate a professional PDF report automatically.

Example:

# FIRE PROTECTION SYSTEM
## MAINTENANCE REPORT

**Client**

ABC Manufacturing Sdn Bhd

**Premises**

ABC Manufacturing Plant

**Maintenance Date**

02 October 2026

**Technician**

Ahmad Rahman

---

## Executive Summary

| System | Inspected | Pass | Attention | Failed |
|---|---:|---:|---:|---:|
| Extinguishers | 32 | 30 | 2 | 0 |
| Hose Reels | 8 | 7 | 1 | 0 |
| Fire Alarm | 1 | 1 | 0 | 0 |
| Emergency Lights | 42 | 40 | 2 | 0 |

### Overall Status

**Maintenance completed**

**5 observations requiring attention**

The report should then include:

- detailed inspection results
- findings
- recommendations
- photographs
- technician acknowledgement
- client acknowledgement
- next maintenance information

The report is one of the primary outputs customers pay for.

---

# 13. Client Portal

Clients should not need to rely only on downloadable PDFs.

Example:

```text
ABC MANUFACTURING
Fire Maintenance Portal

────────────────────

SYSTEM STATUS

🟢 92% Operational

Last Maintenance
02 Oct 2026

Next Maintenance
02 Jan 2027

────────────────────

OPEN FINDINGS

5

Critical     0
High         1
Medium       3
Low          1

────────────────────

RECENT REPORTS

October 2026
September 2026
July 2026

[ VIEW REPORT ]

────────────────────

EQUIPMENT

83 Assets

83 Active
0 Critical
5 Attention
```

A client portal strengthens the relationship between the maintenance contractor and the customer.

---

# 14. Management Dashboard

The dashboard should answer:

> **What needs my attention?**

Example:

## Today

```text
TODAY

Jobs
12

Completed
7

In Progress
3

Overdue
2
```

## Findings

```text
OPEN FINDINGS

Critical       2
High           8
Medium        21
Low           14
```

## Maintenance

```text
THIS MONTH

Scheduled       124
Completed       109
Pending          15
Overdue           4
```

## Clients

```text
ACTIVE CLIENTS       47
ACTIVE PROJECTS      82
ACTIVE ASSETS     3,842
```

The dashboard should be operational, not merely decorative.

---

# 15. Maintenance Calendar

FireMaint should include a calendar view.

Example:

```text
October 2026

Mon Tue Wed Thu Fri Sat Sun
          1   2   3   4
          8   9  10  11

02 ABC Manufacturing
03 XYZ Mall
05 Hotel ABC
06 Factory DEF
```

Maintenance frequency options:

```text
Monthly
Quarterly
Half-yearly
Annual
Custom
```

---

# 16. Maintenance Scheduler

Example maintenance contract:

```text
ABC Manufacturing

Service:
Fire Protection Maintenance

Frequency:
Quarterly

Next Visit:
02 Jan 2027

Assigned Team:
Team Alpha

Technician:
Ahmad

Status:
Scheduled
```

Once a maintenance visit is completed, FireMaint can automatically prepare the next scheduled job.

---

# 17. Notifications

Potential notifications:

## Office

> Maintenance at ABC Manufacturing is due in 7 days.

## Technician

> You have 3 maintenance jobs tomorrow.

## Client

> Your October Fire Maintenance Report is ready.

## Management

> 4 maintenance jobs are overdue.

Notifications help move FireMaint from a report generator into a daily operations tool.

---

# 18. Configurable Report Templates

Different fire contractors may use different report formats.

FireMaint should therefore provide a configurable report-template manager.

Example:

```text
Report Template Manager

Template:
Standard Fire Maintenance

Sections:
☑ Company Information
☑ Client Information
☑ Equipment Summary
☑ Inspection Results
☑ Findings
☑ Photos
☑ Recommendations
☑ Technician
☑ Client Acknowledgement
☑ Terms & Conditions
```

Future capability:

```text
[ CREATE TEMPLATE ]
```

---

# 19. Company Branding

Each contractor should be able to configure:

```text
COMPANY LOGO

Company name
Address
Phone
Email
Website
Registration details
Technician details

CUSTOM FOOTER
```

This enables FireMaint to function as the contractor's own professional reporting platform.

---

# 20. User Roles

Recommended roles:

## Owner / Admin

Full access.

## Supervisor

Jobs, technicians, reports and findings.

## Technician

Assigned jobs only.

## Client

Own projects and reports only.

## Viewer

Read-only access where required.

---

# 21. Commercial Workflow — Future Phase

Findings can later connect into a quotation workflow.

Example:

```text
Fire Extinguisher FE-017

Problem:
Low pressure

Recommendation:
Recharge / service

[ CREATE QUOTATION ]
```

Potential future workflow:

```text
FireMaint
    ↓
Finding
    ↓
Quotation
    ↓
Client Approval
    ↓
Work Order
    ↓
FireMaint
    ↓
Repair Completed
    ↓
Finding Closed
```

This can later integrate with BizKick or another commercial system.

---

# 22. Recommended Technical Architecture

The platform should remain inexpensive to operate while still being scalable.

## Frontend

**Next.js + TypeScript**

One responsive codebase for:

- management dashboard
- client portal
- technician PWA

## UI

- Tailwind CSS
- shadcn/ui or equivalent component system
- responsive layout
- mobile-first technician screens

## Backend

**Supabase**

Use:

- PostgreSQL
- Authentication
- Storage
- Row Level Security
- Realtime where valuable
- Edge/server functions where required

## PWA

Technician access example:

```text
firemaint.com/app
```

A PWA avoids the cost and complexity of maintaining separate Android and iOS applications during V1.

---

# 23. Offline-First Technician Workflow

Offline support is important because technicians may work in:

- basements
- plant rooms
- rooftops
- car parks
- remote buildings
- areas with unreliable mobile coverage

Recommended model:

```text
ONLINE
   ↓
Download Job
   ↓
LOCAL DEVICE
   ↓
Technician Works
   ↓
Photos Stored Locally
   ↓
Inspection Stored Locally
   ↓
NETWORK AVAILABLE
   ↓
SYNC
   ↓
SERVER
```

A completed inspection must not be lost because of weak connectivity.

---

# 24. Initial Data Model

Recommended core entities:

```text
organisations
users
roles

clients
sites
buildings

contracts
maintenance_plans
maintenance_jobs

technicians

systems
equipment_types
equipment

inspection_templates
inspection_template_items

inspections
inspection_results

findings
finding_photos
recommendations

reports
report_templates

documents
photos

notifications
audit_logs
```

Primary relationship:

```text
CLIENT
  │
  └── SITE
       │
       └── BUILDING
            │
            └── SYSTEM
                 │
                 └── EQUIPMENT
                      │
                      └── INSPECTION
                           │
                           ├── RESULT
                           ├── PHOTO
                           └── FINDING
```

---

# 25. Core Design Principle

## Capture Once → Reuse Everywhere

Example:

A technician records:

> FE-017 — low pressure.

That information should automatically appear in:

- technician job record
- equipment history
- finding register
- maintenance summary
- client portal
- PDF report
- dashboard
- future quotation
- repair history

The user should not be asked to enter the same information twice.

---

# 26. AI Strategy

AI should not be the primary V1 feature.

The platform should first capture high-quality structured data.

AI can then assist later.

## AI Report Assistant

Technician note:

> hose reel cabinet rusty and door difficult to open

Possible AI-assisted output:

**Finding:** Hose reel cabinet corrosion  
**Severity:** Attention  
**Recommendation:** Repair or replace cabinet and ensure unobstructed access.

The technician or supervisor should confirm the output.

## AI Photo Assistance

Future workflow:

```text
Photo
 ↓
AI
 ↓
Possible defect:
Corrosion detected
 ↓
Technician confirms
```

AI should assist rather than automatically certify safety or compliance.

---

# 27. Product Roadmap

## V1 — Report Engine

Minimum sellable product:

```text
Clients
Projects / Sites
Equipment
Technicians
Maintenance Jobs
Inspection
Photos
Findings
PDF Reports
```

Goal:

> **Replace paper, WhatsApp and Excel reporting.**

---

## V2 — Maintenance Management

Add:

```text
Recurring schedules
Calendar
Asset history
QR codes
Notifications
Client portal
Dashboard
```

Goal:

> **Manage the maintenance operation.**

---

## V3 — Commercial Workflow

Add:

```text
Quotation
Repair jobs
Parts
Work orders
Invoices
Payment
```

Potential integration:

```text
FireMaint → BizKick
```

---

## V4 — Intelligence

Add:

```text
AI report drafting
AI defect classification
Maintenance trend analysis
Predictive maintenance
Natural-language search
AI management assistant
```

---

# 28. Product Positioning

Do not position FireMaint as:

> A digital maintenance reporting form.

That is too narrow and too easy to replicate.

Position it as:

> **A complete digital fire maintenance record and reporting platform for fire protection service companies.**

Value by user:

## Technician

Fast mobile inspection.

## Supervisor

Control maintenance work.

## Management

Operational visibility.

## Client

Professional digital maintenance records.

## Company Owner

Recurring maintenance management, asset history and future service opportunities.

---

# 29. Indicative Pricing Model

Potential subscription structure:

| Plan | Target | Indicative Price |
|---|---|---:|
| Starter | Small contractor | RM99–149/month |
| Professional | Growing contractor | RM249–399/month |
| Business | Multiple teams | RM599–999/month |
| Enterprise | Large contractor | Custom |

Potential onboarding/setup:

**RM500–RM2,000**

depending on configuration, data migration and report-template requirements.

Actual commercial pricing should ultimately be validated through real customer testing.

---

# 30. Revenue Model

Potential revenue layers:

```text
                 FIREMAINT
                     │
        ┌────────────┼────────────┐
        │            │            │
   SUBSCRIPTION   SETUP        ADD-ONS
        │            │            │
     Monthly     Templates    Extra storage
                  Migration   Client portal
                  Branding    AI
                              Integrations
```

Future ecosystem possibilities:

```text
FireMaint
    │
    ├── BizKick
    │     └── Quotations
    │
    ├── vFirm
    │     └── Finance / Admin / Operations
    │
    └── WorkLedger
          └── Universal work records
```

FireMaint should nevertheless remain independently sellable.

---

# 31. Product DNA

FireMaint can be summarised through eight product actions:

## Capture

Technician records work.

## Verify

Supervisor reviews.

## Document

The system generates an evidence-backed report.

## Track

Every asset retains its maintenance history.

## Schedule

The next maintenance visit is planned.

## Resolve

Findings become actionable work.

## Report

The client receives professional documentation.

## Learn

Management sees recurring problems and maintenance trends.

---

# 32. MVP Screen Map

## Technician PWA

```text
/login

/dashboard
/jobs
/jobs/:id
/jobs/:id/equipment
/equipment/:id
/equipment/:id/inspect
/inspection/:id
/findings
/sync
/profile
```

## Web Platform

```text
/dashboard

/clients
/clients/:id

/sites
/sites/:id

/equipment
/equipment/:id

/contracts
/maintenance
/calendar

/jobs
/jobs/:id

/findings
/findings/:id

/reports
/reports/:id

/report-templates

/technicians
/users

/settings
```

---

# 33. Scope Discipline

FireMaint should not become a giant ERP during its first release.

Avoid building these in V1:

- accounting
- payroll
- HR
- inventory ERP
- complex CRM
- AI marketplace
- many integrations

The initial product loop should remain:

```text
Scheduled Maintenance
        ↓
Technician Inspection
        ↓
Evidence
        ↓
Findings
        ↓
Report
        ↓
Client
        ↓
Next Maintenance
```

If this loop is excellent, FireMaint is already commercially useful.

---

# 34. Recommended Positioning Statement

## FireMaint

### Digital Fire Maintenance & Reporting

**Inspect. Record. Report. Track.**

Central product promise:

> **From technician inspection to client-ready report — automatically.**

---

# 35. Long-Term Expansion

The underlying FireMaint model can later support additional maintenance verticals:

```text
Maintenance Platform
        │
        ├── Fire Protection
        ├── HVAC / Air Conditioning
        ├── Electrical
        ├── Plumbing
        ├── Lift Maintenance
        ├── M&E
        └── Building Maintenance
```

The reusable core remains:

```text
Client
Site
Asset
Schedule
Job
Checklist
Inspection
Evidence
Finding
Report
```

Only the domain-specific equipment types, templates, rules and reports need to change.

This keeps FireMaint focused enough to sell initially while preserving a path toward a broader maintenance platform.

---

# 36. Summary

FireMaint should be developed as a focused operational SaaS platform with a simple central workflow:

```text
TECHNICIAN
    ↓
INSPECTION
    ↓
STRUCTURED DATA
    ↓
EVIDENCE
    ↓
FINDINGS
    ↓
REPORT
    ↓
CLIENT
    ↓
MAINTENANCE HISTORY
```

The differentiator is not merely a digital checklist.

The differentiator is that **one technician capture becomes the permanent maintenance record, client report, management information and future commercial opportunity.**

---

## FireMaint Product Principle

> **Technician works.  
> FireMaint records.  
> Report writes itself.  
> Management sees everything.  
> Client gets the evidence.**
