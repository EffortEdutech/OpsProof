# FireMaint V1 — Post-V1 Roadmap & Integration Specification

## Bismillah.

Artifact #26 defines what happens **after FireMaint V1 is stable, commercially usable, and supported in production**.

This is not part of the V1 release gate.

Its purpose is to prevent future development from becoming random feature accumulation.

The rule is:

> **V1 stays focused on maintenance evidence, reporting, findings, client visibility, and operational control. Post-V1 expands only where it strengthens that core.**

---

# 1. Post-V1 Product Principle

FireMaint should grow from:

```text
Maintenance Evidence Platform
```

into:

```text
Fire Maintenance Operations Platform
```

without becoming a generic ERP.

The core domain remains:

```text
Asset
 ↓
Maintenance
 ↓
Inspection
 ↓
Evidence
 ↓
Finding
 ↓
Report
 ↓
History
```

Every future module should connect naturally to this chain.

---

# 2. Strategic Expansion Pillars

Post-V1 work is grouped into seven pillars:

1. Commercial workflow integration
2. Corrective-work lifecycle
3. Multi-vertical fire maintenance expansion
4. Advanced client experience
5. Analytics and intelligence
6. External system integrations
7. Enterprise controls

---

# 3. Priority Model

Every post-V1 initiative should be scored by:

```text
Customer Value
Revenue Impact
Operational Impact
Implementation Cost
Support Cost
Security Risk
Data Model Impact
Integration Complexity
```

Recommended score:

```text
Priority Score =
(Customer Value + Revenue Impact + Operational Impact)
-
(Implementation Cost + Support Cost + Security Risk + Complexity)
```

Use scoring as guidance, not as automatic decision-making.

---

# 4. Post-V1 Roadmap Tiers

## Tier 1 — Immediate Post-V1

Focus:
- corrective-work lifecycle
- quotation integration
- recurring finding visibility
- stronger notifications
- customer self-service improvements

## Tier 2 — Growth

Focus:
- integrations
- advanced analytics
- expanded equipment verticals
- bulk operations
- stronger reporting/configuration

## Tier 3 — Enterprise

Focus:
- SSO
- advanced audit
- regional controls
- custom data retention
- API/webhooks
- multi-branch operations

---

# 5. Immediate Post-V1 Candidate: Corrective Work Lifecycle

Current V1:

```text
Finding
 ↓
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

Post-V1 should add operational work around the finding:

```text
Finding
 ↓
Recommendation
 ↓
Quotation / Approval
 ↓
Corrective Work Order
 ↓
Repair
 ↓
Verification
 ↓
Closure
```

This is the most natural first expansion because it converts defects into follow-up revenue and measurable closure.

---

# 6. BizKick Integration

Future integration concept:

```text
FireMaint Finding
 ↓
Recommendation
 ↓
Create Quote Request
 ↓
BizKick Quotation
 ↓
Client Approval
 ↓
Work Order
 ↓
FireMaint Repair Visit
 ↓
Finding Resolved
```

FireMaint remains the maintenance evidence system.

BizKick remains the commercial quotation/workflow system.

Do not duplicate full quotation/invoicing logic inside FireMaint if BizKick owns it.

---

# 7. BizKick Integration Contract

Recommended integration entities:

```text
FireMaint Finding ID
FireMaint Organisation ID
Client ID
Site ID
Equipment ID
Finding Severity
Recommendation
Quotation ID
Quotation Status
Work Order ID
Approval Status
```

Minimum API actions:

```text
create quotation from finding
fetch quotation status
receive approval event
receive work-order event
link repair completion
```

---

# 8. Event Model

Recommended outbound events:

```text
finding.created
finding.updated
finding.resolved
job.completed
report.issued
equipment.created
equipment.retired
```

Recommended inbound events:

```text
quotation.created
quotation.approved
quotation.rejected
work_order.created
work_order.completed
```

Use stable IDs and timestamps.

---

# 9. Integration Idempotency

All integration messages should include:

```text
event_id
event_type
occurred_at
organisation_id
entity_id
schema_version
```

Consumers must handle duplicate delivery safely.

---

# 10. Webhooks

Post-V1 webhook infrastructure should support:

- signed webhook payloads
- delivery logs
- retries
- exponential backoff
- disabled endpoint handling
- replay
- secret rotation
- event filtering

Never make webhook delivery block the main FireMaint transaction.

---

# 11. WorkLedger / vFirm Integration

Potential future flow:

```text
FireMaint
 ↓
Completed Maintenance
 ↓
Service / Work Record
 ↓
WorkLedger / vFirm
 ↓
