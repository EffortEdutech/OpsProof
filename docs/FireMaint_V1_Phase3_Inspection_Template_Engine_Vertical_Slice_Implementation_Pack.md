# FireMaint V1 — Phase 3 Inspection Template Engine Vertical Slice Implementation Pack

## Bismillah.

Phase 3 builds the reusable inspection engine that prevents FireMaint from becoming a collection of hard-coded forms.

Core relationship:

```text
EQUIPMENT TYPE
      ↓
INSPECTION TEMPLATE
      ↓
TEMPLATE VERSION
      ↓
TEMPLATE ITEMS
      ↓
DYNAMIC RENDERER
```

The first production template is:

> **Fire Extinguisher — Standard Inspection v1**

---

# 1. Phase 3 Objective

Implement:

1. Inspection template list/detail
2. Create organisation-specific template
3. Template versioning
4. Template item management
5. Supported field types
6. Dynamic form renderer
7. Validation contract
8. Template preview
9. Fire Extinguisher Standard Inspection v1 seed
10. Tests and Phase 4 handoff

---

# 2. Non-Goals

Do not implement yet:

- maintenance plans
- maintenance jobs
- technician assignment
- inspections table workflow
- inspection result persistence
- findings
- photos
- report generation
- offline sync

The renderer may preview/capture local values for demonstration, but must not write production inspection results yet.

---

# 3. Why This Phase Matters

Do NOT build:

```text
if equipment_type == extinguisher
render extinguisher form
```

Instead:

```text
Equipment Type
    ↓
Template
    ↓
Template Items
    ↓
Generic Renderer
```

Adding a new inspection type later should primarily be configuration/data, not new React form code.

---

# 4. Existing Database Tables

Reuse migration-pack tables:

```text
inspection_templates
inspection_template_items
equipment_types
```

Do not duplicate them.

---

# 5. Template Model

Recommended fields:

```text
id
organisation_id
equipment_type_id
name
code
version
status
description
created_at
updated_at
```

Status:

```text
DRAFT
ACTIVE
ARCHIVED
```

Rules:

- one active template per equipment type is recommended for V1
- historical versions remain immutable once used
- version increments create a new row, not overwrite history
- global reference templates may have `organisation_id = null`

---

# 6. Template Item Model

Fields:

```text
id
template_id
section
item_code
prompt
field_type
options
required
sort_order
guidance
fail_creates_finding
metadata
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

# 7. Template Versioning

Recommended lifecycle:

```text
DRAFT v1
  ↓
ACTIVE v1
  ↓
Create Revision
  ↓
DRAFT v2
  ↓
ACTIVE v2
  ↓
ARCHIVE v1
```

Do not edit ACTIVE templates in place if inspections may already reference them.

---

# 8. Template Item Behavior

## PASS_FAIL

Values:

```text
PASS
FAIL
NA
```

Optional behavior:

```text
FAIL → fail_creates_finding=true
```

## YES_NO

Values:

```text
YES
NO
NA
```

## SELECT

Options supplied by `options`.

Example:

```json
["PASS","ATTENTION","FAIL","NA"]
```

## NUMBER

Use for measurable values.

Example:

```text
pressure reading
battery voltage
test duration
```

## TEXT

Technician notes.

## PHOTO

Future inspection-photo capture point.

Phase 3 renderer can show placeholder/input contract only.

## DATE

Date input.

## SIGNATURE

Future signature capture point.

Phase 3 renderer defines the contract only.

---

# 9. Dynamic Renderer Contract

Input:

```typescript
type InspectionTemplateDefinition = {
  id: string;
  name: string;
  code: string;
  version: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  items: InspectionTemplateItemDefinition[];
};
```

Renderer output:

```typescript
type InspectionDraftValues = Record<string, unknown>;
```

The renderer must:

- group by section
- sort by `sort_order`
- choose control by `field_type`
- mark required items
- show guidance
- support NA where relevant
- remain equipment-agnostic

---

# 10. Renderer Principle

The renderer knows:

```text
field type
required
options
label/prompt
guidance
```

The renderer must NOT know:

```text
what a fire extinguisher is
what a hose reel is
what a fire alarm panel is
```

Domain meaning belongs in template data.

---

# 11. Admin Routes

```text
/inspection-templates
/inspection-templates/new
/inspection-templates/[id]
/inspection-templates/[id]/edit
```

V1 functions:

```text
List
View
Create Draft
Edit Draft
Preview
Activate
Archive
Create Revision
```

---

# 12. Template List

Show:

```text
Template
Equipment Type
Version
Status
Scope
Updated
```

Scope:

```text
Reference
Custom
```

---

# 13. Template Detail

Example:

```text
Fire Extinguisher — Standard Inspection

