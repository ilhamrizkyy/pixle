# INTERACTION.md — Interaction Spec

> How everything behaves. Keep behavior consistent with this while building;
> expect small updates once it's in real code. Visuals live in @DESIGN.md.

---

## 0. Access & routing (critical)

- **Public** can use: Gallery, icon detail modal (copy/download), Guide,
  Resources. Read-only.
- **Owner only** (authenticated as Ilham): the Create/composer route and, later,
  curation. The "+ Create" entry and the composer route are hidden/blocked for
  everyone else (server-side check, not just a hidden button). See @TECH-STACK.md.

## 1. Composer — drawing

- **Tap a cell** → fill with the current color. **Tap a filled cell** → clear it
  (no separate eraser).
- **Drag-fill** → press a cell and drag to paint across cells continuously.
  Mode is decided on press: start on an empty cell → paints the current color
  across every cell entered; start on a filled cell → erases across them.
  **OPEN:** when a paint drag crosses an already-filled cell, overwrite it with
  the current color, or skip and only fill empties? Assume overwrite; confirm
  in build (see @BACKLOG.md).
- **Hover** (no press) → faint preview of the current color on the hovered cell.
- **Mirror** (toggle): while on, painting one side mirrors live to the other
  across the vertical center. It's a drawing aid — not stored on the icon.
- **Grid guide** (toggle): show/hide the faint cell gridlines.
- **Eyedropper** (the droplet button): activate, then tap any filled cell to set
  its color as the current color (also syncs the knobs/sliders); deactivates
  after one pick.

## 2. Composer — transforms & history

- **Flip H / Flip V / Rotate**: one-shot transforms of the whole drawing.
  Rotate is **90° clockwise per press** only.
- **Undo / Redo**: buttons on the toy + keyboard (Ctrl/Cmd+Z, Ctrl+Y or
  Ctrl/Cmd+Shift+Z). Every mutating action (draw stroke, transform, clear,
  slide-erase) is one undo step.

## 3. Composer — slide to clear

- A groove the width of the board. Dragging the handle left→right **erases the
  drawing progressively by column** (follows the handle), not all-at-once.
- Release snaps the handle back to 0; whatever was wiped stays wiped. The whole
  wipe is a single undo step.

## 4. Composer — color (full HSL picker)

- **Left knob = Hue** (full 360°, wraps). **Right knob = Lightness** (black →
  color → white). Knobs physically turn on drag; only the dial rotates. Each
  knob's ring previews what it controls.
- **Saturation slider** in the color panel (0 = neutral gray → full color).
- **Hex field**: type any 6-digit hex; the knobs + slider snap to the nearest
  match and the exact hex becomes the paint color.
- **Presets**: one row of quick swatches including true black and true white.
- **Rule**: changing the color affects only the **next** cells drawn; existing
  cells keep their color.

## 5. Composer — metadata, import, save (bottom dock)

- **Name / Category / Tags** fields and a live current-color chip. (No
  pixel/cell counter — removed.)
- **Import SVG** (owner action, lives in this dock): pick an SVG previously
  exported by the tool; it parses the rects back into cells and loads them for
  editing / adds to the set. Round-trips the tool's own export format.
- **Export**: download the current drawing as SVG (baked colors).
- **Save icon**: requires a name and a non-empty drawing; writes an `IconDef`
  into the set and returns to the gallery with a confirmation toast.

## 6. Gallery interactions

- **Search**: matches name + tags; category counts reflect the active search.
- **Category filter**: All + fixed categories.
- **Display**:
  - **Color** — swatches + a custom picker apply a display-only tint to every
    icon, re-hueing while keeping each cell's lightness. "Original" restores
    each icon's own colors. Never affects stored data or exports.
  - **Size** (16/24/32/40/48) applies to every card; drag the slider or click
    a tick label.
  - **Gridlines** — show/hide faint 11×11 cell lines on previews, echoing the
    composer board.
- **Theme**: Light/Dark/System lives in the top nav and themes the whole app
  (it replaced the old gallery-only Light/Dark preview toggle).
- **Card click** → detail modal (copy SVG / download SVG+PNG / copy name).
- Backdrop click or ✕ closes the modal; Escape should too.

## 7. Feedback & states

- Toasts for save / import / copy.
- Disabled states for Undo/Redo when stacks are empty.
- Empty gallery state when a search/filter yields nothing.
- Errors (e.g., unnamed save) show inline in `--danger`.

## 8. Accessibility

- All controls keyboard-reachable with visible focus rings.
- Tool buttons and knobs carry `aria-label`s / tooltips.
- Respect `prefers-reduced-motion` for knob/animation motion.
- The 3D toy (Phase 3) must keep the editing grid operable via DOM/keyboard —
  never trap interaction inside a canvas with no fallback.
