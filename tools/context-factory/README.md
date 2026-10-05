# StellarJob context factory

This directory is the source for project-specific agent guidance. Root `AGENTS.md` directs UI work to the frontend skill; the skill routes agents to the relevant design, shadcn, and TanStack references. Read the canonical files here even when an assistant's skill-link directory has not been set up.

| Purpose                               | Canonical file                                    |
| ------------------------------------- | ------------------------------------------------- |
| Repository instructions and discovery | `AGENTS.md` at the repository root                |
| Frontend task entrypoint              | `frontend/SKILL.md`                               |
| Stable StellarJob design decisions    | `shared/frontend-design.md`                       |
| Strict UI implementation rules        | `frontend/reference/design-system.md`             |
| shadcn component guidance             | `frontend/shadcn/SKILL.md`                        |
| TanStack route and server guidance    | `tanstack/SKILL.md`                               |
| Package placement rules               | `packages/instructions.md` at the repository root |

The actual UI configuration lives in `apps/web/components.json`; theme tokens live in `apps/web/src/styles/app.css`. Those app files win if an upstream shadcn example or the separate `upskwela-develop` reference project differs. There is no shared UI package or `apps/site` in the StellarJob workspace.

When editing guidance, change the canonical file once and verify all relative links. `tools/context-factory/scripts/sync-skills.mjs` is retained for optional link generation, but the current root `package.json` does not run it during install or provide `sync:skills` scripts. Do not assume generated links exist; root `AGENTS.md` is the reliable discovery path for this checkout.
