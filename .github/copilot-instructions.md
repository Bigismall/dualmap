# Copilot Instructions for dualmap

## Purpose

Dualmap is a side-by-side map browser. The left side is Leaflet/OSM, the right side is an embeddable provider map, and both views are synchronized.
Application state is URL-driven (lat/lng/zoom/layer/type/layout and optional square bounds).

Start with [README.md](../README.md) for product context.

## Commands

```bash
npm run dev         # Vite dev server
npm run build       # Type-check + production build
npm run lint        # Biome lint (auto-fix)
npm run format      # Biome check + write
npm run type-check  # TypeScript only
```

There are currently no tests.

## Key Files

- [src/main.ts](../src/main.ts): composition root; wires Scene, OSM map, right map factory, and radio groups.
- [src/Map.class.ts](../src/Map.class.ts): base map classes (`MapFrame`, `MapObserver`, `MapPublisherObserver`).
- [src/Providers.ts](../src/Providers.ts): iframe provider implementations and `OsmFrame` (Leaflet publisher).
- [src/MapFactory.class.ts](../src/MapFactory.class.ts): maps `MapType` values to provider classes.
- [src/types.ts](../src/types.ts): core domain types, guards, and publisher/observer interfaces.
- [src/url.ts](../src/url.ts): URL parsing/writing, including `sq[]` bounds format.
- [src/constants.ts](../src/constants.ts): defaults, key bindings, and required env var check.

## Architecture Notes

- No UI framework; direct DOM + class-based modules.
- Observer/publisher pattern is central:
  - `Scene` publishes keyboard events.
  - `OsmFrame` publishes map movement updates.
  - Right-panel provider frames observe updates and re-render iframe URLs.
- On map type/layout changes, the active right frame is destroyed and recreated.

## Conventions

- Naming:
  - Class files use `PascalCase.class.ts`.
  - Utility modules use `camelCase.ts`.
- Prefer explicit `.ts` import extensions to match the codebase style.
- Prefix DOM handles with `$` and use helpers from [src/utils/dom.ts](../src/utils/dom.ts).
- Use logging helpers from [src/utils/console.ts](../src/utils/console.ts) instead of direct `console.*`.
- Narrow URL/user input with guards (`isMapType`, `isLayerName`) from [src/types.ts](../src/types.ts).

## Common Pitfalls

- `VITE_GOOGLE_MAPS_API_KEY` is required at module load time (see [src/constants.ts](../src/constants.ts)); missing it throws immediately.
- URL contract matters: preserve query keys (`lat`, `lng`, `z`, `l`, `t`, `w`, `sq[]`) when changing state handling.
- For provider additions/changes, keep [src/types.ts](../src/types.ts), [src/Providers.ts](../src/Providers.ts),
  [src/MapFactory.class.ts](../src/MapFactory.class.ts), and radio options in [index.html](../index.html) aligned.

## Code Style Guidelines
- Answer all questions in the style of a friendly colleague.
- Answer in the same language as the question.
- Assume the user is already familiar with fundamental programming concepts. Focus on advanced topics and best practices.
- Provide answers aimed at people with an IT background and more than 15 years of programming experience.
- Prefer concise, direct answers with relevant code examples over lengthy explanations.
- Always consider error handling and edge cases in code suggestions
- Please provide code examples when necessary to clarify your answers.
- Avoid outdated or deprecated solutions. Stick to modern best practices.
- If a request is ambiguous, ask clarifying questions before providing an answer.
- Use TypeScript for all code examples unless otherwise specified.


## Code Review Guidelines (Pull Requests)

When reviewing Pull Requests, do not act as a syntax linter. We use Biome and strict TypeScript for formatting and static analysis. Instead, act as a **Staff Software Engineer with a strong product mindset**.

Your primary focus must be on **business logic, product impact, user experience, and system architecture**.

### 1. Code Review Persona & Philosophy
- **Focus on the "Why" and "What"**: Prioritize the business intent of the change. Is this the most robust way to solve the user's problem?
- **Avoid nitpicking**: Do not comment on formatting, minor style preferences, or things already covered by Biome/TypeScript.
- **Think about the big picture**: Consider how changes in one app or package affect the rest of the monorepo (especially mobile vs. web compatibility).
- 
### 2. Review Output Format
To make your reviews highly readable and professional, structure your PR feedback into three distinct sections:
1. 💡 **Product & UX Impact:** A brief summary of how this change affects the business or the user. Mention any potential risks or edge cases the developer might have missed.
2. ⚠️ **Critical & Architectural Issues (Blocking):** High-level concerns regarding state management, API compatibility, missing feature flags, broken tracking, or major logic bugs.
3. 🛠️ **Optimizations & Best Practices (Non-blocking):** Minor suggestions for clean code, performance (e.g., memoization), or reusability of Fireball design system components.
