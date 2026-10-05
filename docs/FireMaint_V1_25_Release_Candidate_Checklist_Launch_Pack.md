# FireMaint V1 — Release Candidate Checklist & Launch Pack

## Bismillah.

Artifact #25 is the final commercial launch gate.

# Release Candidate Inputs

Must be complete:

- Stage A architecture
- Stage B domain build
- Stage C customer/output
- Stage D production readiness
- Stage E commercial material

# RC Checklist

## Product
- [ ] Core workflow complete
- [ ] Offline works
- [ ] Reports correct
- [ ] Client portal correct
- [ ] Dashboard correct

## Security
- [ ] RLS passes
- [ ] Tenant isolation passes
- [ ] Storage private
- [ ] No secret leakage

## Quality
- [ ] Golden path E2E PASS
- [ ] Offline E2E PASS
- [ ] UAT GO
- [ ] Production build PASS

## Operations
- [ ] Backup confirmed
- [ ] Restore procedure known
- [ ] Rollback target known
- [ ] Monitoring active
- [ ] Support runbook ready

## Commercial
- [ ] Pricing approved
- [ ] Demo tenant ready
- [ ] Onboarding checklist ready
- [ ] Import templates ready
- [ ] User guides ready
- [ ] Client guide ready

# Launch Sequence

```text
RC Freeze
 ↓
Final UAT
 ↓
GO Decision
 ↓
Production Deploy
 ↓
Smoke Test
 ↓
Pilot Customer
 ↓
Monitor Closely
 ↓
General Availability
```

# Pilot Launch

Recommended first release:
- 1–3 friendly customers
- limited equipment volume
- active support
- daily issue review
- no major custom development

# Launch Metrics

Track:
- jobs completed
- sync failures
- report generation failures
- average report turnaround
- open critical findings
- support tickets
- customer onboarding time

# Release Notes Template

```text
FireMaint V1.0

Highlights:
- Client/site/equipment register
- QR equipment identity
- Maintenance planning/jobs
- Offline technician inspections
- Findings/photo evidence
- PDF reports
- Supervisor review
- Client portal
- Dashboard/calendar

Known limitations:
...

Support:
...
```

# GO / NO-GO

GO only when:

```text
No Blocker
No Critical
Security PASS
Offline PASS
Report PASS
UAT GO
Backup Ready
Support Ready
```

## Principle

> **Launch is a controlled transition from tested product to supported customer use.**
