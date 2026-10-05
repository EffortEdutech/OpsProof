# FireMaint V1 — Phase 1 Client, Site & Building Vertical Slice Implementation Pack

## Bismillah.

Phase 1 is the first real FireMaint domain slice.

It establishes the customer/site hierarchy used by every later module:

```text
ORGANISATION
    ↓
CLIENT
    ↓
CLIENT CONTACT
    ↓
SITE
    ↓
BUILDING
```

The goal is not simply CRUD.

The goal is to create a secure, reusable hierarchy that Equipment, Maintenance, Inspection, Findings and Reports can attach to later without redesign.

---

# 1. Phase 1 Objective

Implement production-ready management of:

1. Clients
2. Client Contacts
3. Sites
4. Buildings

The slice must include:

- server-side reads
- server-side mutations
- validation
- tenant isolation
- role checks
- create/view/edit/inactivate flows
- empty/error/loading states
- integration tests
- RLS verification
- E2E golden slice

---

# 2. Phase 1 Non-Goals

Do NOT implement:

- equipment
- fire systems
- QR codes
- maintenance plans
- maintenance jobs
- technician assignments
- inspection templates
- findings
- report generation
- client portal functionality
- offline sync

Those come later.

---

# 3. Domain Hierarchy

```text
Organisation
│
└── Client
    │
    ├── Client Contacts
    │
    └── Sites
        │
        └── Buildings
```

Rules:

- one client belongs to one organisation
- one site belongs to one client and one organisation
- one building belongs to one site and one organisation
- contacts belong to one client and one organisation
- organisation_id must be derived from authenticated profile, never trusted from form input

---

# 4. Existing Database Tables

Phase 1 reuses the migration pack.

Required tables:

```text
clients
client_contacts
sites
buildings
```

Do not create duplicate Phase 1 tables if the migrations already exist.

---

# 5. Routes

## Clients

```text
/clients
/clients/new
/clients/[id]
/clients/[id]/edit
```

## Sites

```text
/sites
/sites/new
/sites/[id]
/sites/[id]/edit
```

Buildings are primarily managed inside the site detail page in V1.

---

# 6. Client List

The client list should show:

```text
Client Name
Registration No.
Primary Contact
Sites
Status
Updated
```

Actions:

```text
View
Edit
Deactivate
```

Initial filters:

```text
Search
Active / Inactive
```

Do not add complex CRM filters in Phase 1.

---

# 7. Client Detail

Recommended layout:

```text
ABC Manufacturing Sdn Bhd

Status: Active

Registration No.
ABC-001

Phone
+605...

Email
facility@...

Address
...

--------------------------------

Contacts

Name          Position        Phone
Ahmad         Facility Mgr    ...

[ ADD CONTACT ]

--------------------------------

Sites

ABC Main Plant
Ipoh, Perak
2 Buildings

[ ADD SITE ]
```

Future Equipment/Maintenance tabs are not built yet.

---

# 8. Client Form

Fields:

```text
name *
registration_no
phone
email
address
active
```

Rules:

- name required
- email valid when provided
- trim whitespace
- status defaults active
- organisation_id must NOT be a browser-editable field

---

# 9. Client Contact Form

Fields:

```text
name *
position
phone
email
is_primary
active
```

Rules:

- name required
- one client may have multiple contacts
- V1 may allow multiple `is_primary=true` at DB level if existing schema does not enforce uniqueness
- application action should unset the previous primary contact when a new primary is selected

---

# 10. Site List

Show:

```text
Site
Client
Site Code
City / State
Buildings
Status
```

Filters:

```text
Search
Client
Active / Inactive
```

---

# 11. Site Form

Fields:

```text
client_id *
name *
site_code
address
city
state
postcode
country
latitude
longitude
active
```

Rules:

- selected client must belong to current organisation
- site name required
- site code optional
- coordinates optional
- no map dependency in Phase 1

---

# 12. Site Detail

Recommended:

```text
ABC Manufacturing Main Plant

Client
ABC Manufacturing

Site Code
ABC-MAIN

Address
...

--------------------------------

Buildings

Building A
Code: BLK-A
Floors: 2

Building B
Code: BLK-B
Floors: 1

[ ADD BUILDING ]
```

---

# 13. Building Form

Fields:

```text
name *
code
floors
description
active
```

Rules:

- building belongs to the current site
- organisation_id and site_id come from server context
- floors must be non-negative integer when supplied

---

# 14. Data Access Pattern

Do not query Supabase directly throughout page components.

Use feature modules:

```text
features/clients/queries.ts
features/clients/actions.ts

features/sites/queries.ts
features/sites/actions.ts

features/buildings/queries.ts
features/buildings/actions.ts
```

Pages orchestrate.

Features own domain data access.

---

# 15. Mutation Pattern

Preferred flow:

```text
Form
 ↓
Server Action
 ↓
requireProfile()
 ↓
role check
 ↓
Zod validation
 ↓
Supabase mutation
 ↓
RLS
 ↓
revalidatePath()
 ↓
redirect()
```

The browser must not send `organisation_id`.

---

# 16. Management Permission

Create/update/inactivate requires:

```text
OWNER
ADMIN
SUPERVISOR
```

Technician and Client roles cannot access the management CRUD UI.

RLS remains authoritative.

---

# 17. Soft Deactivation

Phase 1 should use:

```text
active = false
```

