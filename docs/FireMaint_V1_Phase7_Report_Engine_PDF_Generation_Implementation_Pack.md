# FireMaint V1 — Phase 7 Report Engine & PDF Generation Implementation Pack

## Bismillah.

Phase 7 turns synchronized maintenance data into the primary customer-facing output:

```text
SUBMITTED JOB
    ↓
REPORT ASSEMBLER
    ↓
MaintenanceReportData
    ↓
PDF RENDERER
    ↓
PRIVATE STORAGE
    ↓
REPORT RECORD
```

# 1. Objective

Implement:

1. Report data assembler
2. MaintenanceReportData contract
3. Server-side report-number generation
4. Branded PDF renderer
5. Photo evidence layout
6. Report persistence
7. Private PDF storage
8. Report status lifecycle
9. Regeneration rules
10. Tests and Phase 8 handoff

# 2. Non-Goals

Do not implement yet:

- supervisor issuance workflow
- client portal access
- dashboard KPIs
- quotation workflow
- AI report writing

# 3. Report Status

```text
DRAFT
GENERATED
REVIEWED
ISSUED
VOID
```

Phase 7 creates:

```text
DRAFT → GENERATED
```

Phase 8 handles review/issuance.

# 4. Report Data Contract

```typescript
type MaintenanceReportData = {
  organisation: {
    id: string;
    name: string;
    legalName?: string;
    registrationNo?: string;
    phone?: string;
    email?: string;
    address?: string;
    logoUrl?: string;
  };

  client: {
    id: string;
    name: string;
    registrationNo?: string;
  };

  site: {
    id: string;
    name: string;
    address?: string;
  };

  job: {
    id: string;
    jobNumber: string;
    scheduledDate: string;
    completedAt?: string;
  };

  technician: {
    id: string;
    fullName: string;
  };

  summary: {
    totalAssets: number;
    completedAssets: number;
    skippedAssets: number;
    passCount: number;
    attentionCount: number;
    failCount: number;
    findingCount: number;
  };

  equipment: EquipmentReportRow[];
  inspections: InspectionReportRow[];
  findings: FindingReportRow[];
  photos: ReportPhoto[];
  nextMaintenanceDate?: string;
};
```

# 5. Assembler Rule

The PDF renderer must not query the database directly.

Correct flow:

```text
Supabase
 ↓
report assembler
 ↓
validated structured object
 ↓
renderer
```

This keeps rendering deterministic and testable.

# 6. Report Number

Generate server-side.

Example:

```text
FM-2026-000001
```

Production requirement:

- concurrency-safe
- unique per organisation
- preferably backed by a report counter/sequence table
- never use `max()+1` without locking

# 7. PDF Sections

V1 report:

1. Cover
2. Organisation details
3. Client details
4. Site details
5. Maintenance summary
6. Equipment summary
7. Inspection results
8. Findings
9. Recommendations
10. Photo evidence
11. Technician declaration
12. Client acknowledgement
13. Next maintenance
14. Appendix

# 8. Cover

```text
FIRE MAINTENANCE REPORT

Report No:
FM-2026-000001

Client:
ABC Manufacturing Sdn Bhd

Site:
ABC Manufacturing Main Plant

Maintenance Date:
02 October 2026

Technician:
Ahmad Rahman
```

# 9. Summary Table

Example:

| System | Inspected | Pass | Attention | Failed |
|---|---:|---:|---:|---:|
| Extinguishers | 32 | 30 | 2 | 0 |
| Hose Reels | 8 | 7 | 1 | 0 |
| Fire Alarm | 1 | 1 | 0 | 0 |
| Emergency Lights | 42 | 40 | 2 | 0 |

# 10. Findings Section

For every finding:

```text
Asset
Location
Severity
Finding
Recommendation
Photo reference
```

# 11. Photo Layout

Requirements:

- preserve readability
- include caption
- include asset code
- include finding reference where applicable
- paginate cleanly
- avoid oversized originals

# 12. Report Storage

Bucket:

```text
report-pdfs
```

Path:

```text
/{organisation_id}/reports/{year}/{report_id}.pdf
```

Private bucket only.

Use signed URLs for access.

# 13. Report Persistence

Store:

```text
report_number
job_id
status
generated_at
pdf_path
report_data
generated_by
```

`report_data` is useful for reproducibility/audit, but the relational database remains authoritative.

# 14. Immutability

Once:

```text
ISSUED
```

do not silently regenerate/overwrite.

Correction flow:

```text
ISSUED
 ↓
VOID
 ↓
New corrected report
```

Phase 8 implements controlled VOID.

# 15. Regeneration

Allowed while:

```text
DRAFT
GENERATED
REVIEWED
```

Not allowed after ISSUED except through controlled correction process.

# 16. Server Operations

Recommended:

```text
assembleMaintenanceReport(jobId)
generateReportNumber()
renderMaintenancePdf(reportData)
storeReportPdf()
generateMaintenanceReport(jobId)
```

# 17. Tests

Unit:

- report assembler
- report summary aggregation
- report-number generator
- renderer snapshot/content checks
- pagination helpers

Integration:

- submitted job → report data
- report data → PDF
- PDF → private storage
- report row created

# 18. Acceptance Criteria

```text
[ ] submitted job assembles correctly
[ ] report number unique/concurrency-safe
[ ] PDF renders without DB queries
[ ] company branding appears
[ ] summary accurate
[ ] equipment results included
[ ] findings included
[ ] photos included
[ ] PDF stored privately
[ ] report record created
[ ] regeneration works before issuance
[ ] issued report cannot be silently overwritten
[ ] lint/typecheck/tests/build pass
```

# 19. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 7 ONLY.

Confirm Phases 0–6 pass.

OBJECTIVE:
Submitted Job → Report Assembler → MaintenanceReportData → PDF → Storage → Report Record

DO NOT:
- build supervisor issuance
- build client portal
- build dashboard KPIs

REPORT ASSEMBLER:
Build one structured MaintenanceReportData object.
Do not let renderer query database.

NUMBERING:
Use concurrency-safe server-side numbering.
Do not use naive max()+1.

PDF:
Render:
cover
company/client/site
maintenance summary
equipment summary
inspection results
findings
recommendations
photos
technician declaration
client acknowledgement
next maintenance

STORAGE:
Private report-pdfs bucket.
Tenant-scoped paths.

IMMUTABILITY:
Never overwrite ISSUED report.

TEST:
unit
integration
PDF generation
storage
build

STOP:
Do not begin Phase 8.

END WITH:
IMPLEMENTATION SUMMARY
Ready for Phase 8: YES/NO
```

## Phase 7 Principle

> **Reports are outputs of structured maintenance evidence, not the primary data store.**
