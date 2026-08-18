# BACKLOG.md — Fixes, features, open questions

> Working list for the build. Group A are polish carry-overs from the v9
> prototype; the rest are features, decisions, and reminders.

## A. Polish fixes (from v9)

1. **Bezel too thick** — the rim around the screen (especially the bottom) is
   too fat. Thin it to a slim recessed frame, even all around.
2. **Snub-in still looks off** — the recessed screen reads slightly wrong.
   Refine the inset-shadow geometry; the true 3D screen (Phase 3, R3F) should
   resolve it fully.
3. **Dock too thick** — reduce the bottom dock's height/padding.
4. **Knobs not at the corners + too small** — move both knobs fully to the true
   bottom-left/right corners, overlapping the frame edge like the real toy, and
   enlarge them.
5. **Remove the pixel count** — drop the `x/121` filled-cell counter from the
   dock. Not needed.

## B. Import placement

- **Move Import into the composer dock** (owner-only). It's a creation action,
  not a global page feature — remove it from the top nav. (Reflected in
  DESIGN.md / INTERACTION.md.)

## C. New feature — drag-fill

- Press a cell and **drag to auto-fill** across cells (continuous paint). Mode is
  set on press: start empty → paint the current color; start filled → erase.
- **RESOLVED 2026-08-18 — overwrite.** A paint drag crossing an already-filled
  cell **overwrites** it with the current color. This matches the v9
  prototype's own behavior (`applyCell` assigns unconditionally), so it is what
  the tool has always done.

## D. Decisions

**Resolved**
- **Safe area — 9×9**, advisory not enforced. The only inset that centres on an
  odd grid; 10×10 would sit off-centre. Seeds all respect it (tested).
- **Taxonomy — 6 categories:** interface, media, arcade, system,
  communication, nature. Closed TS union.
- **Naming — kebab-case** for `id`, `name`, and every tag, validated at module
  load.
- **Gallery modal:** large preview, name, category, tags, Copy SVG / Download
  SVG+PNG / Copy name, plus a selectable SVG field as the clipboard fallback.
- **Resources page:** get-the-icons / packages / design tools / learn /
  license, modelled on Lucide's and Phosphor's. Planned items are labelled and
  deliberately unlinked.
- **Colour model:** the gallery renders **single-color**, always. Duotone is
  parked (see G).
- **Exports follow display settings** — colour, flip, rotation, and padding all
  travel with a copy or download.
- **Owner CRUD:** the owner gets full create/read/update/delete, with two
  constraints — **`id` is immutable once published** (it is the export filename
  and future package key), and **delete is soft** (a status flag), so an id is
  never recycled into a different drawing.

**Still open**
- **Auth:** Supabase recommended (smaller blast radius than a repo-write
  token). Parked — see G.
- **Import scope:** v1 only guarantees round-tripping the tool's own export
  format; behavior for arbitrary external SVGs is undefined.
- **Departure Mono:** font files not yet supplied; JetBrains Mono stands in.

## E. Gallery — future explorations (post-v1)

Copy-as (JSX / React component / data URI); multi-select + bulk download;
favorites; recently-added; keyboard grid navigation; shareable links;
collections; Fuse.js fuzzy search; pagination / virtualization as the set grows.
The gallery has the most room to grow — treat it as an ongoing surface.

## G. Parked (deliberate, not forgotten)

- **Duotone / monotone modes.** Nucleo- and Phosphor-style two-tone icons.
  Safe to park because the planned approach derives roles from an icon's
  distinct cell colours, so nothing built now becomes wrong — the composer
  keeps painting real colours, and roles appear when the feature does. Cost of
  resuming is re-authoring a few seeds with a second layer.
- **Supabase auth + persistence.** Recommendation stands (magic link, public
  sign-ups disabled, owner allowlist in a server-only env var, RLS on writes,
  and the authorization check in the route handler — never middleware alone).
- **`/guide` interface.** Content approved, interface deferred to a later pass.

## F. Reminder

**Access control is the #1 rule.** Public browses; only the owner creates. Never
ship a publicly reachable composer. Public contribution + curation are a future
phase.
