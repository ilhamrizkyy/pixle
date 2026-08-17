# CLAUDE.md — Project Constitution

> Claude Code reads this at the start of every session. It is the index and the
> guardrails. Detail lives in the linked docs — load them for the relevant work.

Load: @DESIGN.md · @INTERACTION.md · @TECH-STACK.md · @PLAN.md · @BACKLOG.md

---

## What this is

**PixlSet (working name)** — an open-source **pixel / 32-bit / arcade icon set**
plus an in-browser **composer** styled like an Etch A Sketch. Inspired by
Phosphor / Lucide / Nucleo; the differentiators are the composer and the pixel
niche. Licensed **MIT**.

## Non-negotiable rules

1. **ACCESS CONTROL — the most important rule.** In v1, **only the owner
   (Ilham) can reach the Create/composer and add icons.** The public may only
   browse the gallery (search / filter / view / copy / download) and read
   Guide / Resources. The composer route is **auth-gated to the owner**. Public
   contribution is a *future* phase, not v1. Do not ship a publicly reachable
   composer.
2. **Multi-color, baked colors.** Icons store a color per cell. A newly chosen
   color applies only to the **next** cells drawn; existing cells keep theirs
   (no retroactive recolor). Exports carry baked colors. There is **no**
   currentColor.
   - **Amended 2026-08-17 — gallery renders single-color.** The gallery
     **always** displays icons in exactly one color: a hex field recolors every
     filled cell of every icon, defaulting to #000000 in light / #ffffff in
     dark. There is no multi-color display state. It stays **display only** —
     stored `cells` are never modified, Copy/Download emit the icon's own baked
     colors, the modal discloses any difference, and the gallery color must
     never become a persisted property of an `IconDef`.
   - **Authoring consequence:** seed icons are authored in a **single color**
     and drawn as **outlines**, never as filled masses whose meaning depends on
     internal color contrast. See @DESIGN.md §3. The composer still supports
     per-cell color; the gallery simply does not render it.
3. **Grid state is the source of truth**, not SVG. An icon *is* its 11×11 cell
   data; SVG/PNG are render targets generated from it.
4. **Grid = 11x11 on viewBox "0 0 44 44"** (4 units per cell). Square pixels,
   rendered as normal anti-aliased vector. Intended sizes are multiples of 8,
   16px minimum.
5. **Decouple the icon engine from the presentation.** The data model + editing
   operations (fill, clear, mirror, flip, rotate, undo/redo, import/export)
   must be plain, testable modules with **no rendering dependency**, so the toy
   can start as DOM/CSS-3D and later be upgraded to Three.js without rewriting
   logic. See @TECH-STACK.md.
6. **Follow @DESIGN.md tokens and @INTERACTION.md behaviors.** No raw hex or
   one-off spacing in components; use the CSS variables. Don't invent
   interactions not specified there without flagging.
7. **Don't build deferred scope in v1:** public Contribute, curation mode, the
   npm package, or an icon font. Build the nav shells, wire them later.

## Icon data model

    type IconDef = {
      id: string;            // stable, kebab-case, unique
      name: string;
      category: string;      // from a fixed taxonomy (OPEN — see BACKLOG)
      tags: string[];
      cells: (string | null)[]; // length 121 (11x11), per-cell hex color or null
      author: string;        // "ilham" for v1 (owner-only)
      status: "published" | "pending" | "rejected"; // pending/rejected unused in v1
      createdAt: string;     // ISO
    };

**Naming:** `id`, `name`, and every `tag` are **kebab-case** (`arrow-right`) —
validated at module load, so a bad name fails the build. The displayed name is
therefore the same string you would paste into code, matching Lucide/Phosphor.

- v1 icon set = a **static registry** (typed module / JSON in the repo). The
  owner-only composer writes new icons into it (via Supabase or a commit flow —
  see @TECH-STACK.md). Public gallery reads the registry.
- Serialize `cells` compactly if needed, but keep it diffable for future curation.

## Build order

See @PLAN.md for the phased, sub-one-month timeline and exit criteria.

## Open decisions (don't guess — ask)

- **Icon safe area:** 9x9 or 10x10 live area inside the 11x11 (not locked).
- **Taxonomy & metadata:** fixed category list + tagging scheme (owner-authored;
  more constrained than Lucide because of the niche). Needed for the composer's
  category dropdown and the gallery filter.
- **Resources page** contents.
- **Auth provider** confirmation (Supabase recommended) and the owner allowlist.

## Conventions

- TypeScript everywhere; `IconDef` is the contract between engine, registry,
  gallery, and composer.
- Names describe what the user sees. Copy is active-voice and literal.
- Keep this file short; push detail into the linked docs.
