# Frontend Implementation Plan — Ocean Digital Twin (SIH PS 26067)

> **Product:** INCOIS Ocean Digital Twin & Observation Explorer
> **Pitch:** Google Maps for the ocean — surface, cutaway, and dive through depth to compare what the model predicts with what instruments actually observed.
> **Scope of this doc:** Frontend only — visual identity, architecture, component plan, and a day-by-day build sequence that fits inside your 10–15 day window.

---

## 0. Why this doc exists

You said: no generic-AI-shitty website. That's a design failure mode, not a tooling one — it happens when a build starts from a component library's defaults instead of from the subject. Ocean instrumentation, ROV consoles, bathymetric charts, and mission-control HUDs have their own visual language. This plan is built from *that* world, not from "SaaS dashboard #4,812."

Two rules carry through the whole plan:
1. **The 3D ocean is the interface, not a widget inside the interface.** Every panel floats over it; nothing boxes it in.
2. **Depth is the story.** Surface → Cutaway → Dive isn't a feature, it's the spine the whole UI hangs off. If a component doesn't serve that spine, cut it.

---

## 1. Visual Identity — Design Tokens

### 1.1 Color — "Instrument palette," not "dashboard palette"

Named, deliberate, derived from actual oceanographic instrument displays (CTD readouts, bathymetric charts, ROV pilot consoles) — not the templated cream/serif or near-black/neon-accent looks AI tools default to.

| Token | Hex | Role |
|---|---|---|
| `abyss` | `#050B14` | Base canvas background — deeper than pure black, has a blue cast |
| `deep-panel` | `#0B1D2E` | Glass/HUD panel fill (used at 70–85% opacity with blur) |
| `thermocline` | `#1C5C6B` | Structural teal — dividers, inactive states, map graticule |
| `biolume` | `#4CE0D2` | Primary accent — active state, selected float, primary CTA. Named for bioluminescent plankton, not "brand teal" |
| `instrument-amber` | `#E8A33D` | Data-forward accent — live readouts, warnings, anomaly flags |
| `coral-delta` | `#FF6B5B` | Negative/critical delta values, alerts — reserved, used sparingly |
| `foam` | `#E9F1F3` | Primary text — cool off-white, not stark `#FFFFFF` |
| `foam-dim` | `#8FA5AC` | Secondary text, captions, units |

Rule: `biolume` and `instrument-amber` never appear in the same component doing the same job — biolume = *you selected this*, amber = *the ocean is telling you this*. That distinction is what keeps the UI legible once profiles, deltas, and controls are all on screen together.

### 1.2 Typography — three roles, not two

- **Display / wordmark / section headers:** `Space Grotesk` — geometric, slightly technical, has enough personality to carry a hero without being a "startup serif."
- **Body / UI labels:** `Inter` — quiet, does its job, gets out of the way.
- **Data / coordinates / readouts:** `IBM Plex Mono` — every lat/lon, depth value, temperature, and delta renders in this. This is the single biggest lever for "looks like a real instrument, not a website." Tabular numerals, fixed width, always.

Type scale is built around the mono face's character width so data columns actually align — depth profile tables and the model-vs-observation comparison live or die on that.

### 1.3 Layout concept — "console," not "dashboard"

```
┌─────────────────────────────────────────────────────────────────┐
│  ⌁ OCEAN DIGITAL TWIN        12.4°N 78.3°E   1,240 m   14:32 UTC │ ← top bar: wordmark + live readout, not a nav menu
├───────────┬─────────────────────────────────────────┬───────────┤
│  LAYERS   │                                         │  DEPTH    │
│  glass    │                                         │  RAIL     │
│  panel,   │        FULL-BLEED 3D OCEAN               │  (the     │
│  floats   │        (Cesium canvas, edge to edge)     │  signature│
│  over the │                                         │  element) │
│  globe    │                                         │           │
│           │                                         │           │
├───────────┴─────────────────────────────────────────┴───────────┤
│  ═══●══════════════════ TIME ══════════════════●═══  ▶ ⏸ ⏵      │ ← bottom timeline scrubber
└─────────────────────────────────────────────────────────────────┘
       ↑ when a float is clicked, a right-side drawer slides over
         the depth rail: profile chart + model-vs-obs comparison
```

No card grid, no dashboard tiles, no hero-with-gradient-blob. Panels are translucent glass over the live globe so the ocean is always visible underneath the UI — reinforces "you are looking at the ocean," not "you are looking at a website about the ocean."

