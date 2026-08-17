# DESIGN.md — Visual Style Guide

> Source of truth for look-and-feel. Every color, type, and spacing value comes
> from the tokens here. The product shell stays calm and minimal (Lucide-like);
> the personality lives in the icons and the Etch A Sketch composer.

Reflects the v9 prototype (blue toy, silver screen, multi-color). Items marked
**[FIX]** are known issues to correct while building (see @BACKLOG.md).

---

## 1. Design thesis

Two registers, kept separate:
- **Shell** (nav, gallery, Guide, Resources): white, monochrome type, one blue
  accent, generous space. The icons are the stars.
- **Composer**: a skeuomorphic **blue** Etch A Sketch — the one place we go
  bold and tactile.

Signature motif: the pixel grid — as icon cells, as the composer board, and in
empty/loading states.

## 2. Color tokens (CSS variables at :root)

Neutrals / shell
    --bg:#FFFFFF  --surface:#F4F4F5  --surface-2:#FAFAFA  --border:#E4E4E7
    --text:#111111  --text-muted:#71717A  --text-faint:#A1A1AA

Accent — Arcade Blue (the one shell accent)
    --accent:#2B5BFF  --accent-hover:#1E42D6  --accent-subtle:#E8EDFF

Semantic
    --danger:#DC2626   (errors stay red so they read against the blue toy)
    --success:#16A34A  --warning:#D97706

