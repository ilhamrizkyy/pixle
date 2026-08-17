# PLAN.md — Timeline (target: under 1 month)

> Solo build with Claude Code. The v9 prototype already de-risks the hardest
> logic, so the month is mostly productionizing + the experience layer. Ranges
> are ~working days over ~4 weeks — slot them into your real calendar.

## Guardrails baked into the plan

- Public = gallery only. **The composer is owner-only** — build the gate no later
  than Phase 3, and never deploy it publicly reachable.
- The **engine is decoupled from presentation** from day one (see @TECH-STACK.md).
- The full **Three.js 3D toy is a stretch goal.** A polished DOM/CSS-3D composer
  is a valid v1 — protect the ship date over the 3D.

## Phase 0 — Foundation · Days 1–2

Goal: a deployable skeleton with the rules encoded.
- Next.js + TS + Tailwind repo; @DESIGN.md tokens as CSS variables; MIT LICENSE;
  CLAUDE.md at the repo root.
- Define the **IconDef** type + a small **engine** module (data + op stubs); seed
  ~6 icons in a static registry.
- Deploy an empty shell to Vercel.

Exit: repo builds green and deploys; tokens live; engine module compiles.

## Phase 1 — Gallery (public) · Days 3–8

Goal: the public product, read-only.
- Gallery: sidebar (Search; Display = size + Light/Dark; Categories + counts),
  icon grid, detail modal (Copy SVG / Download SVG+PNG / Copy name).
- Reads the static registry; responsive; empty/loading states; focus + a11y.
- Guide + Resources page shells; Contribute = "coming soon".

Exit: a stranger can browse, search, filter, and copy/download icons on desktop
and mobile.

## Phase 2 — Composer engine + DOM UI (owner build) · Days 9–16

Goal: a fully functional composer (DOM/CSS-3D) wired to the engine.
- Port v9 into engine + React: 11×11 grid, **drag-fill**, second-tap clear,
  multi-color **HSL picker** (2 knobs + saturation + hex + presets + eyedropper),
  transforms (mirror / flip / rotate), progressive **slide-to-clear**,
  undo/redo, metadata dock, Save, Export, **Import (in the dock)**.
- Apply the **polish fixes** (@BACKLOG.md A): thinner bezel, better snub-in,
  slimmer dock, corner knobs (bigger), remove the pixel count.
- idb-keyval drafts; Vitest on engine ops.

Exit: the owner can draw a multi-color icon end-to-end and it shows in the
gallery; engine tests pass.

## Phase 3 — Access + experience + content · Days 17–24

Goal: lock it down, make it feel real, finish content.
- **Owner auth gate** (Supabase) on the composer route — server-side, not a
  hidden button. Wire Save to persist.
- Experience layer: **anime.js** micro-interactions; begin the **R3F 3D toy**
  shell (stretch — if it slips, keep the polished CSS-3D toy).
- Fill in Guide + Resources; lock **taxonomy** + **safe area** with the owner.

Exit: composer is owner-only and persists; the toy feels tactile; content pages
are real.

## Phase 4 — Ship v1 · Days 25–30

Goal: production-ready launch.
- SVGO pipeline on stored icons; (optional) package/sprite build script.
- QA: Playwright smoke tests; a11y + reduced-motion pass; cross-browser/mobile.
- README; final sweep of @BACKLOG.md; deploy v1.

Exit: v1 live — public gallery + owner-only composer, MIT, documented.

## Milestones

| #  | Milestone                          | ~Day |
|----|------------------------------------|------|
| M1 | Deployable shell + engine stub     | 2    |
| M2 | Public gallery usable              | 8    |
| M3 | Composer functional (DOM)          | 16   |
| M4 | Owner-gated + content done         | 24   |
| M5 | **v1 launched**                    | 30   |

## Deferred (post-v1 — "make it better later")

Public **Contribute** flow + **curation mode** + backend; the full **Three.js**
toy if not reached in Phase 3; **npm package** + **web font**; gallery
enhancements (@BACKLOG.md E).

## Top risks

- **3D toy overruns** → mitigated: it's a stretch; CSS-3D ships if needed.
- **Auth/save scope creep** → keep v1 to a single-owner gate; real multi-user
  auth waits for the contribution phase.
- **Taxonomy indecision** blocks the composer category dropdown + gallery filter
  → lock a rough 5–8 category list early in Phase 2.
