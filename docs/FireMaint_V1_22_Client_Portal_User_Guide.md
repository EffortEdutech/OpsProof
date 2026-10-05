# FireMaint V1 — Client Portal User Guide

## Bismillah.

The client portal provides read-only access to issued maintenance evidence.

# What Clients Can Do

- view dashboard
- view issued reports
- download report PDFs
- view equipment
- view findings
- view maintenance history where available

# What Clients Cannot Do

- edit maintenance results
- edit findings
- issue reports
- view another client
- view internal technician notes unless configured

# Main Routes

```text
/client/dashboard
/client/reports
/client/reports/[id]
/client/equipment
/client/equipment/[id]
/client/findings
```

# Report Guidance

Only `ISSUED` reports represent current formal output.

If a report is VOID, contact the maintenance provider for the corrected report.

# Security Guidance

- use personal login
- do not share passwords
- sign out on shared computers
- report suspected unauthorized access

## Principle

> **The portal is a trusted window into maintenance evidence, not an editing workspace.**