### 1.4 Signature element — the Depth Rail

This is the one thing the product should be remembered by, and it directly encodes the PS's core UX insight (slide 13: "just zooming down makes depth hard to understand").

It's a persistent vertical control on the right edge, always visible, that is simultaneously:
- a **depth slider** (drag to set current depth)
- a **mode switch** with three physical-feeling detents: `SURFACE` → `CUTAWAY` → `DIVE`
- a **live readout** of what's at the current depth (temperature, nearest float count)

State transitions:
- **Surface** — standard globe view, colored surface field (SST, chlorophyll), Argo floats shown as flat markers.
- **Cutaway** — camera tilts, a vertical soil-profile-style slice opens beneath the clicked region showing the model field as a color-graded cross-section by depth. This is the "what's happening vertically" moment.
- **Dive** — camera drops below the surface plane into the water column itself; the float being inspected is tracked in 3rd-person as its recorded profile animates past the camera (Innovation #2 from the analysis, "Dive Replay"). Fog/particle density increases with depth for a felt sense of pressure and darkness.

Nothing about this is decorative — each mode maps to a distinct scientific question a forecaster actually asks, per the PS analysis. That's what keeps it from being a gimmick.

### 1.5 Motion — orchestrated, not scattered

One real animated sequence (the Surface→Cutaway→Dive camera transition — eased, ~1.2s, camera + fog + UI panels choreographed together) carries more weight than a dozen hover micro-interactions. Elsewhere: motion is restrained — panel enter/exit, marker pulse on new data, nothing ambient or looping. `prefers-reduced-motion` collapses the camera transition to a hard cut with a fade.

---

## 2. Tech Stack (frontend)

Matches what's already in your research deck (slide 15) — this plan just makes each choice concrete for implementation.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | File-based routing is irrelevant here (this is basically a single-page console) but SSR-free static export keeps hosting trivial for a hackathon judge to open a link |
| 3D / Geospatial | **CesiumJS** (via `resium` React bindings) | Earth-native camera, coordinate system, and time dimension are first-class — matches your core UX, don't fight a general-purpose engine (Three.js) into doing globe/geo math it wasn't built for |
| Custom shaders | **Three.js**, mounted only for the depth-slice / volume-render layer inside Cesium's scene | Cesium's material system can't do a scientific colormap volume slice out of the box; this is the one place raw WebGL earns its complexity |
| Styling | **Tailwind CSS** + a small custom token layer (`tailwind.config.ts` extended with the palette above) | Fast iteration, but the tokens above are what stop it looking like default Tailwind |
| Component primitives | **shadcn/ui**, heavily reskinned | Use it for accessibility/behavior (dialogs, sliders, popovers) only — every visual surface gets the console treatment, none of shadcn's default look ships as-is |
| Charts | **Recharts** (depth profile, time series) — evaluate **Plotly.js** only if you need dual-axis model-vs-obs overlays it handles better | Depth-vs-variable and model-vs-observation charts are the analytical payoff of a float click; keep them fast and simple |
| State | **Zustand** | One small global store beats prop-drilling through a console this deep; no need for Redux's ceremony |
| Data fetching | **TanStack Query** | Caches model-field and profile responses, handles loading/error states for every depth/time change without hand-rolled fetch logic |
| Icons | **Lucide React** | Consistent stroke weight fits the instrument-panel line language |

**Not using, deliberately:** Mapbox GL (2D-first, wrong tool for depth navigation), a heavy 3D scene framework like `react-three-fiber` as the *primary* engine (Cesium already owns the scene graph — mixing two full scene-graph owners is a maintenance trap).

### 2.1 Cesium + Three.js — the technical note this plan hinges on

Why two engines at all, stated plainly: your core UX loop — find a region on Earth, click a float at a real coordinate, see it in context — is Cesium's entire reason to exist (ellipsoid math, camera easing to a lat/lon, tiled imagery). Rebuilding that in Three.js is real, avoidable engineering cost in a 10–15 day window. The one place raw shader work is unavoidable — the volumetric depth slice and the underwater dive fog/particle work — is also the one place Cesium gives you nothing out of the box. So Cesium stays primary; Three.js is mounted only for that one layer.

**Where each engine wins, concretely:**

| Need | Winner | Why |
|---|---|---|
| Globe navigation (pan/zoom/rotate/fly-to over real coordinates) | Cesium | Camera controller, ellipsoid math, terrain-following are built in |
| Base imagery (bathymetry tiles, SST overlays as map layers) | Cesium | Imagery provider system streams/tiles this natively |
| Argo float markers at real lat/lon, clickable, clustering | Cesium | Entity API handles geospatial billboards/points out of the box |
| Time-dynamic animation (play the ocean forward through time) | Cesium | Clock/timeline system is core to Cesium, not bolted on |
| Depth-sliced volumetric rendering (Cutaway/Dive) | Three.js | Custom scalar-field ray marching / volume shader — Cesium has no volume renderer |
| Ocean surface material (realistic water shading, wave displacement) | Three.js | Cesium's water effect is a basic ground-primitive shader; Three.js gives full shader control |
| Below-surface dive camera with fog/particle density by depth | Three.js | Custom fog falloff, particle systems, post-processing — outside Cesium's scope |

**Integration path:** Cesium officially supports mixing custom WebGL/Three.js content into its scene via its primitive / post-process API — this is a documented integration path, not a hack (worth a quick doc check against the current Cesium version you pin, since API surfaces shift release to release).

**Where the real risk sits:** getting Three.js geometry to sit correctly in Cesium's coordinate frame (ellipsoid-relative, not flat-world) and stay in sync with Cesium's camera during the Surface→Cutaway→Dive transition is nontrivial — it's the single highest-uncertainty piece of the whole plan. Two ways to de-risk it, both folded into Section 7 below:

1. **Spike it on Day 1, not Day 3–4.** A 2-hour throwaway prototype — one Cesium scene, one Three.js-rendered colored box positioned at a real lat/lon/depth, staying locked to that coordinate as the Cesium camera moves — tells you fast whether the integration is smooth or a fight. Do this before any other 3D work is scheduled, so the rest of the plan can react to what you learn.
2. **Fallback plan if the spike goes badly:** simulate the effect in pure Cesium instead of abandoning the visual language. A `ClippingPlaneCollection` on Cesium primitives can fake a cutaway slice without true volumetric rendering, and a scripted camera fly-down (no separate Three.js scene) can simulate the "dive" feel. It's less visually rich than real volume rendering, but it's a safe, fully-Cesium fallback that doesn't blow the timeline — and it still honors the "depth is the story" principle from Section 0, just with a cheaper renderer behind it.

The rest of this plan assumes the spike succeeds. If it doesn't, swap Phase 3's `DepthSliceShader` deliverable for the `ClippingPlaneCollection` fallback and keep everything else — state shape, component tree, and phase sequencing — unchanged.

---

## 3. Information Architecture

This is a single operational console, not a multi-page site. One route, one persistent state machine.

```
/                          → the console (everything lives here)
/embed  (optional, stretch) → chromeless version for demo screens
```

Screen regions (all children of one `<OceanConsole>` shell):

1. **Top bar** — wordmark, live cursor readout (lat/lon/depth/time under mouse), search-by-region
2. **Globe canvas** — Cesium viewport, full-bleed, z-index base
3. **Layers panel** (left, collapsible) — variable toggle (Temperature/Salinity/Currents), observation-source toggles (Argo/Glider/Buoy), colormap + opacity controls
4. **Depth rail** (right, persistent) — the signature element, section 1.4
5. **Timeline scrubber** (bottom) — date range, play/pause, speed control
6. **Inspector drawer** (right, slides in over depth rail on float click) — profile chart, model-vs-observation table, "Compare with Model" and "Replay Dive" actions
7. **Toast/status layer** — data loading, anomaly flags, "out of model coverage" notices

---

## 4. Component Architecture

```
app/
  layout.tsx
  page.tsx                       → mounts <OceanConsole/>

components/
  console/
    OceanConsole.tsx              → shell, layout grid, region composition
    TopBar.tsx
    LiveReadout.tsx                → mono-font lat/lon/depth/time under cursor

  globe/
    CesiumStage.tsx                → Cesium viewer init, camera controller
    ModelFieldLayer.tsx            → renders surface/cutaway/volume field from API
    ArgoMarkerLayer.tsx            → float/glider/buoy markers, clustering at zoom-out
    DepthSliceShader.tsx           → Three.js volume/cutaway render, mounted into Cesium scene
    CameraChoreographer.ts         → non-visual: owns Surface/Cutaway/Dive camera easing

  depth-rail/
    DepthRail.tsx                  → the signature element (section 1.4)
    DepthModeToggle.tsx            → Surface/Cutaway/Dive detents
    DepthReadout.tsx                → live value at current depth

  layers-panel/
    LayersPanel.tsx
    VariableSelect.tsx             → Temperature / Salinity / Currents
    ObservationToggles.tsx         → Argo / Glider / Buoy / CTD
    ColormapControl.tsx            → colormap + min/max + opacity

  timeline/
    TimelineScrubber.tsx
    PlaybackControls.tsx

  inspector/
    InspectorDrawer.tsx
    FloatSummaryCard.tsx           → platform ID, last surfaced, QC status
    DepthProfileChart.tsx          → Recharts, T/S vs depth
    ModelVsObservationTable.tsx    → mono-font aligned columns, delta highlighting
    DiveReplayButton.tsx           → triggers CameraChoreographer dive sequence
    AnomalyBadge.tsx                → instrument-amber / coral-delta flag

  shared/
    GlassPanel.tsx                  → the one component every floating panel composes from
    MonoValue.tsx                   → styled numeric readout (unit-aware)
    LoadingScan.tsx                  → data-loading state styled as an instrument sweep, not a spinner

lib/
  store/
    useConsoleStore.ts              → Zustand: selectedVariable, depth, time, mode, selectedFloatId
  api/
    queries.ts                      → TanStack Query hooks (modelField, floatProfile, matchup)
    types.ts                        → shared TS types mirroring backend schema
  cesium/
    colormaps.ts                     → scientific colormap definitions (avoid rainbow/jet — use perceptually uniform: viridis/thermal)
```

`GlassPanel` and `MonoValue` are the two components that most determine whether this looks bespoke or templated — spend real time on them early, everything else composes from them.

---

## 5. State Shape (Zustand)

```ts
interface ConsoleState {
  variable: 'temperature' | 'salinity' | 'currents';
  depth: number;                 // meters, drives the depth rail + field query
  time: string;                  // ISO timestamp, drives the field + playback
  mode: 'surface' | 'cutaway' | 'dive';
  activeObservationTypes: Set<'argo' | 'glider' | 'buoy'>;
  selectedFloatId: string | null;   // drives the inspector drawer
  colormap: { name: string; min: number; max: number; opacity: number };
  playback: { isPlaying: boolean; speed: number };
}
```

Keep this store thin — anything derivable (e.g. the actual model field values) belongs in TanStack Query's cache, keyed off `(variable, depth, time)`, not duplicated into Zustand.

---

## 6. Data Contract (frontend's expectations of the backend)

Frontend doesn't touch NetCDF directly — per the PS analysis, that's correctly a backend/API concern. Frontend needs three endpoint shapes:

```
GET /api/field?variable=temperature&depth=100&time=2026-08-01T00:00Z&bbox=...
  → { grid: number[][], lat: number[], lon: number[], colorRange: [min,max] }

GET /api/observations?type=argo&bbox=...&time=...
  → [{ id, lat, lon, lastSurfaced, platform, qcStatus }]

GET /api/profile/{floatId}
  → { depths: number[], temperature: number[], salinity: number[], qc: string[] }

GET /api/matchup/{floatId}
  → { depths: number[], observed: number[], model: number[], delta: number[] }
```

Build the frontend against a **mocked version of these four endpoints first** (static JSON fixtures matching this shape). This decouples frontend progress from backend/data-pipeline progress entirely — critical in a 10–15 day window where both sides are being built in parallel.

---

## 7. Build Phases (mapped to your 10–15 day plan)

Your deck already allocates Days 1–2 to research/architecture and Days 3–4 to "3D foundation." This is the frontend-specific breakdown of that plan.

### Phase 0 — Setup + integration spike + fixtures (Days 1–2)
- **Day 1, first thing: the Cesium+Three.js spike** (see Section 2.1) — one Cesium scene, one Three.js box locked to a real lat/lon/depth, camera moved to confirm it stays put. This is scheduled before scaffolding polish because it's the one result that can change Phase 3's scope; everything else in this phase can proceed in parallel or right after.
- Next.js + TS + Tailwind scaffold, token config from Section 1
- Build the four mock API routes from Section 6 as static fixtures
- `GlassPanel` and `MonoValue` primitives built and reviewed against the design tokens before anything else — this is the "does it look bespoke" checkpoint

### Phase 1 — 3D foundation (Days 3–4)
- `CesiumStage` mounted, Indian Ocean camera framing, base imagery layer restyled to match the palette (Cesium's default globe reads as "generic map demo" — recolor water/land to the instrument palette)
- Top bar + live cursor readout wired to camera position
- Basic pan/zoom/rotate feel tuned — this is the first thing anyone touches, worth polishing early

### Phase 2 — Model field + layers panel (parallel with backend Days 5–6)
- `ModelFieldLayer` rendering mocked temperature field as a colored surface overlay
- `LayersPanel` with variable + colormap controls wired to the Zustand store
- Perceptually-uniform colormap (viridis/thermal), not rainbow/jet

### Phase 3 — Depth rail + cutaway (the signature piece — give it real time)
- `DepthRail` UI built and wired to `depth` state
- `CameraChoreographer` Surface↔Cutaway transition — this is the highest-risk, highest-payoff component; timebox it and have a fallback (a hard cut instead of the eased transition) if the shader work runs long
- Branch on the Day 1 spike result from Phase 0:
  - **Spike succeeded:** build `DepthSliceShader` as a true Three.js volume/cutaway render, first pass using mocked field data, mounted into the Cesium scene per Section 2.1's integration path
  - **Spike struggled:** build `DepthSliceShader` as the pure-Cesium fallback instead — a `ClippingPlaneCollection` on Cesium primitives for the cutaway slice, plus a scripted camera fly-down for the dive feel. Same component name, same place in the tree, cheaper renderer underneath — nothing downstream (state shape, inspector, timeline) needs to know which path was taken

### Phase 4 — Observations + inspector (parallel with matchup backend)
- `ArgoMarkerLayer` with click handling
- `InspectorDrawer` + `DepthProfileChart`
- `ModelVsObservationTable` with delta highlighting (amber/coral)
- `DiveReplayButton` → triggers the Dive camera mode with the selected float's recorded path

### Phase 5 — Timeline + playback
- `TimelineScrubber`, play/pause, speed control
- Wire real time range once backend confirms available date coverage

### Phase 6 — Integration + polish (final days)
- Swap mock fixtures for real API calls (should be close to zero-friction if Section 6's contract held)
- Loading states (`LoadingScan`, not spinners), empty states, "out of model coverage" messaging — per the frontend-design skill's guidance, these are direction moments, not afterthoughts
- Responsive pass down to a laptop-judge screen size (this is a console, not a mobile product — target 1280px+ deliberately, don't burn time on phone layouts unless you have slack)
- Reduced-motion fallback for the camera choreography
- Screenshot/record the exact demo flow from the PS analysis (Section 19 of your analysis doc) end to end, fix whatever breaks in that specific path first

---

## 8. Non-Negotiable Checklist (what keeps this off "generic AI website")

- [ ] Cesium's default blue-marble imagery has been recolored — nothing ships with stock globe styling
- [ ] Every numeric readout uses `MonoValue` / `IBM Plex Mono` — no numbers rendered in the body sans font
- [ ] No card-grid dashboard anywhere — panels are glass overlays on the live globe, always
- [ ] Colormaps are perceptually uniform (viridis/thermal/cividis) — never rainbow/jet
- [ ] The Surface→Cutaway→Dive transition is the one orchestrated animation; everything else is restrained
- [ ] Loading and empty states are written in the console's voice ("No model coverage at this depth" not a bare spinner)
- [ ] Palette check: nothing in the build resembles cream+serif+terracotta, or near-black+single-neon-accent, or a hairline-rule broadsheet layout — those are the three current AI-design defaults to avoid
- [ ] The Cesium+Three.js coordinate-sync spike (Section 2.1) ran on Day 1, and Phase 3 is scoped to whichever branch — real volume render or `ClippingPlaneCollection` fallback — the spike result pointed to

---

## 9. Open Assumptions (flag if wrong)

- Backend will expose the four endpoint shapes in Section 6, or close enough to adapt quickly
- Target is a single desktop-oriented console for a live judged demo, not a public multi-device product — this shapes the "skip heavy mobile work" call in Phase 6
- You're building against the MVP scope from your own "must have" list (temperature field, depth nav, Argo markers, click→profile, time control) — salinity/currents/gliders are should-have and slot into Phase 2/4 if time allows, not before

- Whether Phase 3 ships the true Three.js volumetric cutaway/dive or the `ClippingPlaneCollection` fallback is decided by the Day 1 spike (Section 2.1), not pre-committed here — this doc treats both as valid outcomes of the same plan, not a plan failure

If any of these are off, the phase sequencing in Section 7 is the part to adjust first.
