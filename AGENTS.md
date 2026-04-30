<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.x. APIs, conventions, caching, routing, and file
structure may differ from your training data. When framework behavior matters,
read only the relevant guide in `node_modules/next/dist/docs/` before writing
code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BidRush Frontend Agent Guide

## Context Budget Rule

Do not preload every file under `docs/`, `rules/`, or
`node_modules/next/dist/docs/`.

Start from the user request, classify the work, then read the smallest relevant
source set. Prefer `rg` to find the exact section, and read narrow line ranges
instead of whole documents when possible.

## When To Read `docs/`

Use `docs/` for product and UX intent. Read it only when the task changes or
depends on user-facing behavior, information architecture, screen layout,
interaction design, copy tone, or visual hierarchy.

- Read `docs/frontend-ui-ux-guide.md` when building or changing auction lists,
  auction rooms, selling flows, auth screens, navigation, responsive layouts,
  status language, empty/loading/error states, or design tokens.
- Do not read `docs/frontend-ui-ux-guide.md` for mechanical refactors, build
  fixes, dependency updates, lint-only changes, or isolated utility functions
  unless the change affects visible UX.

If a rule references `docs/design.md`, check whether the file exists in this
frontend workspace first. If it is absent, use `docs/frontend-ui-ux-guide.md`
as the frontend product/UX source and mention the missing source only if it
blocks the task.

## When To Read `rules/`

Use `rules/` for implementation policy. Read only the rule file that matches
the task surface:

- `rules/nextjs-app-router.md`: route structure, App Router file conventions,
  Server/Client Component boundaries, `loading.tsx`, `error.tsx`,
  `not-found.tsx`, navigation, and route segment decisions.
- `rules/rendering-data.md`: data fetching, caching, Route Handlers, API
  clients, DTO mapping, snapshot plus WebSocket data flow, and cache
  invalidation.
- `rules/realtime-state.md`: WebSocket/STOMP behavior, auction event reducers,
  pending/accepted/rejected/outbid states, reconnection, timers, and chat
  event handling.
- `rules/ui-design-system.md`: colors, typography, Tailwind/CSS Modules,
  component styling, card rules, auction cards, bid panels, countdowns, and
  chat panels.
- `rules/forms-errors-auth.md`: forms, validation, Server Actions, expected
  errors, Problem Details mapping, auth redirects, permissions, and environment
  variables.
- `rules/performance-accessibility.md`: `next/image`, `next/font`, metadata,
  loading/streaming UX, accessibility, focus, `aria-live`, motion, Lighthouse,
  and layout shift.
- `rules/testing.md`: unit/component/E2E scope, Vitest, Playwright, WebSocket
  mocks, CI checks, and manual QA expectations.
- `rules/README.md`: read this only when you need the rule index, shared
  principles, or a review checklist across multiple areas.

Do not read all rule files by default. If a task spans multiple areas, read the
primary rule first, then add only the secondary rule needed for the next
decision.

## When To Read Next.js Docs

Read `node_modules/next/dist/docs/` only for Next.js behavior that can vary by
version or was changed in Next.js 16. Examples:

- async Request APIs: `params`, `searchParams`, `cookies()`, `headers()`, and
  `draftMode()`
- App Router file conventions and generated route types
- Route Handlers and route resolution
- Cache Components, `use cache`, `cacheLife`, `cacheTag`, `revalidateTag`, and
  `updateTag`
- Turbopack defaults, `proxy.ts`, image configuration changes, env/runtime
  config behavior, ESLint CLI migration, and other v16 upgrade notes

Do not read Next.js docs for purely product, styling, copy, or business-logic
tasks unless the implementation depends on a Next.js API.

## Practical Read Order

1. Read this `AGENTS.md`.
2. Inspect the files directly involved in the user request.
3. Read the smallest matching `rules/*` file only if policy is needed.
4. Read `docs/frontend-ui-ux-guide.md` only if product or UX intent is needed.
5. Read the specific Next.js 16 doc only if framework behavior is uncertain or
   version-sensitive.

When in doubt, search first:

```bash
rg -n "keyword" docs rules node_modules/next/dist/docs
```

Then open only the relevant file and section.
