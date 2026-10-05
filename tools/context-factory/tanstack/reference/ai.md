# TanStack AI Reference

Read this reference for TanStack AI chat, tool calling, structured output, media generation, provider adapters, streaming protocols, middleware, persistence, locks, or debugging.

## Load Current Intent Guidance

Load the AI entry skill first:

```sh
npx @tanstack/intent@latest load @tanstack/ai#ai-core
```

Then load only the relevant sub-skill:

| Concern | Intent skill |
| --- | --- |
| Streaming chat UI and server endpoint | `@tanstack/ai#ai-core/chat-experience` |
| Browser reload persistence | `@tanstack/ai#ai-core/client-persistence` |
| Server or client tool calling and approvals | `@tanstack/ai#ai-core/tool-calling` |
| Image, audio, video, speech, or transcription | `@tanstack/ai#ai-core/media-generation` |
| Typed structured output | `@tanstack/ai#ai-core/structured-outputs` |
| Provider and model adapters | `@tanstack/ai#ai-core/adapter-configuration` |
| AG-UI server protocol | `@tanstack/ai#ai-core/ag-ui-protocol` |
| Lifecycle middleware, analytics, or tracing | `@tanstack/ai#ai-core/middleware` |
| Multi-instance coordination | `@tanstack/ai#ai-core/locks` |
| Non-TanStack backend connection | `@tanstack/ai#ai-core/custom-backend-integration` |
| Diagnostic logging | `@tanstack/ai#ai-core/debug-logging` |

Use `npx @tanstack/intent@latest load <skill>` with the selected identifier. If a capability belongs to a companion package, install or change dependencies only when the user has requested that capability, then rerun Intent discovery.

## API Boundaries

- TanStack AI is not the Vercel AI SDK. Use the current TanStack APIs described by Intent rather than translating familiar Vercel names.
- Keep server chat and provider code in server-only modules. Never expose provider credentials or secret model configuration to the browser bundle.
- Use the framework-specific TanStack AI client package for React hooks. Do not import client internals directly.
- Use TanStack's stream-to-response helpers instead of manually formatting SSE.
- Use TanStack AI middleware for lifecycle events, analytics, logging, and tracing.
- For isomorphic tools, provide the server implementation to the server chat call and the client implementation through the current client tool helper.
- Treat model names, adapter options, and provider capabilities as version-sensitive. Confirm them from the loaded Intent skill and installed package types.

## Verification

Test the real stream and event sequence, not only the final text. Exercise abort and error behavior, tool validation and approvals when present, structured-output validation when present, and confirm that secrets are absent from client bundles and serialized responses.