Composer toy (blue Etch A Sketch — scoped to the composer only)
    --frame:#2E46C8      toy body (top of gradient)
    --frame-2:#20328A    toy body (bottom of gradient)
    --frame-3:#182662    bottom lip / deep shadow
    --bezel:#1A2A70      dark rim around the screen (must read RECESSED)
    --well:#20337F  --well-2:#182660   recessed button wells
    --screen: silver-gray gradient (#cfd2cb -> #bfc3ba)

Rule: `--frame*/--bezel/--well/--screen` are **composer-only**. Never use them
in the shell.

## 3. Color inside icons (multi-color)

Icons are multi-color; each cell holds a hex or null. Colors are chosen with the
full HSL picker (see @INTERACTION.md) and **baked** into the icon. No palette
restriction (full freedom), so visual coherence relies on curation, not tokens.
True black (#000) and true white (#fff) are reachable.

**Gallery renders single-color, always.** A hex field recolors **every filled
cell of every icon**, matching Lucide's customizer. It defaults to **#000000 in
light and #ffffff in dark** and follows the theme; clearing the field returns to
that default. There is no state in which the gallery shows multi-color art.
Stored data and exports are untouched by the control.

**Authoring rule — one color, drawn as outlines.** Seed icons are authored in a
single color, since multi-color cell data would be unreachable in the gallery
and would only surface as a surprise in an exported SVG. An icon must be legible
as a silhouette: draw outlines, not filled masses whose meaning depends on
internal contrast. A filled envelope with a lighter interior is a plain
rectangle in one color; an outlined envelope survives.

## 4. Typography

| Role    | Face                        | Use |
|---------|-----------------------------|-----|
| Pixel   | Press Start 2P              | Wordmark, h1, h2 |
| Display | Departure Mono (mono, retro)| Nav, h3, labels, buttons, UI |
| Body    | Inter                       | Long-form prose in Guide / Resources |
| Data    | Departure Mono / JetBrains Mono | Counts, hex, sizes, code |

**Pixel face = Press Start 2P**, scoped to the **wordmark, h1, and h2**. It has
very wide advance widths and a single weight, so it stops at h2 — h3 and below
use the display face, where the horizontal cost stops paying for itself.

Departure Mono is not on Google Fonts; until the files are supplied, **JetBrains
Mono stands in** for Display/Data. It is behind `--font-display`, so the swap is
a one-line change in `globals.css`.

Scale (px): 12 caption · 14 UI · 16 body · 20 h3 · 24 h2 · 32 h1.
Line-height: 1.5 body, 1.2 headings/labels.

## 5. Spacing, radius, layout

- Base unit **8px** (matches the icon 8-multiple sizing). Scale: 4 8 12 16 24 32 48 64.
- Radius: `--radius-sm 4` (inputs) · `--radius-md 8` (cards/panels) ·
  `--radius-lg 16` (modals) · `--radius-toy 32` (toy frame). **Icon cells and the
  grid are always 0 radius.**
- Sidebar 264px fixed. Icon grid: auto-fill ~92px cards, 14px gap. Icon centered.
- Quality floor: visible focus rings (accent), respects `prefers-reduced-motion`,
  works down to mobile.

## 6. Component specs

**Top nav** — logo left; Icons / Guide / Resources / Contribute; then the
owner-only actions. Active nav item in `--accent`.

**Gallery sidebar** — Search (+reset); Display (**Color** free-text hex field
with a swatch that opens the OS picker, defaulting to the theme's black/white;
**Size** slider on the 16–48 8-step scale, default **24**, with clickable tick
labels that double as the readout; **Transform** = Flip H / Flip V / Rotate,
applied gallery-wide); Categories (All + per-category counts that follow the
active search).

Reference point for the gallery's control surface is **Nucleo's icon panel**,
but applied to the whole gallery rather than one icon at a time. Stroke and
Cap/Join are deliberately excluded — pixel cells have no strokes.

**Icon card** — the icon alone, no permanent caption. The name appears on hover
and on keyboard focus.

**Theme** — **Light / Dark**, two buttons in the top nav. There is no System
button, but system is the default: until a choice is made no `data-theme` is
set and the media query decides, so a first visit already matches the OS. The
buttons highlight the *resolved* theme. Dark mode is a redefinition of the
shell tokens, not a parallel stylesheet. (Superseded the earlier gallery-only
Light/Dark preview toggle.)

**Icon card** — `--surface` fill, `--radius-md`, hover lift + border, name below.
Selected → `--accent` ring.

**Icon detail modal** — small centered panel (~1/4 screen). Large preview, name,
category, tags, and actions: Copy SVG, Download SVG/PNG, Copy name. No color
control here: the gallery tint is a preview, and what you copy is always the
icon's own baked colors. While a tint is active the modal says so explicitly.

**Composer — toy anatomy**
- *Frame*: blue gradient body, `--radius-toy`, top highlight + bottom lip.
- *Screen*: silver-gray, must read **recessed / snub-in** — inner shadow falls
  inward from the top edge; never convex ("hill"). **[FIX]** the current
  snub-in still looks slightly off; refine the inset geometry (a true 3D screen
  in Phase 3 should resolve it).
- *Bezel*: dark rim (`--bezel`). **[FIX]** the bottom bezel is too thick/fat —
  even the rim all around; thin it so the screen sits in a slim recessed frame.
- *Buttons*: 8 total, 4 flanking each side — Game Boy A/B style (soft light
  domed cap seated in a recessed well). Left: Mirror, Grid, Eyedropper, Undo.
  Right: Flip-H, Flip-V, Rotate, Redo. Press sinks ~1px only.
- *Knobs*: two large ridged knobs at the **true bottom corners**, overlapping
  the frame edge like the real toy. **[FIX]** currently they sit inboard and
  are too small — move them fully to the corners and enlarge. Only the ridged
  dial turns; the shadow/ring stay still. Left knob wears a rainbow (hue) ring,
  right knob a black→color→white (lightness) ring.
- *Color panel* (between the knobs): current-color swatch, editable hex, a
  readout (hue name · L% · S%), a saturation slider, and a single row of preset
  swatches (incl. true black & white).
- *Slide-to-clear*: a groove the width of the board, just under the screen;
  dragging wipes the drawing left→right progressively.

**Composer bottom dock** — labelled fields (Name / Category / Tags), a current-
color chip, and Export / Save (no filled-cell count). **[FIX]** the dock is too
thick — reduce its height/padding. **[MOVE]** the SVG **Import** control belongs
here (a composer/owner action), not in the global nav.

## 7. Do / Don't

Do: keep the shell monochrome + one accent; keep pixel cells square; reuse tokens.
Don't: use `--frame*/--screen` outside the composer; round icon pixels; add
gradients/shadows to icon art; add a second shell accent.
