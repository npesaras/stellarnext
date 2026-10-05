# Shared packages

This directory holds reusable pnpm workspace libraries, following the package boundary pattern in `upskwela-develop/packages/` without copying its app-specific dependencies.

- `supabase/` exports the shared, generated database TypeScript contract.

Read [instructions.md](./instructions.md) before adding or changing a package. There is no `hooks` package yet: the current hooks and UI helpers are specific to `apps/web`, and there is only one app consumer.

Use `workspace:*` for internal dependencies. Keep runtime secrets, TanStack Start cookie adapters, routes, and app-specific UI in `apps/web`. The SQL migrations remain in the root `supabase/` directory.
