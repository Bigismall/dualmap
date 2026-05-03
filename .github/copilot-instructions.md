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
