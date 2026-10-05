# StellarJob

StellarJob is a pnpm/Turborepo workspace. Its TanStack Start career app lives in `apps/web` and uses TanStack Router, React 19, Supabase SSR, Tailwind CSS v4, and shadcn/ui.

## Local setup

Requirements: Node.js 22+ and pnpm 11.

```bash
pnpm install
copy apps/web/.env.example apps/web/.env
pnpm dev
```

Set these server-side environment variables in `apps/web/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

The app requires a configured Supabase project. Jobs, verified employer names, saved roles, applications, and dashboard counts are loaded from Supabase; there is no demo-data fallback. An empty database shows empty states. If configuration or a query fails, the app surfaces an error rather than inventing records. Keep `apps/web/.env` local; only the publishable key belongs in `apps/web/.env.example`.

For Google sign-in, enable the Google provider in Supabase Auth and allowlist `https://your-app.example/auth/callback` (and the matching local callback URL for development). Supabase uses a PKCE code exchange in this route. See the [Supabase Google sign-in guide](https://supabase.com/docs/guides/auth/social-login/auth-google) and [redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls).

## Project structure

```text
apps/web/                  # TanStack Start app, shadcn components, app env
  src/
    components/ui/         # shadcn primitives
    lib/                   # server functions, Supabase client, domain logic
    routes/                # public and authenticated file routes
    styles/app.css         # Tailwind and semantic design tokens
packages/supabase/         # shared generated Supabase database types
packages/instructions.md   # placement rules for shared workspace code
supabase/                  # shared database migration source of truth
tools/context-factory/     # project agent guidance
upskwela-develop/          # separate reference monorepo; excluded from workspace
```

`pnpm-workspace.yaml` includes only `apps/*` and `packages/*`. The nested `upskwela-develop` project keeps its own lockfile and is not installed or built by StellarJob commands. The web app depends on the shared `@stellarjob/supabase` package with `workspace:*`. The current React hooks, job helpers, and shadcn UI serve only the web app, so they remain local; add more packages when code is genuinely reused. See [package instructions](packages/instructions.md).

Route files stay thin. Private data access is authorized inside server functions; route guards only handle navigation UX. Supabase sessions use cookie-backed SSR through `@supabase/ssr`.

Frontend changes follow [StellarJob's frontend skill](tools/context-factory/frontend/SKILL.md) and its strict UI rules. The app's `components.json` and `src/styles/app.css` are the active component and design-token sources; the nested Upskwela project is only a structural reference.

## Database

The legacy database migration files are preserved byte-for-byte in `supabase/migrations/`; those are the migration source of truth. The schema and ERD in `apps/web/src/db/` are historical reference material and may not describe every later migration. The optional `supabase/seeds/test_jobs.sql` is a manual test-data script, not an automatic app fallback.

The generated `Database` contract is shared from `packages/supabase/src/database.types.ts`. Supabase credentials and the cookie-backed SSR client remain scoped to `apps/web`.

`supabase/config.toml` still contains the legacy project's ID. Confirm that this is the intended Supabase project before using the CLI or applying migrations. Review every production migration and its RLS policies before deployment. Workspace setup does not run live migrations or seeds.

The legacy UI contained demo job/application content. The current app no longer displays those records and never reports a successful application unless Supabase confirms the insert. Profile edits preserve existing experience, education, skill, and certification rows instead of deleting and recreating them.

Job listings and searches filter in Supabase before pagination. Job server functions return typed database-backed job details, while job cards format those details in the UI. Profile saves still span several Supabase requests rather than one database transaction; a request failure can leave some fields updated. Live authentication and write flows need end-to-end testing against the intended Supabase project.

The account-permissions hardening migration in `supabase/migrations/20260930055225_harden_account_permissions.sql` has a matching SQL regression test in `supabase/tests/`. Apply it only as part of a coordinated app/database rollout after reviewing the connected project's migration history; the local July migration versions do not match the live project's history. A workspace build does not apply this migration.

## Commands

```bash
pnpm dev          # run the web app through Turbo
pnpm dev:web      # run only the web app
pnpm typecheck    # typecheck workspace packages through Turbo
pnpm test         # run focused web unit tests
pnpm build        # build workspace packages through Turbo
pnpm check        # typecheck, test, build, and formatting checks
pnpm format       # format app and root configuration
pnpm preview      # preview the production web build
```