Accounting / Operations
```

Recommended boundary:

FireMaint sends:
- completed job
- client/site
- service date
- technician
- asset counts
- findings summary
- report reference

External operations/accounting system handles:
- invoicing
- accounting
- broader work management

---

# 12. Notification Expansion

V1 notifications are basic.

Post-V1 channels:

```text
Email
WhatsApp
Push
In-app
```

Notification events:

```text
job assigned
maintenance due
job overdue
critical finding
report ready
quotation approved
repair scheduled
finding closed
```

---

# 13. WhatsApp Integration

Recommended uses:

- maintenance reminder
- technician assignment
- report-ready notification
- critical finding alert
- client approval link

Do not send:
- sensitive internal notes
- private signed report URLs with excessive expiry
- passwords or credentials

---

# 14. Multi-Vertical Maintenance Expansion

FireMaint V1 starts with portable extinguishers and related fire-maintenance assets.

Future verticals may include:

```text
Fire Alarm
Hose Reel
Emergency Lighting
Exit Signage
Sprinkler
Hydrant
Fire Pump
Suppression Systems
Smoke Control
Fire Doors
```

Because V1 uses Equipment Type → Template → Dynamic Renderer, expansion should be primarily template/configuration-driven.

---

# 15. Vertical Expansion Rule

Before adding a new equipment vertical, define:

```text
equipment type
required metadata
inspection template
result logic
finding rules
photo requirements
report presentation
maintenance frequency norms
```

Do not add one-off React forms.

---

# 16. Advanced Equipment Metadata

Future equipment metadata can include:

```text
manufacturer
model family
rating
capacity
zone
loop
address
pressure range
battery type
certificate reference
installation contractor
commissioning date
warranty expiry
```

Use structured metadata only when it materially improves maintenance.

---

# 17. QR Expansion

Future QR capability:

- printable label batches
- QR replacement/rotation
- QR audit trail
- NFC support
- client-safe asset lookup
- technician quick-start workflow

Do not expose private tenant data through unauthenticated QR scan.

---

# 18. Asset Lifecycle

Post-V1 equipment lifecycle can expand to:

```text
ACTIVE
OUT_OF_SERVICE
UNDER_REPAIR
REPLACEMENT_REQUIRED
REPLACED
RETIRED
```

Track replacement links:

```text
old_equipment_id
replacement_equipment_id
reason
date
```

---

# 19. Recurring Finding Intelligence

Future capability:

```text
same asset
same finding category
multiple inspections
 ↓
recurring defect indicator
```

Useful outputs:

```text
repeat failure count
time since first occurrence
repeat severity
repair effectiveness
```

---

# 20. Advanced Dashboard

Post-V1 analytics can include:

```text
repeat findings
failure rate by equipment type
failure rate by client/site
technician productivity
maintenance completion rate
report turnaround time
finding closure time
repair conversion rate
```

---

# 21. Predictive Maintenance

Only after sufficient data quality exists.

Possible signals:

- repeat failures
- age
- environment
- maintenance frequency
- component history
- repair history

Do not market predictive capability before there is enough real data.

---

# 22. AI Roadmap

AI may assist with:

1. note cleanup
2. report narrative drafting
3. finding summary
4. recommendation drafting
5. recurring defect detection
6. natural-language dashboard queries
7. photo-assisted suggestions

---

# 23. AI Safety Boundary

AI must never automatically:

- certify compliance
- certify safety
- close critical findings
- issue reports
- change inspection results
- replace technician confirmation

Human confirmation remains required.

---

# 24. AI Note Cleanup

Example:

Technician input:

```text
hose cracked near nozzle
```

AI suggestion:

```text
Hose shows visible cracking near the nozzle connection.
```

Technician approves before saving final narrative.

---

# 25. AI Report Narrative

AI may draft:

```text
maintenance summary
finding summary
recommendation narrative
executive summary
```

Input must come from structured verified results.

The AI narrative is secondary to the underlying data.

---

# 26. AI Photo Assistance

Possible future:

```text
technician captures photo
 ↓
AI suggests:
"possible corrosion"
 ↓
technician accepts/rejects
```

AI must not decide safety/compliance autonomously.

---

# 27. Natural Language Analytics

Examples:

```text
"Show sites with more than 5 open high-severity findings."

"Which client has the most overdue maintenance?"

"Which extinguisher model fails most often?"
```

Responses should be backed by structured queries.

---

# 28. Client Portal Expansion

Possible future features:

- finding acknowledgement
- corrective-work approval
- maintenance schedule view
- asset export
- notification preferences
- user invitations
- branded portal
- SLA status

Keep write permissions narrowly controlled.

---

# 29. Client Acknowledgement

Future:

```text
Report Issued
 ↓
Client Opens
 ↓
Acknowledges
 ↓
