# API Type Synchronization

When `apps/api` changes (new endpoints, modified schemas, updated routes), regenerate the shared API client used by `apps/site` **before** creating or modifying hooks.

## Command

```bash
# From the repository root
pnpm gen:data
```

## When to Run

- After adding new API endpoints
- After modifying endpoint request/response types
- After changing route paths or parameters
- Before creating new query/mutation hooks
- Before modifying existing hooks using API types

## What It Does

- Generates TypeScript types from OpenAPI spec
- Updates `packages/api-client/src/generated/` with the latest API types and client functions
- Ensures type safety between frontend and backend

## Failure to Sync

Results in:

- TypeScript errors (missing/outdated types)
- Runtime errors (mismatched shapes)
- Incorrect hook implementations
