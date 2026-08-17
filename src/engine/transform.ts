/**
 * Whole-drawing transforms (INTERACTION.md §2). Each is a one-shot, pure
 * remap of cell positions — colors ride along untouched, since nothing here
 * may recolor an existing cell (CLAUDE.md rule 2).
 */

import { GRID_SIZE } from "./constants";
import type { Cells } from "./types";
import { createEmptyCells, toIndex } from "./grid";

/** Remap helper: `source(row, col)` returns where the new cell reads from. */
function remap(
  cells: Cells,
  source: (row: number, col: number) => { row: number; col: number },
): Cells {
  const next = createEmptyCells();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const from = source(row, col);
      next[toIndex(row, col)] = cells[toIndex(from.row, from.col)];
    }
  }
  return next;
}

/** Mirror across the vertical axis. */
export function flipHorizontal(cells: Cells): Cells {
  return remap(cells, (row, col) => ({ row, col: GRID_SIZE - 1 - col }));
}

/** Mirror across the horizontal axis. */
export function flipVertical(cells: Cells): Cells {
  return remap(cells, (row, col) => ({ row: GRID_SIZE - 1 - row, col }));
}

/**
 * Rotate 90° clockwise. The only rotation the toy offers — one press, one
 * quarter turn clockwise (INTERACTION.md §2). Counter-clockwise is three
 * presses, by design.
 */
export function rotateClockwise(cells: Cells): Cells {
  return remap(cells, (row, col) => ({ row: GRID_SIZE - 1 - col, col: row }));
}
