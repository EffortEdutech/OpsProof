# FireMaint V1 — Data Import / Migration Pack

## Bismillah.

This artifact standardizes customer onboarding from spreadsheets.

# Supported V1 Imports

1. Clients
2. Sites
3. Buildings
4. Equipment

Optional later:
- users
- maintenance plans
- historical maintenance

# Recommended CSV Templates

## Clients

```text
client_name
registration_no
phone
email
address
```

## Sites

```text
client_name
site_name
site_code
address
city
state
postcode
country
```

## Buildings

```text
client_name
site_name
building_name
building_code
floors
```

## Equipment

```text
client_name
site_name
building_name
system_name
equipment_type_code
asset_code
serial_number
brand
model
capacity
location
installation_date
status
```

# Import Flow

```text
Upload CSV
 ↓
Parse
 ↓
Validate
 ↓
Preview
 ↓
Resolve references
 ↓
Show errors
 ↓
Confirm
 ↓
Import transaction/batches
 ↓
Summary
```

# Rules

- never trust organisation_id from CSV
- tenant comes from authenticated user
- do not partially create invalid cross-tenant relationships
- asset_code uniqueness enforced
- unknown equipment types flagged
- duplicate rows reported
- provide row-level error messages

# Import Result

```text
Rows processed
Rows imported
Rows skipped
Rows failed
Error file
```

# Dry Run

V1 should support preview/dry-run before commit.

# Rollback

Prefer:
- batch import ID
- imported_at timestamp
- imported_by
- ability to deactivate/reverse imported rows where safe

Do not hard-delete historical records blindly.

## Principle

> **Import should accelerate onboarding without weakening data integrity.**
