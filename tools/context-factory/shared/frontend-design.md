# StellarJob frontend design source of truth

This document defines stable design decisions for the TanStack Start app in `apps/web`. The implementation authority is `apps/web/src/styles/app.css` for theme values and `apps/web/components.json` for shadcn setup. Detailed execution rules live in [the frontend design-system reference](../frontend/reference/design-system.md).

## Product character

StellarJob should feel clear, trustworthy, and encouraging to job seekers and hiring teams. Put the opportunity, next step, and application status ahead of decoration. Copy should be direct and useful, especially in onboarding and error states.

## Visual baseline

- Light, spacious surfaces are the default. Dark mode uses the same semantic roles, not one-off color overrides.
- The existing navy-blue `--primary` is for primary actions and active navigation. Warm `--accent` is selective emphasis, not a competing primary. Use `--success`, `--warning`, and `--destructive` only for their meanings.
- Geist is the UI font; Geist Mono is reserved for compact technical or numeric details. Do not import Upskwela's Outfit/DM Sans or copy Upwork's green palette.
- Use the current app radius and restrained borders/shadows. Prefer flat fills, clear hierarchy, and whitespace over gradients, glows, textured backgrounds, or decorative animation.
- Use the app's `BrandMark` and existing assets. External screenshots are references for flow, spacing, and interaction, not permission to reproduce third-party logos, marks, or watermarks.

## Implementation ownership

- Theme variables and Tailwind mappings stay in `apps/web/src/styles/app.css`. Add a new semantic role there for both light and dark modes before using it across components.
- shadcn primitives stay in `apps/web/src/components/ui`; compose them into product components in `apps/web/src/components` or route-local components.
- Do not start a second theme package or component library while `apps/web` is the only UI consumer. Follow [package instructions](../../../packages/instructions.md) if a second app later needs shared UI.
- Keep data-backed status, counts, and records truthful to Supabase responses. Do not use visual polish to hide loading, empty, or failed states.
