# TanStack Router Reference

Read this reference when changing the route tree, route files, links, navigation, loaders, search or path parameters, route guards, code splitting, not-found behavior, or Router type registration.

## Load Current Intent Guidance

Load the Router entry skill first:

```sh
npx @tanstack/intent@latest load @tanstack/router-core#router-core
```

Then load only the sub-skill for the active concern:

| Concern | Intent skill |
| --- | --- |
| Search parameter parsing and validation | `@tanstack/router-core#router-core/search-params` |
| Dynamic, optional, or splat path parameters | `@tanstack/router-core#router-core/path-params` |
| Links, navigation, preloading, or blockers | `@tanstack/router-core#router-core/navigation` |
| Loaders, route context, caching, or deferred data | `@tanstack/router-core#router-core/data-loading` |
| Authentication guards or role checks | `@tanstack/router-core#router-core/auth-and-guards` |
| Route code splitting | `@tanstack/router-core#router-core/code-splitting` |
| Not-found and route error handling | `@tanstack/router-core#router-core/not-found-and-errors` |
| Inference, route registration, or TypeScript performance | `@tanstack/router-core#router-core/type-safety` |
| Router SSR, hydration, or document head behavior | `@tanstack/router-core#router-core/ssr` |

Use `npx @tanstack/intent@latest load <skill>` with the selected identifier.

## Routing Rules

- Treat loaders as client-capable and, under Start, potentially server-executed. Never place unguarded secrets or privileged persistence code directly in a loader.
- Define server-only reads and writes with Start primitives, then call them from loaders or components.
- Use route context for non-React dependencies required by `beforeLoad` or loaders; React hooks are not valid in those callbacks.
- Validate search parameters and include loader dependencies that affect cached results.
- Keep route-specific typed hooks in route modules. For shared components, use the narrowing mechanism prescribed by the current type-safety skill rather than casts.
- Register the router type through TanStack's `Register` interface so links and navigation remain type-safe.

## Generated Routes

- Route filenames are the source of truth for file-based routing.
- Never edit `src/routeTree.gen.ts` manually.
- Never manually correct the string passed to generated `createFileRoute`; rename or move the source route and let the plugin update it.
- After a route move, update links, redirects, `from` narrowing, parameters, tests, and any route-specific API access.

## Verification

For route changes, exercise direct URL entry and client navigation. Also verify affected params or search validation, pending/error/not-found states, route generation, typechecking, and the production build.
