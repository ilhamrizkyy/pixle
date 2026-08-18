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

## 3. Color inside icons (single-color)

**Icons render in exactly one color.** A hex field in the gallery sets it for
**every filled cell of every icon**, matching Lucide's customizer. It defaults
to **#000000 in light and #ffffff in dark**, follows the theme, and clearing it
returns to that default. There is no state in which the gallery shows
multi-color art — the point is that the set reads as one coherent family rather
than each icon carrying its own palette.

**Authoring rule — one color, drawn as outlines.** Every icon is authored in a
single color, and must be legible as a **silhouette**: draw outlines, not
filled masses whose meaning depends on internal contrast. A filled envelope
with a lighter interior collapses into a plain rectangle; an outlined envelope
survives. This is enforced by test — a seed icon using more than one color
fails the suite.

**What the data model still allows.** `cells` holds a hex per cell, so the
format *can* carry multi-color, and the composer's HSL picker (see
@INTERACTION.md) still paints real colors — that is what makes the icon's own
color the one baked into an export. The gallery simply never renders more than
one. Keeping the capability costs nothing and is what a future **duotone** mode
would build on, deriving roles from an icon's distinct colors (parked; see
@BACKLOG.md).

True black (#000) and true white (#fff) are reachable.

## 4. Typography

| Role    | Face           | Use |
|---------|----------------|-----|
| Pixel   | Press Start 2P | Wordmark, h1, h2 |
| Display | JetBrains Mono | Nav, h3, labels, buttons, UI |
| Body    | Inter          | Long-form prose in Guide / Resources |
| Data    | JetBrains Mono | Counts, hex, sizes, code |

**Pixel face = Press Start 2P**, scoped to the **wordmark, h1, and h2**. It has
very wide advance widths and a single weight, so it stops at h2 — h3 and below
use the display face, where the horizontal cost stops paying for itself.

**Display/Data = JetBrains Mono — locked 2026-08-18.** Departure Mono was the
original pick and was considered, then rejected: with a genuinely pixel
wordmark and pixel headings already in place, a *second* retro-pixel face for
the UI makes the shell compete with the icons instead of framing them (§1).
JetBrains Mono reads as "developer tool", which is the register Lucide and
Phosphor use for their chrome, and it is on Google Fonts so there are no files
to source. It sits behind `--font-display`, so reversing this is a one-line
change in `globals.css`.

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
owner-only actions. Active nav item in `--accent`. Below `lg` the links
collapse behind a **hamburger**; the theme toggle stays in the bar, since
burying a one-tap control behind two taps costs more than the space it saves.

**Gallery sidebar** — Search (+reset); Display (**Color** free-text hex field
with a swatch that opens the OS picker, defaulting to the theme's black/white;
**Size** slider on the 16–48 8-step scale, default **24**, with clickable tick
labels that double as the readout; **Padding** 0–3 cells; **Transform** = Flip
H / Flip V / Rotate, applied gallery-wide); Categories (All + per-category counts that follow the
active search).

Below `lg` every control except Search moves into a **bottom sheet**, opened by
a square icon button sitting **inline with the search field**. The button
carries an accent dot while a category filter is active. The sheet has a
**Reset** and an **Apply** in a footer below its scroll area, so the actions
stay reachable however long the controls get. Both commit and close.

Reference point for the gallery's control surface is **Nucleo's icon panel**,
but applied to the whole gallery rather than one icon at a time. Stroke and
Cap/Join are deliberately excluded — pixel cells have no strokes — and there is
no Bg control: icon backgrounds are **always transparent**.

**Icon card** — `--surface` fill, `--radius-md`, hover lift + border. Selected
→ `--accent` ring. **Always square**, on every device, so the grid reads as an
even lattice. The name is therefore always an **overlay** revealed on hover or
keyboard focus — a name sitting in flow is what stretches a card into a
rectangle. On touch the name is reached by tapping through to the detail modal,
as Lucide's mobile grid does.

Grid density follows the same reference: `minmax(70px)` below `lg` (4 columns
at 375px) and `minmax(92px)` above.

**Theme** — **Light / Dark**, two buttons in the top nav. There is no System
button, but system is the default: until a choice is made no `data-theme` is
set and the media query decides, so a first visit already matches the OS. The
buttons highlight the *resolved* theme. Dark mode is a redefinition of the
shell tokens, not a parallel stylesheet. (Superseded the earlier gallery-only
Light/Dark preview toggle.)

**Icon detail modal** — small centered panel (~1/4 screen). Large preview, name,
category, tags, and actions: Copy SVG, Download SVG/PNG, Copy name. No color
control here — the gallery already owns it. **What you see is what you copy:**
every export carries the gallery's color, flip, rotation, and padding, so the
clipboard matches the preview exactly.

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
