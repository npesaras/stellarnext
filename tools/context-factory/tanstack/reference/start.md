# TanStack Start Reference

Read this reference for TanStack Start configuration, React bindings, server functions, server routes, middleware, execution boundaries, authentication primitives, or deployment behavior.

## Load Current Intent Guidance

Load the React entry skill first:

```sh
npx @tanstack/intent@latest load @tanstack/react-start#react-start
```

Then load one Start core sub-skill when needed:

| Concern | Intent skill |
| --- | --- |
| Start setup and document shell | `@tanstack/start-client-core#start-core` |
| Type-safe server reads and mutations | `@tanstack/start-client-core#start-core/server-functions` |
| Request or server-function middleware | `@tanstack/start-client-core#start-core/middleware` |
| Sessions, cookies, OAuth, CSRF, or auth endpoints | `@tanstack/start-client-core#start-core/auth-server-primitives` |
| Server/client execution boundaries | `@tanstack/start-client-core#start-core/execution-model` |
| Raw HTTP or public API endpoints | `@tanstack/start-client-core#start-core/server-routes` |
| Hosting, SSR mode, prerendering, or SEO | `@tanstack/start-client-core#start-core/deployment` |
| React Server Components | `@tanstack/react-start#react-start/server-components` |

Use `npx @tanstack/intent@latest load <skill>` with the selected identifier. A protected mutation commonly needs `server-functions` and `auth-server-primitives`; a route guard may additionally need the Router auth skill.

## Architecture

- Call a server function directly from a route loader for application data. Do not make an SSR loader fetch the app's own relative API endpoint.
- Use a server route when the HTTP contract itself is required, such as a webhook, feed, file response, or third-party API.
- When a server function and server route share behavior, extract a server-side service and call it from both boundaries.
- Validate external input and enforce authentication and authorization inside every private server function or server route.
- Use `useServerFn` for component-triggered server functions. After a mutation, invalidate and await the router or the cache that owns the affected data.
- Keep browser-only code behind the execution-boundary APIs described by the current Intent skill.

## Project Setup Constraints

- `tanstackStart()` must run before `viteReact()` in `vite.config.ts`; unrelated Vite plugins may be ordered according to their own integration requirements.
- The root route owns the document shell and must render `HeadContent` in `<head>` and `Scripts` in `<body>`.
- Import server functions and Start APIs from `@tanstack/react-start`; import routing APIs from `@tanstack/react-router` unless the current package skill specifies otherwise.
- Do not introduce Next.js directives, App Router conventions, `getServerSideProps`, or Remix loader/action patterns.

## Verification

Choose checks that exercise the changed boundary:

- Initial SSR request and client-side navigation
- Direct invocation of a protected server boundary without a session
- Valid and invalid server-function input
- Mutation followed by cache or router refresh
- Runtime response shape, not only TypeScript inference
- Project typecheck and production build
