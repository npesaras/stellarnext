# Instructions for shared packages

Read this file before adding or changing anything under `packages/`. Also follow the root `AGENTS.md` and the relevant project skills. `upskwela-develop/packages/` is a structural reference, not code to copy or a StellarJob workspace dependency.

## Decide whether code belongs here

- Put code in a package when at least two workspace consumers need the same contract or implementation, or when it is an intentional cross-app boundary (such as the generated Supabase database contract).
- Keep code in `apps/web` while it has only one consumer. Do not create empty `hooks`, `utils`, `ui`, or `shared` packages in anticipation of reuse.
- A package must not import from `apps/*`. Keep its public API small and explicit through `package.json` `exports`; depend on other workspace packages with `workspace:*`.
- Prefer pure, framework-independent domain types and functions for new shared logic. Keep app-specific presentation adapters in the app. For example, job filtering and salary formatting could move to a domain package if another consumer needs them, while a job-card mapper with route links and UI badge props stays in `apps/web`.

## Framework and data boundaries

- Keep TanStack Start routes, loaders, server functions, cookie-backed Supabase clients, environment-variable reads, and authorization checks in `apps/web`. Never expose server credentials or a service-role key from a browser-importable package.
- Share a React hook only when multiple workspace consumers actually need the same behavior and the hook does not assume a particular route, app context, or server environment. Declare React as a peer dependency and test the hook's behavior before adding a `hooks` package.
- Keep shadcn components, Tailwind-specific `cn`, and design tokens in `apps/web` until another app needs the same UI system. Do not move generated shadcn files just to make the directory look like the reference monorepo.
- `packages/supabase` owns the generated TypeScript `Database` contract only. SQL migrations and RLS policies remain in root `supabase/`; runtime Supabase client creation remains in the app. Regenerate types after schema changes rather than editing generated types by hand.
- Do not add hardcoded jobs, user records, or fake backend fallbacks to a shared package. Runtime data comes from Supabase.

## When creating a package

1. Identify its real consumers and define a narrow, stable public API.
2. Add a private `@stellarjob/*` package with explicit exports, a strict TypeScript config, scripts, and a short README. Declare only the dependencies it uses; avoid circular workspace dependencies.
3. Add `workspace:*` dependencies to consumers and update the pnpm lockfile.
4. Add focused tests for shared behavior, then run `pnpm check` from the workspace root.

If there is no real second consumer or deliberate shared contract, keep the implementation local and revisit the extraction later.
