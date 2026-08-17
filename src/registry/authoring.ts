/**
 * Authoring helpers for hand-written icons.
 *
 * Icons are written as 11 rows of 11 characters plus a palette mapping each
 * character to a hex. A 121-element array literal is technically the same data
 * but is unreviewable in a diff — with art maps you can see the icon in the
 * source and a changed pixel shows up as a changed character.
 *
 * `.` (and space) mean empty. Every other character must exist in the palette.
 */

import { CELL_COUNT, GRID_SIZE } from "@/engine/constants";
import { createEmptyCells, normalizeHex, toIndex } from "@/engine/grid";
import type { Cells, Category, IconDef } from "@/engine/types";

export const EMPTY_CHARS = new Set([".", " "]);

export type ArtMap = readonly string[];
export type Palette = Readonly<Record<string, string>>;

/**
 * Convert an art map to cells. Throws on malformed art — these run at module
 * load, so a bad icon fails the build rather than shipping a broken registry.
 */
export function cellsFromArt(art: ArtMap, palette: Palette): Cells {
  if (art.length !== GRID_SIZE) {
    throw new Error(
      `Icon art must have ${GRID_SIZE} rows, received ${art.length}`,
    );
  }

  const cells = createEmptyCells();

  art.forEach((row, rowIndex) => {
    if (row.length !== GRID_SIZE) {
      throw new Error(
        `Icon art row ${rowIndex} must be ${GRID_SIZE} characters, received ${row.length}`,
      );
    }

    [...row].forEach((char, colIndex) => {
      if (EMPTY_CHARS.has(char)) return;

      const hex = palette[char];
      if (hex === undefined) {
        throw new Error(
          `Icon art uses "${char}" at row ${rowIndex}, col ${colIndex} with no palette entry`,
        );
      }

      const normalized = normalizeHex(hex);
      if (normalized === null) {
        throw new Error(`Palette entry "${char}" is not a valid hex: ${hex}`);
      }

      cells[toIndex(rowIndex, colIndex)] = normalized;
    });
  });

  if (cells.length !== CELL_COUNT) {
    throw new Error(`Expected ${CELL_COUNT} cells`);
  }

  return cells;
}

export type IconSource = {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  art: ArtMap;
  palette: Palette;
  /** ISO date. Fixed per icon so builds stay deterministic. */
  createdAt: string;
};

/**
 * Build an IconDef from an art map. `author` and `status` are fixed: v1 is
 * owner-only, so every icon is Ilham's and every icon is published.
 */
export function defineIcon(source: IconSource): IconDef {
  return {
    id: source.id,
    name: source.name,
    category: source.category,
    tags: source.tags,
    cells: cellsFromArt(source.art, source.palette),
    author: "ilham",
    status: "published",
    createdAt: source.createdAt,
  };
}