instead of deleting client/site/building records.

Why:

Future maintenance and report history will depend on these records.

Deleting historical parents is undesirable.

---

# 18. Client Query Contract

Suggested:

```typescript
type ClientListItem = {
  id: string;
  name: string;
  registration_no: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  site_count: number;
  primary_contact_name: string | null;
  updated_at: string;
}
```

---

# 19. Site Query Contract

```typescript
type SiteListItem = {
  id: string;
  name: string;
  site_code: string | null;
  client_id: string;
  client_name: string;
  city: string | null;
  state: string | null;
  active: boolean;
  building_count: number;
  updated_at: string;
}
```

---

# 20. RLS Expectations

The existing RLS policies must guarantee:

```text
Org A user cannot read Org B client
Org A user cannot update Org B site
Org A user cannot create building under Org B site
```

Application queries should still be scoped clearly, but RLS is the final boundary.

---

# 21. Cross-Entity Validation

Before site creation:

```text
selected client
  ↓
exists
  ↓
belongs to current organisation
```

Before building creation:

```text
selected site
  ↓
exists
  ↓
belongs to current organisation
```

Do not rely only on a foreign key.

A foreign key proves existence, not tenant ownership.

---

# 22. Phase 1 UI States

Every list/detail should have:

```text
loading
empty
error
success
```

Examples:

Client list empty:

> No clients yet. Add your first client to begin building the maintenance register.

Site list empty:

> No sites yet. Add a site under a client.

Building list empty:

> No buildings yet. Add the first building for this site.

---

# 23. Audit Events

If audit infrastructure is already active, record:

```text
CLIENT_CREATED
CLIENT_UPDATED
CLIENT_DEACTIVATED

CONTACT_CREATED
CONTACT_UPDATED
CONTACT_DEACTIVATED

SITE_CREATED
SITE_UPDATED
SITE_DEACTIVATED

BUILDING_CREATED
BUILDING_UPDATED
BUILDING_DEACTIVATED
```

If Phase 0 does not yet have a generic audit helper, define the interface but do not block Phase 1.

---

# 24. Tests

## Unit

- client schema
- site schema
- building schema
- management-role predicate

## Integration

- create client
- create contact
- create site
- create building
- update client
- deactivate site
- tenant validation

## E2E

```text
Admin Login
 ↓
Clients
 ↓
Add Client
 ↓
Client Detail
 ↓
Add Contact
 ↓
Add Site
 ↓
Site Detail
 ↓
Add Building
 ↓
Verify hierarchy
```

---

# 25. Phase 1 Acceptance Criteria

```text
[ ] /clients renders real database data
[ ] Admin can create client
[ ] Admin can edit client
[ ] Admin can deactivate client
[ ] Admin can add/edit/deactivate contact
[ ] /sites renders real database data
[ ] Admin can create site for valid current-org client
[ ] Admin can edit site
[ ] Admin can deactivate site
[ ] Admin can add/edit/deactivate building
[ ] Client detail shows contacts and sites
[ ] Site detail shows client and buildings
[ ] Technician cannot access management CRUD
[ ] Client role cannot access management CRUD
[ ] Cross-tenant access fails
[ ] lint passes
[ ] typecheck passes
[ ] unit tests pass
[ ] integration tests pass
[ ] E2E slice passes
[ ] production build passes
```

---

# 26. Phase 1 Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 1 ONLY.

FIRST:
Inspect the repository and confirm Phase 0 is present and passing.

DO NOT:
- rebuild the auth foundation
- change tenancy architecture
- duplicate existing Supabase migrations
- build equipment
- build maintenance
- build inspections
- build reports
- introduce fake production data

OBJECTIVE:
Implement the Client → Contact → Site → Building management vertical slice.

USE:
- existing Supabase browser/server clients
- existing requireProfile/auth helpers
- existing management shell
- existing loading/error/empty components
- existing RLS migration pack

IMPLEMENT:

CLIENTS
- list
- create
- detail
- edit
- deactivate

CLIENT CONTACTS
- create
- edit
- deactivate
- primary-contact handling

SITES
- list
- create
- detail
- edit
- deactivate

BUILDINGS
- create
- edit
- deactivate
- list under site detail

VALIDATION:
Use server-side Zod schemas or the repository's existing validation standard.

SECURITY:
- organisation_id must come from authenticated profile
- client/site/building relationships must be validated server-side
- management writes allowed only for OWNER, ADMIN, SUPERVISOR
- RLS remains authoritative

DATA ACCESS:
Keep domain reads/writes in feature modules, not scattered through page components.

SOFT DELETE:
Use active=false.
Do not hard-delete historical domain records.

TEST:
- unit validation tests
- integration CRUD tests
- tenant isolation tests
- E2E Client → Site → Building flow

VERIFY:
lint
typecheck
test
E2E
production build

STOP:
Do not begin Phase 2.

END WITH:
IMPLEMENTATION SUMMARY

Repository:
Files changed:
Database migrations:
RLS changes:
Routes:
Tests:
Build:
Known issues:
Ready for Phase 2: YES/NO
```

---

# 27. Handoff to Phase 2

Phase 2 attaches the asset hierarchy:

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

Phase 1 must therefore be stable before Equipment begins.

---

## Phase 1 Principle

> **Build the customer and premises hierarchy correctly once. Everything else in FireMaint will depend on it.**
