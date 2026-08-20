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

- **three is PINNED to 0.182.0**, not on a caret range. `@react-three/fiber`
  9.7 (the current release) still constructs `new THREE.Clock()`, and three
  deprecated Clock in favour of Timer in r183 — so every newer three prints a
  deprecation warning we cannot fix from our own code. Nothing we use changed
  in r183–r185, so the pin costs nothing. **Unpin when R3F migrates to
  THREE.Timer**, and delete this note with it.
- **React Three Fiber (Three.js) + drei** — the real 3D "real-world" toy: actual
  depth, material/lighting on the blue frame, knobs that turn in 3D, a screen
  with a genuinely recessed material (this is what finally fixes the snub-in).
  - **Approach:** keep the 11×11 editing as a robust DOM/SVG grid overlaid on the
    screen (drei `Html`) **or** raycast a subdivided plane — either way the
    **engine stays the source of truth** and keyboard/a11y keep working. Never
    trap editing inside a canvas with no DOM fallback.
  - **Staging:** ship a polished **DOM + CSS-3D** toy first (Phases 2–3), then
    upgrade the shell to R3F. Because of the engine boundary, logic is untouched.
  - **Where it stands (2026-08-20):** the knobs and the screen's well are R3F;
    the frame, bezel and buttons are still CSS. Both meshes follow the same
    rule — they render form, never state. The knob draws a dial and reads an
    angle; the well draws a recess and reads nothing. Every control they sit
    under is DOM, so `useWebGL` returning false costs appearance only.
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
- **Playwright** — the composer's POINTER paths, which Vitest cannot reach:
  jsdom has no layout, so a synthetic pointerdown there proves a handler ran,
  not that it ran with the cell under the pointer. Two projects: `desktop`
  (mouse) and `touch` (iPhone 13, `hasTouch`), because a touch context sends
  `pointerType: "touch"`, no hover events, and the compact layout — three ways
  this breaks on a phone while every mouse test stays green. Runs against a
  production build on port 3100, so a dev server can stay up beside it, and so
  the dev overlay is not sitting over the toy's left knob.

  It is also the only place the 3D is actually *seen*: WebGL is unavailable in
  plain headless Chrome, which silently falls back to CSS.

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
