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

## Why The Next Sprint Is PDF / Downloadable Report Output

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
PDF / downloadable report output
```

## Sprint Objective

Create a downloadable issued maintenance report artifact that reflects the same evidence visible in the issued report detail page.

## In Scope

1. Define the report data contract used by the downloadable output.
2. Assemble report data from the issued report, job, client, site, findings, assigned assets, inspections, and checklist results.
3. Add a server-side download route or action for issued reports.
4. Generate a printable/downloadable report output.
5. Add client portal and management report-detail entry points for the download.
6. Keep RLS and role access intact:
   - management can download organisation reports it can already view
   - client users can download only their own issued reports
7. Verify the issued-report download path against existing demo data.

## Out Of Scope For This Sprint

1. Full branded design system for report templates.
2. Multiple client-custom report templates.
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
4. Downloaded output includes:
   - report number
   - title
   - client
   - site
   - job number
   - scheduled date
   - issued date
   - field findings
   - checklist evidence
5. Existing checks pass:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `git diff --check`
   - `npm run build`
6. Any database/RLS change, if required, is covered by a migration and RLS test update.

## Recommended Implementation Order

1. Inspect current report detail data loading and reuse it as the first report data assembler.
2. Add a minimal server route for issued report download.
3. Generate a simple formal HTML or PDF artifact from the assembled data.
4. Wire `Download` buttons into management and client report detail pages.
5. Verify owner/client access boundaries.
6. Improve report layout only after the access and data path works.

## Decision

The UI polish/consolidation pass is now closed.

The next big sprint move is locked as:

```text
PDF / downloadable report output
```

