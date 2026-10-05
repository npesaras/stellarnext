## Workspace

- This repository uses pnpm workspaces and Turbo. The TanStack Start application lives in `apps/web`.
- Keep shared Supabase migrations in the root `supabase/` directory and shared agent guidance in root `tools/context-factory/`.
- `upskwela-develop/` is a reference project, not a StellarJob workspace package. Do not modify it for StellarJob work.
- Run workspace commands from the root. Use `pnpm --filter @stellarjob/web <script>` for app-specific commands.
- Run the shadcn CLI from `apps/web`, where `components.json` and the app's Tailwind source live.
- Before adding or editing a package under `packages/`, read `packages/instructions.md` completely. Do not create a shared package without an actual cross-app consumer or intentional shared contract.
- Before UI work in `apps/web`, read `tools/context-factory/frontend/SKILL.md` and its linked design and shadcn guidance. StellarJob's app tokens and component configuration override examples from reference projects.

<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `npx @tanstack/intent@latest list` from the affected workspace package (`apps/web` for TanStack app work) to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- When working across packages, check each affected package and prefer its local skill.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->
