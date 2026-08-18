# DESIGN.md — Visual Style Guide

> Source of truth for look-and-feel. Every color, type, and spacing value comes
> from the tokens here. The product shell stays calm and minimal (Lucide-like);
> the personality lives in the icons and the Etch A Sketch composer.

Reflects the v9 prototype (blue toy, silver screen, multi-color). Items marked
**[FIX]** are known issues to correct while building (see @docs/BACKLOG.md).

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
@docs/INTERACTION.md) still paints real colors — that is what makes the icon's own
color the one baked into an export. The gallery simply never renders more than
one. Keeping the capability costs nothing and is what a future **duotone** mode
would build on, deriving roles from an icon's distinct colors (parked; see
@docs/BACKLOG.md).

True black (#000) and true white (#fff) are reachable.

## 4. Typography

| Role    | Face           | Use |
|---------|----------------|-----|
| Pixel   | Press Start 2P | Wordmark, h1, h2 |
| Display | JetBrains Mono | Nav, h3, labels, buttons, UI |
| Body    | Inter          | Long-form prose in Guide / Resources |
| Data    | JetBrains Mono | Counts, hex, sizes, code |

**Pixel face = Press Start 2P**, scoped to the **wordmark, h1, h2, and the
gallery's section eyebrows** (Search / Display / Categories). It has very wide
advance widths, so it does not run to prose h3 and below, where the horizontal
cost stops paying for itself — the eyebrows are the exception because they are
six-to-ten-character chrome labels, not running text.

Two rules travel with it, both consequences of it being a pixel face:

- **Never bold it.** It ships a single weight, so `font-bold` synthesises one
  and smears the very edges the face exists for. Emphasis comes from case,
  color, or size instead.
- **It is crispest at multiples of 8px**, its design grid. The wordmark sits at
  16px for that reason. The eyebrows sit at 12px anyway, trading a little
  softness to stay smaller than the 14px controls they head — in a control
  panel, a label that outranks its own content is the worse defect.

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

## 5b. Motion

One shared scale in `:root`, referenced by every component. Tailwind's
`--default-transition-*` point at it too, so a stray `transition-colors`
inherits the house curve rather than the framework's.

    --duration-quick 150ms   close, hover-in, text swap
    --duration-fast  250ms   modal open, card hover-in
    --duration-medium 350ms  toast open, hover-out settle
    --duration-slow  400ms   sheet open (full-screen travel)

**Padding** reads out the resulting canvas (11×11 → 13×13 → 15×15 → 17×17),
not the step number. The art is unchanged at every step; only the viewBox grows
around it, which is what keeps cells on-grid. It is unrelated to the safe area:
the safe area is where art is *drawn* and is already baked into every icon.

    --ease-smooth-out cubic-bezier(0.22, 1, 0.36, 1)   the house curve
    --ease-bounce     cubic-bezier(0.34, 1.36, 0.64, 1) entrances only

**The rules that make motion read as authored, not merely present:**

- **Closes are faster than opens.** A modal opens in 250ms and closes in
  150ms; the sheet opens in 400ms and closes in 350ms. Never bounce a close.
  Overlays defer their unmount for exactly the close duration so the exit has
  something to play on, and skip the wait entirely under reduced motion.
- **Duration follows distance, not category.** The sheet travels the full
  screen height, so it opens on the 400ms clock; the modal scales in place on
  250ms.
- **Hover-in is quick and direct; hover-out may settle.** Cards enter at 250ms
  and return at 350ms, so they land rather than snap.
- **Trim duration before adding delay**, and never delay a close.
- Overlay entrances reach past transform and opacity — a 2px cross-blur reads
  as depth of field rather than a slide.

Every animation sits behind the global `prefers-reduced-motion` rule.

## 5c. Depth

    --shadow-raised   cards on hover
    --shadow-overlay  modal, sheet, toast

Shadows carry **both an offset and a soft blur**; a zero-offset halo is
decoration, not depth. Dark mode raises the opacity, since a light shadow does
not register on a dark ground.

**Elevation is declared once per element** — a border *or* a shadow, never a
1px border under a wide soft blur. The icon card keeps a transparent border to
reserve the space its selected state fills, and lifts with shadow alone.

## 5d. Browser surfaces

Text selection, the caret, and scrollbars are themed from the palette rather
than left at browser defaults, and data (counts, hex, sizes) uses
`tabular-nums` so figures do not reflow as digits change. Prose is capped at a
68ch measure.

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

**Icon detail** — a **docked bottom panel**, not a modal (the Lucide pattern).
It spans the content width along the bottom edge, clearing the sidebar at `lg`,
and **dims nothing**: the grid above stays visible and clickable, so choosing
another icon swaps the panel's contents instead of forcing a dismiss-then-open
cycle. Comparing icons is the common task, and a modal fights it.

Being non-modal is honoured properly — no backdrop, no scroll lock, no focus
trap, no `aria-modal`. Escape and ✕ close it; focus returns to the card. The
grid gains bottom padding while it is open so the last row can still scroll
clear.

Contents: the icon **on** a faint cell lattice — for a pixel set the grid *is*
the art, so each filled cell occupies exactly one box. Art and lattice are
drawn in a **single SVG** sharing one viewBox; layering two makes alignment
depend on two sizes agreeing, which is how they drift. The lattice spans the
padded canvas, so padding reads as extra boxes around the art (11×11 → 13×13
→ …) rather than as the art shrinking. Then the name in the data face since it is a code identifier, tags as a
`·`-separated line, a category chip, the four actions, and the SVG markup
behind a disclosure. No color control — the gallery owns it. **What you see is
what you copy:** every export carries the gallery's color, flip, rotation, and
padding.

**Composer — toy anatomy**
- *Frame*: blue gradient body, `--radius-toy`, top highlight + bottom lip.
- *Screen*: silver-gray, must read **recessed / snub-in** — inner shadow falls
  inward from the top edge; never convex ("hill"). **[FIX]** the current
  snub-in still looks slightly off; refine the inset geometry (a true 3D screen
  in Phase 3 should resolve it).
- *Bezel*: dark rim (`--bezel`), even on the sides and bottom, with a deeper
  **brow above the screen** as the real toy has. (The old [FIX] was a fat chin,
  which is a different thing from a header.)
- *Buttons*: 8 total, 4 flanking each side — Game Boy A/B style (soft light
  domed cap seated in a recessed well). Left: Mirror, Grid, Eyedropper, Undo.
  Right: Flip-H, Flip-V, Rotate, Redo. Press sinks ~1px only.
- *Knobs*: two large ridged knobs at the **true bottom corners**, overlapping
  the frame edge like the real toy. **[FIX]** currently they sit inboard and
  are too small — move them fully to the corners and enlarge. Only the ridged
  dial turns; the shadow/ring stay still. Left knob wears a rainbow (hue) ring,
  right knob a black→color→white (lightness) ring.
- *Color panel* (between the knobs): current-color swatch, editable hex, a
  readout (hue name · L% · S%), and a saturation slider. **No preset swatches** —
  they duplicated controls the knobs already cover.
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