Timestamp/User Recorded
```

Acknowledgement is not equivalent to technical approval.

---

# 30. Digital Signatures

Potential future:

- technician sign-off
- supervisor sign-off
- client acknowledgement signature

Need:
- timestamp
- user identity
- report hash/version
- audit trail

---

# 31. API Platform

Post-V1 API should be versioned:

```text
/api/v1/
```

Potential endpoints:

```text
clients
sites
equipment
jobs
findings
reports
```

Use:
- scoped API keys / OAuth
- tenant authorization
- rate limits
- audit logs

Never expose service-role credentials.

---

# 32. Public API Scope

Initial external API should likely be read-oriented:

```text
GET equipment
GET findings
GET reports
GET maintenance status
```

Write access should be added cautiously.

---

# 33. Integration Authentication

Preferred future models:

```text
OAuth 2.0
scoped API tokens
signed webhooks
```

Avoid shared static master keys.

---

# 34. Enterprise SSO

Future enterprise auth options:

```text
SAML
OIDC
Microsoft Entra ID
Google Workspace
```

Enterprise SSO should map into existing FireMaint roles, not bypass them.

---

# 35. Multi-Branch Organisations

Future hierarchy:

```text
Organisation
 ↓
Branch / Business Unit
 ↓
Users
 ↓
Clients / Sites
```

Only add this when real customers require it.

Do not prematurely complicate V1 tenancy.

---

# 36. Enterprise Permissions

Potential:

```text
Organisation Admin
Branch Admin
Supervisor
Technician
Read-Only Auditor
Client Admin
Client User
```

Avoid role explosion without concrete use cases.

---

# 37. Advanced Audit

Post-V1 audit can include:

- before/after JSON
- IP/device metadata
- export
- retention policy
- administrator review
- compliance evidence

---

# 38. Data Retention Policies

Future enterprise controls:

```text
inspection retention
photo retention
audit retention
report retention
local cache retention
```

Issued reports and maintenance evidence generally should not be casually deleted.

---

# 39. Data Export

Future export:

```text
CSV
Excel
PDF archive
JSON/API
```

Exports should respect tenant/client permissions.

---

# 40. Bulk Operations

Useful future capabilities:

- bulk equipment import
- bulk QR print
- bulk job creation
- bulk technician assignment
- bulk equipment status update
- bulk finding export

Every bulk operation needs validation and audit.

---

# 41. Advanced Scheduling

Potential:

- recurring automatic job generation
- technician capacity
- route planning
- service zones
- blackout dates
- holiday calendar
- workload balancing

Do not build dispatch optimization before basic scheduling volume justifies it.

---

# 42. Technician Productivity

Possible measures:

```text
jobs/day
assets/hour
first-time completion
finding rate
revisit rate
sync failure rate
```

Use responsibly.

Do not reduce technician performance to raw speed alone.

---

# 43. Inventory Integration

Potential later integration:

```text
Finding / Repair
 ↓
Required Part
 ↓
Inventory System
 ↓
Stock Reservation
```

FireMaint should not become full warehouse ERP unless product strategy changes.

---

# 44. Procurement / Replacement

Potential:

```text
REPLACEMENT_REQUIRED
 ↓
Quotation
 ↓
Approval
 ↓
Replacement Asset
 ↓
Old Asset RETIRED
```

Link old/new equipment for history.

---

# 45. Compliance Library

Possible future capability:

- internal inspection guidelines
- standard references
- template guidance
- customer-specific requirements

Be careful not to present FireMaint as legal certification authority.

---

# 46. Marketplace / Template Library

Potential:

```text
Reference Templates
Organisation Templates
Industry Packs
```

Templates need versioning and provenance.

---

# 47. Integration Architecture

Recommended:

```text
FireMaint Core
    ↓
Domain Events
    ↓
Integration Layer
    ↓
External Systems
```

Do not let external-system logic leak throughout core feature code.

---

# 48. Outbox Pattern

For reliable integrations, consider:

```text
Core transaction
 ↓
integration_outbox
 ↓
worker
 ↓
webhook/API
```

Benefits:

- retry
- audit
- no lost events
- main transaction not blocked

---

# 49. Integration Tables

Potential:

```text
integration_connections
integration_events
integration_deliveries
integration_outbox
external_entity_links
```

---

# 50. External Entity Link

Recommended contract:

```text
organisation_id
provider
local_entity_type
local_entity_id
external_entity_type
external_entity_id
created_at
```

This avoids stuffing third-party IDs into every core table.

---

# 51. Integration Failure Handling

Rules:

- preserve local FireMaint transaction
- retry external delivery
- surface persistent failures
- allow replay
- never duplicate external action on retry

---

# 52. Post-V1 Commercial Expansion

Possible add-ons:

```text
Advanced Client Portal
Custom Branding
API Access
Enterprise SSO
Advanced Analytics
WhatsApp Notifications
Quotation Integration
Priority Support
Custom Data Migration
```

Avoid dozens of micro-add-ons.

---

# 53. Multi-Tenant White Label

Possible later:

- custom logo/domain
- report branding
- portal branding

Full white-label application UI should only be built if revenue justifies support complexity.

---

# 54. Mobile Strategy

V1 remains PWA.

Consider native app only if:
- camera/file limitations materially block work
- offline/background capabilities are insufficient
- enterprise device controls require native
- customer demand is demonstrated

Do not build native app only for perceived prestige.

---

# 55. Data Warehouse / BI

At scale:

```text
Operational Postgres
 ↓
