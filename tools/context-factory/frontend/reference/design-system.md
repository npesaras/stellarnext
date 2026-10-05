---
description: Strict StellarJob UI and design-system rules for apps/web
globs: apps/web/src/**/*.{tsx,css}
alwaysApply: true
---

# StellarJob UI rules

Use this reference for every new or changed UI in `apps/web`. Stable brand decisions are in [frontend-design.md](../../shared/frontend-design.md); actual values live in `apps/web/src/styles/app.css` and `apps/web/components.json`.

## Non-negotiables

- Use the installed shadcn/Radix primitives before creating a custom control. Do not add another component library or reimplement buttons, inputs, dialogs, alerts, badges, empty states, or loading placeholders as styled `div`s.
- Use semantic classes such as `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, and the existing status tokens. No arbitrary hex/OKLCH values or random Tailwind palette colors in product components. Add or adjust shared tokens in `app.css`, including dark values, when the system truly needs a new role.
- Keep visual hierarchy calm: one primary action per decision area, clear headings, readable body text, flat surfaces, restrained borders/shadows, and purposeful whitespace. Do not add decorative gradients, glows, texture grids, parallax, or ambient motion by default. Honor an explicit user-requested visual exception.
- Use the app's Geist typography and `BrandMark`. Do not apply Upskwela fonts/colors or reproduce Upwork/Mobbin branding from reference screenshots.
- Every interactive state must be real: a control must navigate, submit, or explain why it is disabled. Never show a successful application, save, or verification before the server confirms it.

## Layout and responsive behavior

- Start with a narrow viewport, then scale up. Ensure content, navigation, forms, and dialogs remain usable at mobile and desktop widths without horizontal overflow.
- Use `flex` or `grid` with `gap-*` for layout; keep related controls aligned and use a readable content width. Do not rely on fixed pixel widths for primary page structure.
- Preserve the existing public header and authenticated workspace-shell patterns unless the task explicitly changes navigation. Route-specific UI belongs beside its route; genuinely repeated UI belongs in `apps/web/src/components`.
- Use `className` primarily for layout. Prefer shadcn variants for component appearance; add a deliberate variant to the primitive rather than repeating one-off color overrides across screens.

## Components and forms

- Inspect `apps/web/src/components/ui` before importing or adding a shadcn component. Follow the local shadcn skill and the project's `components.json` (`new-york`, Radix, Lucide, Tailwind v4, CSS variables).
- Compose `Card` with its header/content/footer parts, `Alert` for callouts, `Empty` for empty states, `Skeleton` or `Spinner` for loading, and `Badge` for compact status labels when those primitives fit. Keep Lucide icons consistent and decorative icons `aria-hidden`.
- Give every input a visible or screen-reader label, associated help/error text, and correct invalid/disabled semantics. Group related choices semantically. Use `Field`/`FieldGroup` where applicable; do not create fake labels with placeholder-only inputs.
- For async actions, show a pending state, prevent duplicate submissions, preserve user input on failure, and expose a useful error. Onboarding must have a clear current step, back/continue behavior, validation, and recovery after refresh where the flow requires it.
- Prefer explicit component variants or composition over many boolean props. Do not add a global store or a shared hook package to solve state that belongs to one route or component.

## Accessibility and interaction

- Use links for navigation and buttons for actions. Preserve keyboard operation and visible focus; never make a clickable `div` the only way to proceed.
- Keep text and action contrast legible in both light and dark themes. Do not communicate status by color alone; include a label or icon with an accessible name.
- Give dialogs and sheets accessible titles, return focus appropriately, and do not trap the user in a loading state. Respect reduced-motion preferences for new motion.
- Provide useful loading, empty, error, and success states for data-backed screens. Copy should say what happened and what the user can do next.

## Review before handoff

1. Compare the changed screen at mobile and desktop widths; check the keyboard path and focus indication.
2. Confirm tokens, fonts, icons, and components match the actual app configuration rather than a reference project's branding.
3. Exercise primary and failure paths, including pending, empty, validation, and server-error states.
4. Run the affected typecheck/build and inspect the rendered result when the task changes layout or interaction.
