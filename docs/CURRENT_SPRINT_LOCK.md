# FireMaint Current Sprint Lock

## Bismillah

This document freezes the current development direction so the project does not drift between polish, cleanup, and feature expansion.

## Current State

The online golden path is now usable in the application:

1. Owner creates clients, sites, buildings, systems, and equipment.
2. Owner creates maintenance jobs and assigns a technician.
3. Technician starts work, completes assigned checklists, captures findings, and submits the job.
4. Management starts review, generates a report shell, reviews it, and issues it.
5. Client logs in and views issued reports with field evidence and checklist evidence.

The recent UI cleanup pass is considered complete enough for the current golden path. Further UI polish should be driven by a specific workflow defect, not general cleanup.

## Why The Next Sprint Is Report Engine + PDF / Downloadable Report Output

The formal golden path in `FireMaint_V1_Golden_Path_E2E_RLS_UAT_Pack.md` ends with:

```text
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

The current product reaches `Open Report`, but it does not yet provide a formal downloadable report artifact.

For a fire maintenance platform, the report is the primary customer-facing proof record. In-browser viewing is useful, but it is not enough for handover, audit, filing, client sharing, or compliance workflows.

Therefore the next locked sprint is:

```text
JSON-driven report generation engine + PDF / downloadable report output
```

## Sprint Objective

Create a report generation engine that can render a standard issued maintenance report now, while leaving room for custom report formats later. The first downloadable artifact must reflect the same evidence visible in the issued report detail page.

The engine follows the WorkLedger-style separation:

1. report data assembler
2. JSON layout definition
3. renderer/download output

## In Scope

1. Define the JSON report layout contract.
2. Add a standard maintenance report layout.
3. Define the report data contract used by the downloadable output.
4. Assemble report data from the issued report, job, client, site, findings, assigned assets, inspections, and checklist results.
5. Add a renderer that uses the JSON layout rather than hardcoded page structure.
6. Add a server-side download route or action for issued reports.
7. Generate a printable/downloadable report output.
8. Add client portal and management report-detail entry points for the download.
9. Keep RLS and role access intact:
   - management can download organisation reports it can already view
   - client users can download only their own issued reports
10. Verify the issued-report download path against existing demo data.

## Out Of Scope For This Sprint

1. Full branded design system for report templates.
2. Persistent client-custom report templates.
3. Photo upload evidence.
4. Offline-first sync.
5. AI report writing.
6. Email delivery.
7. Public share links.

These remain valid future capabilities, but they should not enter this sprint unless the PDF path requires a small enabling change.

## Acceptance Criteria

The sprint is complete when:

1. Management can open an issued report and download the report output.
2. Client A can open an issued report and download the report output.
3. Client B cannot download Client A reports.
4. The output is generated through a JSON report layout definition.
5. Downloaded output includes:
   - report number
   - title
   - client
   - site
   - job number
   - scheduled date
   - issued date
   - field findings
   - checklist evidence
6. Existing checks pass:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `git diff --check`
   - `npm run build`
7. Any database/RLS change, if required, is covered by a migration and RLS test update.

## Recommended Implementation Order

1. Inspect WorkLedger's JSON template/layout/report-rendering approach.
2. Add FireMaint's JSON layout contract and standard maintenance report layout.
3. Inspect current report detail data loading and reuse it as the first report data assembler.
4. Add a minimal renderer that turns report data + layout into printable report HTML.
5. Add a minimal server route for issued report download.
6. Generate a simple formal HTML or PDF artifact from the assembled data.
7. Wire `Download` buttons into management and client report detail pages.
8. Verify owner/client access boundaries.
9. Improve report layout only after the access and data path works.

## Decision

The UI polish/consolidation pass is now closed.

The next big sprint move is locked as:

```text
JSON-driven report generation engine + PDF / downloadable report output
```

