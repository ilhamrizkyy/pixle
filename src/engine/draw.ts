/**
 * Stroke model for drag-fill (INTERACTION.md §1, BACKLOG.md C).
 *
 * PHASE 2 — signatures and the settled semantics are fixed here; the stroke
 * application is stubbed pending one open decision, flagged below.
 *
 * Settled: the mode is decided ON PRESS and does not change mid-drag. Press an
 * empty cell -> the whole stroke paints. Press a filled cell -> the whole
 * stroke erases. This is what stops a drag from flickering between painting
 * and erasing as it crosses mixed cells.
 */

import type { Cells } from "./types";
import { clearCell, fillCell } from "./grid";

export type StrokeMode = "paint" | "erase";

/**
 * OPEN — needs Ilham (BACKLOG.md C).
 *
 * When a PAINT stroke crosses a cell that is already filled with some other
 * color, does it overwrite that cell with the current color, or skip it and
 * only fill empties?
 *
 * Docs record "overwrite" as the working assumption, so that is the default
 * here. Flipping it is a one-line change, and the behavior is threaded through
 * `applyStroke` as an explicit option rather than baked in, precisely because
 * it is unconfirmed.
 */
export const DEFAULT_OVERWRITE_FILLED = true;

/** Which mode a press starts, given the cell pressed. */
export function strokeModeForPress(cells: Cells, index: number): StrokeMode {
  return cells[index] === null ? "paint" : "erase";
}

/**
 * Apply one cell of an in-progress stroke.
 *
 * PHASE 2 STUB — the real implementation also handles the Mirror aid and
 * coalescing into a single history entry. Kept minimal and correct for the
 * settled cases so the module compiles and can be tested early.
 */
export function applyStrokeCell(
  cells: Cells,
  index: number,
  mode: StrokeMode,
  color: string,
  overwriteFilled: boolean = DEFAULT_OVERWRITE_FILLED,
): Cells {
  if (mode === "erase") return clearCell(cells, index);
  if (cells[index] !== null && !overwriteFilled) return cells;
  return fillCell(cells, index, color);
}

/**
 * PHASE 2 STUB — interpolate the cells a pointer crossed between two samples.
 *
 * Pointer events fire coarsely; a fast drag can jump several cells between
 * frames, leaving gaps in the stroke. The real version walks a line (Bresenham)
 * from the previous sampled cell to the current one so the paint stays
 * continuous.
 */
export function cellsBetween(): number[] {
  throw new Error("cellsBetween: not implemented until Phase 2");
}
