# StellarJob — Database

This folder contains historical schema and ERD references copied from StellarNext. The versioned files in `supabase/migrations/` are the migration source of truth. Do not apply `schema.sql` on top of an already migrated database. The optional `supabase/seeds/test_jobs.sql` is run manually for test data, never loaded by the app as a fallback.

## Files

- [`erd.md`](./erd.md) — entity-relationship diagram (Mermaid) + narrative of the relationships between every table.
- [`schema.sql`](./schema.sql) — historical schema reference. Check the migrations for later columns and policies.

## Source

The shared generated database types live in `packages/supabase/src/database.types.ts`. Regenerate them from the intended Supabase project after changing the schema. The web app consumes them through `@stellarjob/supabase`.

## Client model reminder

Pick the right Supabase client at each call site:

| Client                                             | Where                           | RLS                                                                        |
| -------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| `@/lib/supabase/server-client` via `@supabase/ssr` | TanStack Start server functions | Respected as the signed-in user when cookies are present; otherwise `anon` |

## Not covered here

- Storage buckets (avatars, CVs). Add a `storage.md` when we wire uploads.
- Dedicated employer job-management and analytics screens. The migrated employer flow currently covers company onboarding.