Equipment Type
Dry Powder Fire Extinguisher

Version
1

Status
ACTIVE

Sections
5

Items
13

[ PREVIEW ]
[ CREATE REVISION ]
```

Then show item table:

```text
Order
Section
Code
Prompt
Type
Required
Creates Finding
```

---

# 14. Template Builder

Phase 3 should support a simple builder.

Template fields:

```text
equipment_type_id
name
code
description
```

Item fields:

```text
section
item_code
prompt
field_type
options
required
sort_order
guidance
fail_creates_finding
```

Do not build drag-and-drop in V1.

Simple ordered item editing is enough.

---

# 15. Template Activation

Activation must validate:

```text
template has at least one item
all item codes unique
sort orders valid
SELECT items have options
required fields are structurally valid
equipment type exists
```

Optional V1 rule:

Only one ACTIVE template for the same equipment type and organisation.

When activating v2:

```text
v1 ACTIVE → ARCHIVED
v2 DRAFT → ACTIVE
```

This should happen transactionally.

---

# 16. Template Revision

`Create Revision` should:

```text
copy template
copy all items
version = previous version + 1
status = DRAFT
```

Do not mutate the source version.

---

# 17. Reference vs Custom Templates

Global reference:

```text
organisation_id = null
```

Tenant custom:

```text
organisation_id = current organisation
```

Tenants may:

- read reference templates
- create their own templates
- create a custom revision/copy where allowed

Tenants must not mutate global reference templates.

---

# 18. Fire Extinguisher Standard Inspection v1

Seed:

```text
Template:
Fire Extinguisher — Standard Inspection

Code:
EXT-STANDARD

Version:
1

Status:
ACTIVE
```

Recommended sections/items:

## Identification

1. Asset identification matches register — PASS_FAIL
2. Correct equipment type/capacity — PASS_FAIL

## Accessibility

3. Extinguisher is accessible and unobstructed — PASS_FAIL
4. Extinguisher is correctly located / mounted — PASS_FAIL

## Physical Condition

5. Cylinder/body free from significant damage — PASS_FAIL
6. No significant corrosion — PASS_FAIL
7. Label/instructions legible — PASS_FAIL

## Safety / Components

8. Safety pin present — PASS_FAIL
9. Tamper seal intact — PASS_FAIL
10. Pressure indicator acceptable where applicable — PASS_FAIL
11. Hose/nozzle condition acceptable where applicable — PASS_FAIL

## Overall

12. Overall condition — SELECT
13. Technician notes — TEXT
14. Photo evidence — PHOTO

Suggested overall options:

```json
["PASS","ATTENTION","FAIL","NA"]
```

Most failed safety/condition checks should set:

```text
fail_creates_finding = true
```

---

# 19. Validation Strategy

Create schemas for:

```text
inspection template
inspection template item
template activation
draft result values
```

Renderer validation should use template definition dynamically.

---

# 20. Draft Result Validation

Example rules:

```text
required item missing → invalid
PASS_FAIL accepts PASS/FAIL/NA only
YES_NO accepts YES/NO/NA only
SELECT must match configured options
NUMBER must be numeric
DATE must be valid date
TEXT accepts string
PHOTO/SIGNATURE use future attachment/value contract
```

---

# 21. Renderer Components

Recommended:

```text
InspectionRenderer
InspectionSection
InspectionField
PassFailField
YesNoField
SelectField
NumberField
TextField
PhotoFieldPlaceholder
DateField
SignatureFieldPlaceholder
```

Do not create separate renderers per equipment type.

---

# 22. Field Result Contract

Recommended:

```typescript
type InspectionFieldValue = {
  templateItemId: string;
  itemCode: string;
  value: unknown;
  resultStatus?: "PASS" | "ATTENTION" | "FAIL" | "NA";
  note?: string;
};
```

This prepares Phase 5 result persistence.

---

# 23. Finding Trigger Metadata

Template items can define:

```text
fail_creates_finding
```

Future Phase 5 behavior:

```text
FAIL
 ↓
