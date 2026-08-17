/**
 * SVG serialization. String building only — no DOM, no DOMParser, no canvas.
 * That keeps the engine boundary intact (TECH-STACK.md) and lets this run
 * identically on the server, in the browser, and in a test runner.
 *
 * SVG is a RENDER TARGET generated from cells, never the stored form
 * (CLAUDE.md rule 3).
 *
 * PNG export is deliberately absent: rasterizing needs a canvas, which is a
 * rendering dependency. Presentation rasterizes the string this module
 * produces.
 */

import { CELL_UNITS, GRID_SIZE, VIEW_BOX } from "./constants";
import type { Cells, IconDef } from "./types";
import { toIndex } from "./grid";

export type ToSvgOptions = {
  /** Rendered width/height attribute in px. Omit for a viewBox-only SVG. */
  size?: number;
  /** `id` for a title element, improving a11y of inlined icons. */
  title?: string;
};

/**
 * One rect per horizontal run of same-colored cells.
 *
 * Merging runs is not just a size win: adjacent rects sharing an edge can show
 * a hairline seam under anti-aliasing, and merging removes most of those seams
 * outright. Icons render as normal anti-aliased vector (DESIGN.md), so
 * shape-rendering is intentionally left alone.
 */
function buildRects(cells: Cells): string {
  const rects: string[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    let col = 0;
    while (col < GRID_SIZE) {
      const color = cells[toIndex(row, col)];
      if (color === null) {
        col++;
        continue;
      }
      let run = 1;
      while (
        col + run < GRID_SIZE &&
        cells[toIndex(row, col + run)] === color
      ) {
        run++;
      }
      const x = col * CELL_UNITS;
      const y = row * CELL_UNITS;
      const width = run * CELL_UNITS;
      rects.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${CELL_UNITS}" fill="${color}"/>`,
      );
      col += run;
    }
  }

  return rects.join("");
}

/** Escape text destined for an XML text node. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Serialize cells to an SVG string with baked per-cell colors.
 *
 * Note what is NOT here: no `currentColor`, no `fill` on the root, no CSS
 * custom properties. Every color is a literal hex, so a copied icon looks
 * identical wherever it lands (CLAUDE.md rule 2).
 */
export function cellsToSvg(cells: Cells, options: ToSvgOptions = {}): string {
  const { size, title } = options;
  const dimensions =
    size === undefined ? "" : ` width="${size}" height="${size}"`;
  const titleEl =
    title === undefined ? "" : `<title>${escapeXml(title)}</title>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}"${dimensions}` +
    ` fill="none" role="img">${titleEl}${buildRects(cells)}</svg>`
  );
}

/** Serialize a whole icon, titled with its name. */
export function iconToSvg(icon: IconDef, options: ToSvgOptions = {}): string {
  return cellsToSvg(icon.cells, { title: icon.name, ...options });
}

/** Filename for a downloaded icon. */
export function svgFileName(icon: IconDef): string {
  return `${icon.id}.svg`;
}

/**
 * PHASE 2 STUB — parse an SVG back into cells.
 *
 * Scope is deliberately narrow (BACKLOG.md D): v1 guarantees round-tripping
 * only SVGs this tool exported. Arbitrary external SVGs are undefined behavior
 * and should fail loudly rather than half-import.
 *
 * Must stay DOM-free — a regex/string parse over our own known-shape output,
 * not DOMParser, or the engine boundary breaks. Note that `buildRects` merges
 * horizontal runs, so the parser has to expand a rect of width N back into
 * N cells rather than assuming one rect per cell.
 */
export function svgToCells(_svg: string): Cells {
  throw new Error("svgToCells: not implemented until Phase 2");
}
