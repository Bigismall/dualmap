# Copilot Instructions for dualmap

## Project Overview

Dualmap ([dualmaps.eu](https://dualmaps.eu)) is a side-by-side map browser that renders a Leaflet/OSM map (left) and an embeddable map (right — Google Maps, Street View, Bing, Wikimapia, Waze, ADS-B Exchange, OSM Buildings) with synchronized viewports. State (lat/lng/zoom/layer/map type/split proportion) is persisted in the URL query string.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc + vite build (type-check then bundle)
npm run lint         # biome lint --fix --verbose ./src
npm run format       # biome format --write --verbose ./src
npm run type-check   # tsc --noEmit
```

There are no tests.

## Architecture

The app uses a hand-rolled Observer/Publisher pattern with **no UI framework** — plain DOM manipulation only.

```
main.ts                         ← Composition root; wires everything together
  ├── Scene (Publisher)         ← Global keydown publisher
  │     ├── → OsmFrame          ← "2" key: import Google Maps URL
  │     └── → Axis              ← "1" key: toggle crosshair overlay
  ├── OsmFrame (Publisher+Observer)  ← Leaflet map (left panel)
  │     └── → ActiveMap         ← Receives MoveMap; updates iframe src
  ├── MapFactory                ← Creates right-panel map by MapType string
  └── RadioGroup (×3)           ← Map type / OSM layer / layout proportion
```

**Data flow:** Leaflet map moves → `OsmFrame` publishes `MoveMap{lat,lng,zoom}` → `ActiveMap.update()` → sets iframe `src` to new provider URL + updates query string.

**Inheritance chain for providers:**
```
MapFrame (abstract)
  └── MapObserver               ← iframe-based right-panel maps
        └── GoogleMapsFrame, BingMapsFrame, WazeFrame, etc.
  └── MapPublisherObserver      ← Publisher + Observer
        └── OsmFrame            ← Leaflet left-panel map
```

All shared types/interfaces (`MapType`, `LayerName`, `MapOptions`, `Observer`, `Publisher`, `Message`) live in `src/types.ts`. All providers (iframe URL builders) live in `src/Providers.ts`.

## Key Conventions

**File naming:**
- Classes: `PascalCase.class.ts` (e.g., `MapFactory.class.ts`, `Scene.class.ts`)
- Utilities/modules: `camelCase.ts` (e.g., `url.ts`, `layers.ts`, `constants.ts`)

**Imports:** Use explicit `.ts` extensions (e.g., `import { X } from './Foo.ts'`).

**DOM handles:** Prefix element variables with `$` (e.g., `$element`, `$layout`). Use `$`/`$$` aliases from `src/utils/dom.ts` instead of `querySelector`/`querySelectorAll`.

**Logging:** Use `log`/`warn`/`fault` from `src/utils/console.ts` — they no-op in production (`import.meta.env.PROD`). Do not use `console.log` directly.

**Type guards:** Use the `isLayerName()` / `isMapType()` guard pattern from `src/types.ts` when narrowing string inputs to domain types.

**Environment variables:** `VITE_GOOGLE_MAPS_API_KEY` must be set at build time; it's read in `src/constants.ts` and throws at module load if missing.

## Code Style (Biome)

- **Spaces** for indentation, **120-character** line width, **single quotes** for strings
- All Biome recommended rules enabled except `noExplicitAny` (disabled — explicit `any` is allowed)
- TypeScript: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

## Adding a New Map Provider

1. Add a new value to the `MapType` union in `src/types.ts`
2. Update the `isMapType()` guard in `src/types.ts`
3. Implement a new class extending `MapObserver` in `src/Providers.ts` with a `render(options)` method that returns an iframe URL string
4. Register it in `MapFactory.class.ts`
5. Add a radio option in `index.html`
