# FireMaint V1 — Phase 2 Systems, Equipment Register & QR Vertical Slice Implementation Pack

## Bismillah.

Phase 2 attaches the asset hierarchy to the Client → Site → Building foundation created in Phase 1.

```text
ORGANISATION
   ↓
CLIENT
   ↓
SITE
   ↓
BUILDING
   ↓
SYSTEM
   ↓
EQUIPMENT TYPE
   ↓
EQUIPMENT
   ↓
QR IDENTITY
```

The objective is to create a permanent digital identity for each maintainable asset.

# 1. Objective

Implement:

1. Systems
2. Equipment Types
3. Equipment Register
4. Equipment Detail
5. Equipment Edit / Status
6. Opaque QR Identity
7. Secure QR Lookup
8. Equipment History Foundation
9. RLS / Cross-Tenant Tests
10. Phase 3 Handoff

# 2. Non-Goals

Do not implement yet:

- maintenance plans
- maintenance jobs
- inspection templates
- inspections
- findings
- PDF reports
- offline sync

# 3. Hierarchy

```text
Client
  ↓
Site
  ↓
Building
  ↓
System
  ↓
Equipment
```

Equipment Types are reusable classification/reference records attached to Equipment.

# 4. System Model

Fields:

```text
building_id *
name *
system_type *
code
description
active
```

Initial types:

```text
FIRE_ALARM
FIRE_EXTINGUISHING
HOSE_REEL
SPRINKLER
EMERGENCY_LIGHTING
EXIT_SIGNAGE
OTHER
```

# 5. Equipment Type Model

Examples:

```text
Dry Powder Fire Extinguisher
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

Support:

- global reference types
- organisation-specific custom types

Tenants must not mutate global reference types.

# 6. Equipment Model

Fields:

```text
building_id *
system_id
equipment_type_id *
asset_code *
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
metadata
```

# 7. Equipment Status

```text
ACTIVE
OUT_OF_SERVICE
RETIRED
```

Never hard-delete operational assets.

# 8. Asset Code

Unique per organisation.

Examples:

```text
FE-001
FE-002
HR-001
FA-001
EL-001
```

# 9. QR Identity

Each asset gets an opaque token.

Rules:

- random
- non-sequential
- does not expose database UUID
- does not use asset code or serial number as secret identity
- may be rotated later

Public-safe route:

```text
/equipment/scan/{token}
```

# 10. Secure QR Flow

```text
SCAN QR
  ↓
Resolve token
  ↓
Authenticate
  ↓
RLS / access check
  ↓
Show equipment
```

A QR token is not authorization.

# 11. Equipment Detail

Recommended:

```text
FE-001

Status
ACTIVE

Type
9kg Dry Powder Fire Extinguisher

Client
ABC Manufacturing

Site
ABC Main Plant

Building
Building A

System
Fire Extinguishing

Location
Production Area

Serial
XXXX

Brand
ABC

Model
DP-9

Capacity
9kg

QR
[ VIEW / PRINT ]

----------------------------

Maintenance History

No history yet.
Inspection history begins in later phases.
```

# 12. Equipment List

Columns:

```text
Asset Code
Equipment Type
Client
Site
Building
System
Location
Status
Last Inspection
Next Inspection
```

Filters:

```text
Search
Client
Site
Building
Equipment Type
Status
```

# 13. Routes

```text
/systems
/systems/new
/systems/[id]

/equipment-types

/equipment
/equipment/new
/equipment/[id]
/equipment/[id]/edit

/equipment/scan/[token]
```

# 14. Data Access

Use:

```text
features/systems/queries.ts
features/systems/actions.ts

features/equipment-types/queries.ts
features/equipment-types/actions.ts

