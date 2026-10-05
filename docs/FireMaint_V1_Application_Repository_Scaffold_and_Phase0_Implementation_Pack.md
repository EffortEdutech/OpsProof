# FireMaint V1 — Application Repository Scaffold + Phase 0 Implementation Pack

## Bismillah.

This artifact is the implementation bridge between the FireMaint product specifications and the first working application.

The goal of Phase 0 is **not** to build FireMaint features.

The goal is to establish a production-grade application foundation so later vertical slices can be added safely.

---

# 1. Phase 0 Objective

Establish:

1. Next.js application shell
2. TypeScript strict mode
3. Tailwind-based design foundation
4. Supabase browser/server clients
5. Supabase Auth integration boundary
6. Organisation/profile tenancy foundation
7. RLS-ready data access model
8. PWA manifest and application shell
9. Management, technician and client route groups
10. Loading/error/empty-state patterns
11. Test structure
12. Environment validation
13. Health endpoint
14. CI-ready lint/typecheck/test/build scripts
15. Documentation for handoff to Codex / Claude Code

Phase 0 must finish with a stable repository that can safely accept Phase 1.

---

# 2. Non-Goals

Do NOT implement yet:

- clients
- sites
- buildings
- equipment
- maintenance plans
- maintenance jobs
- inspection templates
- inspections
- findings
- report generation
- dashboards using production metrics
- offline sync engine
- client portal business features

Only shells/placeholders are allowed where routing requires them.

---

# 3. Target Repository Structure

```text
firemaint/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   └── dashboard/
│   ├── technician/
│   │   └── today/
│   ├── client/
│   │   └── dashboard/
│   └── api/
│       └── health/
│
├── components/
│   ├── ui/
│   └── layout/
│
├── features/
│   └── organisations/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   └── utils/
│
├── public/
│   └── icons/
│
├── supabase/
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│
├── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── vitest.config.ts
├── .env.example
└── README.md
```

---

# 4. Application Surfaces

Phase 0 establishes three user experiences.

## Management

Route group:

```text
/dashboard
```

Future users:

- Owner
- Admin
- Supervisor

## Technician

Route group:

```text
/technician/*
```

Initial shell:

```text
/technician/today
```

## Client

Route group:

```text
/client/*
```

Initial shell:

```text
/client/dashboard
```

Authentication routes:

```text
/login
/forgot-password
```

---

# 5. Phase 0 Security Rules

The following are non-negotiable:

- no service-role key in browser code
- no tenant selection supplied by the client
- organisation identity comes from the authenticated profile
- RLS remains the final security boundary
- server-side data access must use authenticated Supabase session
- client-side checks may improve UX but are not authorization
- cross-tenant access must be covered by tests before Phase 1

---

# 6. Supabase Client Separation

Use separate modules.

## Browser client

```text
lib/supabase/browser.ts
```

Responsibilities:

- public anon key only
- browser session
- interactive client features

## Server client

```text
lib/supabase/server.ts
```

Responsibilities:

- server components
- route handlers
- authenticated SSR reads

## Middleware session helper

```text
lib/supabase/middleware.ts
```

Responsibilities:

- refresh auth cookies
- protect authenticated sections
- avoid business authorization logic

Do not create a globally exported service-role client.

If a future server-only admin operation needs one, place it in an explicitly server-only module.

---

# 7. Environment Contract

Required:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Server-only when later required:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Phase 0 must validate required public environment variables during startup/build.

Never use fallback fake credentials.

---

# 8. TypeScript Rules

Use strict mode.

Recommended compiler settings:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

Avoid:

```text
any
as unknown as
// @ts-ignore
```

unless the reason is documented.

---

# 9. Domain Primitives

Phase 0 may define only foundational role types:

```typescript
export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "SUPERVISOR"
  | "TECHNICIAN"
  | "CLIENT";
```

Business-domain types come in later phases.

---

# 10. Permission Boundary

Create:

```text
lib/permissions/roles.ts
```

Responsibilities:

- role helpers
- route-level UX checks
- reusable predicates

Example:

```typescript
canAccessManagement(role)
canAccessTechnician(role)
canAccessClientPortal(role)
```

Important:

These are NOT replacements for RLS.

---

# 11. Authentication Boundary

Create reusable server helpers:

```text
getCurrentUser()
getCurrentProfile()
requireUser()
requireProfile()
```

Later phases can build:

```text
requireRole()
requireOrganisation()
```

Do not query profiles independently throughout UI components.

Centralize authenticated identity access.

---

# 12. Layout Strategy

## Root layout

Provides:

- metadata
- viewport
- global CSS
- application font
- PWA metadata

## Management layout

Desktop-first shell:

- sidebar
- top bar
- content area

## Technician layout

Mobile-first shell:

- compact header
- sync/status area placeholder
- bottom navigation

## Client layout

Simple portal shell:

- client header
- content area

---

# 13. UI Foundation

Create only a small shared foundation in Phase 0:

```text
Button
Card
PageHeader
EmptyState
ErrorState
LoadingState
AppShell
```

Do not build a full design system prematurely.