finding required
```

Phase 3 only defines/configures this rule.

---

# 24. RLS Expectations

Management writes:

```text
OWNER
ADMIN
SUPERVISOR
```

Reference templates:

```text
readable
not tenant-editable
```

Organisation custom templates:

```text
read/write within tenant
```

Cross-tenant template access:

```text
denied
```

---

# 25. Audit Events

If audit helper exists:

```text
TEMPLATE_CREATED
TEMPLATE_UPDATED
TEMPLATE_ACTIVATED
TEMPLATE_ARCHIVED
TEMPLATE_REVISION_CREATED
TEMPLATE_ITEM_CREATED
TEMPLATE_ITEM_UPDATED
TEMPLATE_ITEM_DELETED
```

---

# 26. Unit Tests

Test:

- field type schema
- SELECT option validation
- unique item codes
- template activation validation
- draft result validator
- grouping/sorting
- revision cloning rules

---

# 27. Integration Tests

Test:

```text
create draft template
add items
preview
activate
create revision
modify v2
activate v2
archive v1
reference template mutation denied
cross-tenant access denied
```

---

# 28. E2E Golden Slice

```text
Admin Login
 ↓
Inspection Templates
 ↓
Open Fire Extinguisher Standard v1
 ↓
Preview
 ↓
Create Custom Revision
 ↓
Edit Draft Item
 ↓
Preview Dynamic Renderer
 ↓
Activate
```

---

# 29. Acceptance Criteria

```text
[ ] template list uses real DB data
[ ] reference template visible
[ ] custom template create works
[ ] draft edit works
[ ] item add/edit works
[ ] SELECT options work
[ ] preview renderer is generic
[ ] renderer groups sections correctly
[ ] renderer sorts correctly
[ ] activation validates structure
[ ] revision creates new version
[ ] source version remains unchanged
[ ] reference templates immutable to tenant
[ ] cross-tenant access denied
[ ] Fire Extinguisher v1 seed present
[ ] lint passes
[ ] typecheck passes
[ ] unit tests pass
[ ] integration tests pass
[ ] E2E passes
[ ] production build passes
```

---

# 30. Coding-Agent Prompt

```text
Bismillah.

Implement FireMaint V1 PHASE 3 ONLY.

FIRST:
Confirm Phase 0, Phase 1 and Phase 2 pass.

OBJECTIVE:
Build the reusable Inspection Template Engine.

DO NOT:
- build maintenance jobs
- build technician job workflow
- persist inspection results
- build findings
- build reports
- hard-code extinguisher form fields in React

IMPLEMENT:

TEMPLATES
- list
- detail
- create draft
- edit draft
- activate
- archive
- create revision

TEMPLATE ITEMS
- add
- edit
- remove from draft
- section
- item code
- prompt
- field type
- options
- required
- sort order
- guidance
- fail_creates_finding

FIELD TYPES
PASS_FAIL
YES_NO
SELECT
NUMBER
TEXT
PHOTO
DATE
SIGNATURE

RENDERER
Build one generic dynamic renderer driven entirely by template data.
The renderer must not know equipment-specific domain logic.

REFERENCE DATA
Seed/verify:
Fire Extinguisher — Standard Inspection v1

VERSIONING
Never overwrite used historical versions.
Create revisions as new rows.

SECURITY
- tenant cannot mutate global reference templates
- custom templates tenant-isolated
- management writes OWNER/ADMIN/SUPERVISOR
- RLS authoritative

TEST
unit
integration
RLS
renderer
E2E

VERIFY
lint
typecheck
tests
E2E
production build

STOP
Do not begin Phase 4.

END WITH
IMPLEMENTATION SUMMARY

Files changed:
Database changes:
Seed changes:
Routes:
Renderer:
RLS:
Tests:
Build:
Known issues:
Ready for Phase 4: YES/NO
```

---

# 31. Phase 4 Handoff

Phase 4 adds:

```text
Maintenance Plan
      ↓
Maintenance Job
      ↓
Job Equipment
      ↓
Technician Assignment
```

Phase 4 will choose the correct template for each equipment item, but still will not yet complete the full technician inspection flow.

## Phase 3 Principle

> **Inspection knowledge lives in data. The renderer stays generic.**