features/equipment/queries.ts
features/equipment/actions.ts
```

Keep Supabase queries out of scattered UI components.

# 15. Cross-Entity Validation

Before creating System:

```text
building belongs to current organisation
```

Before creating Equipment:

```text
building belongs to current organisation
system belongs to selected building/current organisation
equipment type is global reference OR current organisation
```

Foreign keys alone are not tenant validation.

# 16. QR Token Generation

Use cryptographically random server-side generation.

Do not use:

```text
equipment.id
asset_code
serial number
incrementing integer
```

# 17. Equipment History Foundation

Phase 2 establishes only the history container.

Future data will come from:

```text
maintenance_jobs
inspections
findings
reports
```

Show a real empty state rather than fake history.

# 18. Permissions

Management write access:

```text
OWNER
ADMIN
SUPERVISOR
```

Technician/client write access to this management module: denied.

RLS remains authoritative.

# 19. Soft Lifecycle

Equipment uses status transitions.

Systems and custom equipment types use `active=false`.

# 20. QR Print Contract

```text
FireMaint
Asset: FE-001
Type: Fire Extinguisher
Scan: /equipment/scan/{token}
```

Sticker design can be refined later.

# 21. Audit Events

If audit helper exists:

```text
SYSTEM_CREATED
SYSTEM_UPDATED
SYSTEM_DEACTIVATED

EQUIPMENT_TYPE_CREATED
EQUIPMENT_TYPE_UPDATED
EQUIPMENT_TYPE_DEACTIVATED

EQUIPMENT_CREATED
EQUIPMENT_UPDATED
EQUIPMENT_STATUS_CHANGED
QR_TOKEN_ROTATED
```

# 22. Tests

## Unit

- system schema
- equipment type schema
- equipment schema
- status enum
- QR token helper

## Integration

- create system
- create custom equipment type
- create equipment
- update equipment
- change status
- resolve QR
- deny invalid cross-entity relationships

## RLS

- Org A cannot read Org B equipment
- Org A cannot resolve Org B QR token
- Org A cannot create equipment under Org B building
- global equipment types readable but not tenant-mutable

## E2E

```text
Admin Login
 ↓
Open Building
 ↓
Create System
 ↓
Add Equipment
 ↓
View Equipment
 ↓
Open QR route
 ↓
Verify same equipment
```

# 23. Acceptance Criteria

```text
[ ] system CRUD lifecycle works
[ ] global equipment types visible
[ ] custom equipment type works
[ ] global type mutation blocked
[ ] equipment list works
[ ] equipment create works
[ ] equipment edit works
[ ] status lifecycle works
[ ] asset code uniqueness enforced
[ ] QR token opaque
[ ] QR lookup secure
[ ] equipment hierarchy displays correctly
[ ] equipment history foundation exists
[ ] cross-tenant equipment access denied
[ ] cross-tenant QR access denied
[ ] technician/client management writes denied
[ ] lint passes
[ ] typecheck passes
[ ] unit tests pass
[ ] integration tests pass
[ ] E2E passes
[ ] production build passes
```

# 24. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 2 ONLY.

FIRST:
Confirm Phase 0 and Phase 1 pass.

DO NOT:
- rebuild tenancy/auth
- duplicate existing migrations
- build maintenance
- build inspection templates
- build inspections
- build findings
- build reports
- introduce fake production data

OBJECTIVE:
Implement System → Equipment Type → Equipment → QR identity.

SYSTEMS:
- create
- view
- edit
- deactivate

EQUIPMENT TYPES:
- list global references
- create organisation-specific types
- deactivate organisation-specific types
- block tenant mutation of global references

EQUIPMENT:
- list
- create
- detail
- edit
- status lifecycle
- asset code uniqueness
- hierarchy display

QR:
- generate opaque non-sequential token
- secure lookup
- do not expose tenant data anonymously
- allow future token rotation

VALIDATION:
Validate building, system and equipment type relationships server-side.

SECURITY:
organisation_id comes only from authenticated profile.
Management writes only OWNER/ADMIN/SUPERVISOR.
RLS remains authoritative.

TEST:
unit
integration
RLS negative tests
QR access tests
E2E

VERIFY:
lint
typecheck
test
E2E
production build

STOP:
Do not begin Phase 3.

END WITH:
IMPLEMENTATION SUMMARY

Files changed:
Database changes:
Routes:
RLS:
Tests:
Build:
Known issues:
Ready for Phase 3: YES/NO
```

# 25. Phase 3 Handoff

Phase 3 adds:

```text
Equipment Type
      ↓
Inspection Template
      ↓
Template Version
      ↓
Template Items
```

Do not hard-code extinguisher inspection logic in React.

## Phase 2 Principle

> **Every maintainable asset gets one permanent digital identity before inspection logic begins.**