---

# 14. PWA Foundation

Required:

```text
manifest.webmanifest
```

Include:

- name
- short_name
- start_url
- display: standalone
- theme/background values
- icon references

Phase 0 does NOT yet need full offline business-data sync.

However, repository structure should leave room for:

```text
lib/sync/
```

in Phase 6.

---

# 15. Health Endpoint

Create:

```text
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "service": "firemaint",
  "version": "phase-0"
}
```

No secrets.

This provides a deployment smoke test.

---

# 16. Loading / Error / Empty Patterns

Every major route added in later phases must use consistent states.

Create reusable components now:

```text
LoadingState
ErrorState
EmptyState
```

This avoids one-off implementations later.

---

# 17. Testing Foundation

Use:

- Vitest for unit tests
- Testing Library when UI tests are needed
- Playwright for E2E

Phase 0 minimum tests:

```text
environment validator
role helpers
health endpoint
authenticated route redirect behavior
```

Later:

```text
RLS integration tests
golden path E2E
offline E2E
```

---

# 18. Phase 0 Supabase Scope

Phase 0 assumes the first database migrations already exist or are copied from the Supabase Migration Pack.

At minimum the live test database needs:

```text
organisations
profiles
```

and their RLS helpers.

Do not duplicate migrations if the migration pack already owns them.

---

# 19. Recommended Phase 0 Acceptance Criteria

Phase 0 is complete only when:

```text
[ ] app starts locally
[ ] production build succeeds
[ ] TypeScript strict checks pass
[ ] lint passes
[ ] unit tests pass
[ ] /api/health returns 200
[ ] login route renders
[ ] unauthenticated /dashboard redirects to login
[ ] authenticated profile can be loaded server-side
[ ] management shell renders
[ ] technician shell renders
[ ] client shell renders
[ ] no service-role key appears in client bundle
[ ] manifest is valid
[ ] repository has no mock production data
```

---

# 20. Phase 0 Deliverables

The implementation agent must report:

```text
IMPLEMENTATION SUMMARY

Repository discovered:
-

Files changed:
-

Dependencies added:
-

Supabase migrations used:
-

Auth wiring:
-

RLS assumptions:
-

Tests:
-

Build:
-

Known issues:
-

Ready for Phase 1:
YES / NO
```

---

# 21. Codex / Claude Code Execution Prompt

```text
Bismillah.

You are implementing FireMaint V1 Phase 0.

FIRST:
Inspect the existing repository before changing anything.

DO NOT:
- replace an existing application blindly
- build Phase 1 features
- add fake production data
- bypass RLS
- expose the Supabase service-role key
- hard-code future domain workflows

OBJECTIVE:
Establish the production-ready FireMaint application foundation.

IMPLEMENT:
1. Next.js App Router structure
2. TypeScript strict configuration
3. Tailwind/global styling foundation
4. Supabase browser client
5. Supabase server client
6. Supabase middleware/session refresh
7. Auth route protection
8. profile-loading helper
9. role helper functions
10. management application shell
11. technician mobile shell
12. client portal shell
13. reusable loading/error/empty states
14. PWA manifest
15. /api/health
16. Vitest foundation
17. Playwright foundation
18. .env.example
19. README setup instructions

DATABASE:
Reuse the existing FireMaint Supabase migration pack.
Do not recreate schema migrations that already exist.

SECURITY:
- browser gets anon key only
- service role is server-only and should not be needed in normal Phase 0 UI
- organisation is derived from the authenticated profile
- RLS remains authoritative

VERIFY:
- npm install
- npm run lint
- npm run typecheck
- npm run test
- npm run build

If the repository uses pnpm/yarn/bun already, preserve that package manager.

STOP CONDITION:
If the existing repository architecture materially conflicts with this plan,
report the conflict instead of rewriting the project wholesale.

END WITH:
IMPLEMENTATION SUMMARY
including files changed, dependencies, tests, build status and remaining issues.

Stop after Phase 0.
```

---

# 22. Phase 1 Handoff Gate

Do not begin Phase 1 until Phase 0 is verified.

Phase 1 starts only after:

```text
Auth
+
Organisation
+
Profile
+
RLS
+
App Shell
+
Testing
```

are stable.

Phase 1 then adds:

```text
Client
Client Contact
Site
Building
```

---

# 23. First Complete Product Journey

This remains the larger target:

```text
Create Client
   ↓
Create Site
   ↓
Create Equipment
   ↓
Create Maintenance Job
   ↓
Assign Technician
   ↓
Technician Inspection
   ↓
Photo
   ↓
Finding
   ↓
Submit
   ↓
Supervisor Review
   ↓
PDF
   ↓
Client Portal
```

Phase 0 exists to make this safe to build.

---

# 24. Phase 0 Definition

Phase 0 is successful when FireMaint has become:

> **A secure, typed, testable, deployable multi-surface application shell connected correctly to Supabase and ready for domain features.**

Not more.

Not less.

---

## Bismillah.

**Build the foundation once.  
Build the domain on top of it.  
Do not repair the foundation after customers arrive.**
