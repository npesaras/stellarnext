---
name: tanstack-skill
description: TanStack Start, Router, and AI implementation guidance for this project. Use when changing routes, loaders, server functions, server routes, middleware, SSR, TanStack AI flows, or TanStack Vite integration. Load the matching TanStack Intent skill and only the local references relevant to the task.
---

# TanStack Skill

This project uses TanStack Start with React, TanStack Router, and TanStack AI. Treat the skills shipped by the installed TanStack packages as the version-specific API authority; use this skill for project routing and cross-cutting constraints.

## Intent Workflow

Before changing TanStack code, run from the repository root:

```sh
npx @tanstack/intent@latest list
```

Load the most specific matching skill shown by that command. Start with one entry skill, then add a sub-skill only when the task crosses that boundary:

| Scope | Entry skill | Local reference |
| --- | --- | --- |
| TanStack Start setup, server behavior, or React bindings | `@tanstack/react-start#react-start` | [Start](reference/start.md) |
| Routes, navigation, params, search, loaders, guards, or route errors | `@tanstack/router-core#router-core` | [Router](reference/router.md) |
| Chat, tools, structured output, media, adapters, or AI middleware | `@tanstack/ai#ai-core` | [AI](reference/ai.md) |

Read the linked local reference for the scope being changed. For work spanning scopes, load each applicable entry skill and reference. Do not load the entire Intent catalog preemptively.

If an Intent skill's reported version differs from the installed package, prefer the installed package's exports, types, and implementation. Verify uncertain APIs against the installed source rather than adapting examples by guesswork.

## Project Invariants

- TanStack Start code is isomorphic by default. Put secrets, database access, privileged operations, and other server-only behavior behind `createServerFn`, server middleware, or a server route.
- Enforce authorization at the server boundary. Route guards such as `beforeLoad` improve navigation UX but do not secure a server function or endpoint.
- Keep `tanstackStart()` before `viteReact()` in the Vite plugin list.
- Preserve TanStack's inferred types. Do not add casts or duplicate annotations to work around route, loader, or server-function errors.
- Do not hand-edit `src/routeTree.gen.ts` or generated `createFileRoute` path strings. Rename route files and let the configured plugin regenerate them.
- Use TanStack Start and Router APIs, not analogous Next.js, Remix, React Router, or Vercel AI SDK APIs.
- Use the repository's package runner for installs and scripts.

## Completion

Validate the specific behavior changed, then run the applicable typecheck and production build. For full-stack changes, exercise both the initial server-rendered request and client navigation. For mutations, also verify the post-mutation refresh path; for protected behavior, verify direct anonymous access at the server boundary.