analytics pipeline
 ↓
warehouse / BI
```

Do not run heavy enterprise BI directly against production OLTP if it harms operations.

---

# 56. Search

Future global search:

```text
asset code
serial
client
site
job number
report number
finding
```

Full-text or indexed search can be added when dataset size demands it.

---

# 57. Post-V1 Security Roadmap

Potential:

- SSO
- SCIM
- API token scopes
- session/device controls
- IP restrictions
- enhanced audit exports
- configurable data retention

---

# 58. Post-V1 Operations Roadmap

Potential:

- automated backup verification
- disaster-recovery drills
- error-budget monitoring
- synthetic checks
- tenant-level usage monitoring
- storage-growth forecasting

---

# 59. Suggested Sequencing

Recommended order after V1 launch:

## Wave 1 — Defect-to-Revenue

1. Finding corrective-work workflow
2. BizKick quotation integration
3. Client approval
4. Repair visit
5. Finding closure

## Wave 2 — Customer Expansion

6. Advanced portal
7. Notifications
8. Bulk operations
9. Expanded fire-system templates

## Wave 3 — Intelligence

10. recurring finding detection
11. advanced dashboards
12. AI-assisted notes/reports
13. natural-language analytics

## Wave 4 — Enterprise

14. API/webhooks
15. SSO
16. multi-branch
17. advanced audit
18. data retention controls

---

# 60. Post-V1 Gate

No post-V1 initiative begins unless:

```text
V1 stable in production
support load understood
real customer demand exists
data model impact reviewed
security impact reviewed
commercial value identified
```

---

# 61. Feature Request Decision Template

For every requested feature:

```text
Problem:
Customer:
Frequency:
Current workaround:
Revenue impact:
Operational impact:
Core-domain fit:
Data-model impact:
Security impact:
Support impact:
Estimated effort:
Recommended priority:
```

---

# 62. Integration Decision Template

```text
Integration:
Provider:
Customer demand:
Business objective:
Entities exchanged:
Source of truth:
Authentication:
Direction:
Events:
Retry:
Idempotency:
Data sensitivity:
Failure mode:
Support owner:
```

---

# 63. Source-of-Truth Rules

Recommended:

```text
FireMaint:
assets
maintenance jobs
inspections
findings
reports

BizKick:
quotation
commercial approval

Accounting/ERP:
invoice
payment
ledger
```

Avoid dual-master data.

---

# 64. V1 Scope Protection

The following remain out of V1 even though they appear in this roadmap:

- quotation engine
- invoicing
- accounting
- inventory ERP
- AI automation
- native app
- enterprise SSO
- public API
- predictive maintenance
- multi-branch hierarchy

This artifact must not be used to justify scope creep before V1 launch.

---

# 65. Recommended First Post-V1 Product Epic

## Epic: Finding → Quotation → Corrective Work

Why first:

- directly linked to maintenance defects
- visible customer value
- revenue opportunity
- natural client workflow
- closes the maintenance loop

Target outcome:

```text
Finding
 ↓
Quote
 ↓
Approval
 ↓
Repair
 ↓
Verification
 ↓
Closed
```

---

# 66. Success Metrics

Post-V1 metrics:

```text
finding closure rate
average closure time
quote conversion rate
repeat defect rate
report turnaround
maintenance completion rate
client portal engagement
support tickets per tenant
sync success rate
```

---

# 67. Roadmap Review Cadence

Recommended:

Monthly:
- customer feedback
- support patterns
- feature requests
- integration demand

Quarterly:
- roadmap reprioritization
- commercial results
- technical debt
- security roadmap
- data-quality review

---

# 68. Architecture Rule

Future development should preserve:

```text
Core Domain
   ↓
Stable Service Layer
   ↓
Events / API
   ↓
Integrations
```

Do not couple the core product directly to any one external vendor.

---

# 69. Final Post-V1 Position

FireMaint should evolve carefully from:

> **“Inspect. Record. Report. Track.”**

toward:

> **“Inspect. Resolve. Report. Improve.”**

without losing the original product promise:

> **From technician inspection to client-ready evidence — automatically.**
