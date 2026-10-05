# @stellarjob/supabase

Shared TypeScript contract for the StellarJob Supabase database. Workspace apps can import `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, and `Constants` from `@stellarjob/supabase`.

`src/database.types.ts` is generated from the intended Supabase project. Regenerate it when the schema changes; do not hand-edit table definitions. The versioned SQL migrations remain in the root `supabase/migrations/` directory.

This package intentionally contains no Supabase credentials or client instance. Each app owns its runtime configuration and SSR cookie adapter; for example, the TanStack Start client stays in `apps/web/src/lib/supabase/server-client.ts`.
