# FireMaint V1 — Report Template & Customer Configuration Pack

## Bismillah.

This artifact defines which parts of FireMaint are configurable per organisation without code changes.

# Configurable Organisation Settings

- organisation name
- legal name
- registration number
- address
- phone
- email
- logo
- report prefix
- timezone
- active users/roles

# Report Configuration

Configurable:
- logo
- company details
- report title
- report prefix
- footer text
- declaration text
- client acknowledgement text
- next-maintenance wording

Not configurable in V1:
- arbitrary HTML/CSS
- unsafe script
- tenant-defined executable logic

# Inspection Configuration

Per organisation:
- custom equipment types
- custom inspection templates
- template versions
- finding trigger rules
- guidance text

# Equipment Configuration

Allowed:
- asset-code convention
- custom equipment type
- system classification
- QR label print format later

# Customer Configuration Checklist

- [ ] Organisation profile
- [ ] Logo
- [ ] Report prefix
- [ ] Timezone
- [ ] Users
- [ ] Roles
- [ ] Equipment types
- [ ] Inspection templates
- [ ] Report wording
- [ ] Client portal accounts

# Change Control

Any configuration change that affects historical evidence must:
- create a new template/version where appropriate
- never rewrite historical inspection meaning
- preserve issued reports

## Principle

> **Configuration should adapt FireMaint to the customer without forking the product.**
