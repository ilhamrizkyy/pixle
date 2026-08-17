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
- **OPEN QUESTION:** when a paint drag crosses an **already-filled** cell —
  overwrite it with the current color, or skip it and only fill empties?
  Default assumption = **overwrite**. Confirm with Ilham during build.

## D. Open decisions (need Ilham)

- **Safe area:** 9×9 vs 10×10 live area inside the 11×11.
- **Taxonomy:** fixed category list (~5–8) + tag scheme, owner-authored. Blocks
  the composer category dropdown and the gallery filter — lock early.
- **Gallery modal:** exact contents / actions.
- **Auth:** owner-gate approach (Supabase recommended) + the owner allowlist.
- **Resources page:** contents.
- **Import scope:** v1 only guarantees round-tripping the tool's own export
  format; behavior for arbitrary external SVGs is undefined.

## E. Gallery — future explorations (post-v1)

Copy-as (JSX / React component / data URI); multi-select + bulk download;
favorites; recently-added; keyboard grid navigation; shareable links;
collections; Fuse.js fuzzy search; pagination / virtualization as the set grows.
The gallery has the most room to grow — treat it as an ongoing surface.

## F. Reminder

**Access control is the #1 rule.** Public browses; only the owner creates. Never
ship a publicly reachable composer. Public contribution + curation are a future
phase.
