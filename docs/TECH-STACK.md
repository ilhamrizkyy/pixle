# TECH-STACK.md — Stack & architecture

> How the pieces fit. Guiding rule: **decouple the icon engine from the
> presentation**, so the toy can start simple (DOM/CSS-3D) and level up to
> Three.js without touching the logic.

## The one architectural rule

Two layers with a hard boundary:

- **Engine (pure TypeScript, no rendering):** the `IconDef` model + every
  operation — fill, clear, drag-fill, mirror, flip, rotate, undo/redo, HSL color
  math, SVG/PNG export, SVG import. Fully unit-testable. Knows nothing about
  DOM / Canvas / WebGL.
- **Presentation:** renders the engine's state and forwards input to it. Freely
  swappable/upgradable.

This boundary is what lets the composer ship as DOM now and become a real 3D toy
later — a presentation swap, not a rewrite.

## Foundation (all phases)

- **Next.js (App Router) + TypeScript + Tailwind.** Next hosts the public
  gallery / Guide / Resources (static, fast, SEO), the API routes for owner
  auth + save, **and** the composer canvas. A Three.js canvas mounts inside a
  Next page with no friction. **Next.js is not in tension with Three.js/anime.js
  — it's the platform they run on.** The earlier worry that "Next.js won't work"
  is a misconception: it stays; the 3D/animation are added *inside* it.
- **Zustand** — composer editor state (grid, color, tools, history). Light, and
  plays cleanly with the engine boundary.
- **culori** — color conversions (HSL↔hex), nearest-color, contrast checks.
  Replaces the prototype's hand-rolled math.
- **Vercel** — hosting.

## Composer experience layer (Phase 3, stageable)

- **React Three Fiber (Three.js) + drei** — the real 3D "real-world" toy: actual
  depth, material/lighting on the blue frame, knobs that turn in 3D, a screen
  with a genuinely recessed material (this is what finally fixes the snub-in).
  - **Approach:** keep the 11×11 editing as a robust DOM/SVG grid overlaid on the
    screen (drei `Html`) **or** raycast a subdivided plane — either way the
    **engine stays the source of truth** and keyboard/a11y keep working. Never
    trap editing inside a canvas with no DOM fallback.
  - **Staging:** ship a polished **DOM + CSS-3D** toy first (Phases 2–3), then
    upgrade the shell to R3F. Because of the engine boundary, logic is untouched.
- **anime.js** (your pick) — timeline animation: knob inertia/settle, button
  press, the left→right erase sweep, view transitions. *(Framer Motion is the
  more React-idiomatic alternative — pick one, don't run both.)*

## Icon pipeline

- **SVGO** — optimize every exported/stored icon.
- **SVGR** — generate React components from the set for the future npm package.
- A small **build script** turns the registry → package + sprite sheet +
  (later) web font.

## Owner auth + data

- v1: **Supabase** (Auth + Postgres + Storage) — gate the composer to the owner
  and persist saved icons; the public gallery reads a published registry.
  *Alternative:* keep it Git-native and commit new icons via **Octokit** (GitHub
  API) — simpler infra, rougher UI save.
- **idb-keyval** (IndexedDB) — local composer drafts that survive a refresh.

## Search & quality

- **Fuse.js** — fuzzy gallery search once the set grows.
- **Vitest** — unit-test the engine (transforms, import/export, color).
- **Playwright** — a couple of composer/gallery smoke tests.

## Layer → tool → phase

| Layer                         | Tool                                   | Phase        |
|-------------------------------|----------------------------------------|--------------|
| App shell / routing / hosting | Next.js, TS, Tailwind, Vercel          | 0            |
| Icon engine                   | plain TS (+ culori, Zustand)           | 1–2          |
| Composer UI (DOM/CSS-3D)      | React + CSS                            | 2–3          |
| 3D toy                        | React Three Fiber / Three.js, drei     | 3 (stretch)  |
| Animation                     | anime.js                               | 3            |
| Icon pipeline                 | SVGO, SVGR, build script               | 3–4          |
| Owner auth + save             | Supabase (or Octokit)                  | 3            |
| Local drafts                  | idb-keyval                             | 2            |
| Search                        | Fuse.js                                | 1 (or later) |
| Testing                       | Vitest, Playwright                     | 2–4          |

## Honest minimum for v1

**Next.js + TS + Tailwind + Zustand + culori + SVGO + Supabase (auth).**
React Three Fiber and anime.js are the **experience layer** — high value, but
stage them so they never block the ship date. Everything else is "add it when
the need actually shows up."
