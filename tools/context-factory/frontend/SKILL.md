---
name: frontend-skill
description: Implement or review StellarJob UI in apps/web using its TanStack Start, shadcn/ui, Tailwind, and accessibility rules. Use for pages, components, forms, onboarding, responsive layouts, and visual design changes.
---

# StellarJob frontend

`apps/web` is StellarJob's frontend. Use this skill for UI work there; do not apply the `apps/site`, `@upskwela/ui`, or `@upskwela/theme` conventions from the reference repository.

## Read before UI changes

1. Read [the stable design decisions](../shared/frontend-design.md) and [the strict UI rules](reference/design-system.md).
2. For component work, read [the local shadcn skill](shadcn/SKILL.md), inspect `apps/web/components.json`, and check the installed components in `apps/web/src/components/ui`. Run `pnpm dlx shadcn@latest info --json --cwd apps/web` from the repository root when CLI component context is needed.
3. For routes, loaders, navigation, SSR, or server functions, also use [the TanStack skill](../tanstack/SKILL.md) and its matching Intent guidance.

## Non-negotiable boundaries

- `apps/web/src/styles/app.css` owns the theme tokens and fonts; `apps/web/components.json` owns the shadcn configuration. Use semantic tokens and installed components rather than creating a parallel design system.
- Keep route-specific UI with its route and reusable app UI in `apps/web/src/components`. Move UI into `packages/` only under [the package rules](../../../packages/instructions.md); there is no shared `ui` or `hooks` package today.
- TanStack route loaders run on both server and client. Put private Supabase access, secrets, and privileged operations behind server functions; a route guard is navigation UX, not authorization.
- Render live jobs, applications, profile data, and employer data from the existing server-function/Supabase flow. Static interface copy is fine; fake records or success states are not.
- The legacy query-hook, mutation-hook, and Zustand references in this directory describe patterns from another stack. Do not introduce those libraries or workflows merely because those files exist.

Before handing off UI work, check the changed screen at mobile and desktop widths, keyboard interaction, loading/empty/error states, and run the relevant typecheck and build.
