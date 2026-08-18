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

import {
  CANVAS_UNITS,
  CELL_UNITS,
  GRID_SIZE,
  VIEW_BOX,
  viewBoxWithPadding,
} from "./constants";
import type { Cells, IconDef } from "./types";
import { createEmptyCells, inBounds, normalizeHex, toIndex } from "./grid";

export type ToSvgOptions = {
  /** Rendered width/height attribute in px. Omit for a viewBox-only SVG. */
  size?: number;
  /** `id` for a title element, improving a11y of inlined icons. */
  title?: string;
  /** Empty space around the art, in cells. Grows the viewBox. */
  padding?: number;
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
  const { size, title, padding = 0 } = options;
  const dimensions =
    size === undefined ? "" : ` width="${size}" height="${size}"`;
  const titleEl =
    title === undefined ? "" : `<title>${escapeXml(title)}</title>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxWithPadding(padding)}"${dimensions}` +
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


/* ============================================================================
   Import.

   The reader half of this file. It is deliberately NOT a general SVG parser:
   v1 guarantees round-tripping only what `cellsToSvg` wrote (BACKLOG.md D), so
   this reads one known shape and refuses everything else. Same constraint as
   the writer — string scanning only, no DOMParser, or the engine boundary
   breaks (TECH-STACK.md).
   ========================================================================= */

/** Attributes read off one tag, keyed by name. */
type Attributes = Record<string, string>;

/** The open `<svg …>` tag. Searched for, so an XML prolog is tolerated. */
const ROOT_TAG = /<svg(\s[^>]*)?>/;

/** `name="value"`, double-quoted — the only form the writer emits. */
const ATTRIBUTE = /([a-zA-Z_:][-\w:.]*)\s*=\s*"([^"]*)"/g;

const TAG_NAME = /^[a-zA-Z][-\w:.]*/;

/** Coordinates are whole user units — a fractional one cannot be on-grid. */
const WHOLE_NUMBER = /^-?\d+$/;

/**
 * Every rejection funnels through here so an import failure names the file's
 * problem rather than surfacing as a drawing that is quietly missing pixels.
 */
function fail(message: string): never {
  throw new Error(`svgToCells: ${message}`);
}

function parseAttributes(source: string): Attributes {
  const attributes: Attributes = {};
  for (const match of source.matchAll(ATTRIBUTE)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

/** Markup between our elements may only be whitespace — never stray text. */
function assertBlank(text: string, where: string): void {
  if (text.trim() !== "") fail(`unexpected content ${where}: "${text.trim()}"`);
}

/**
 * Validate the root viewBox and return the padding it encodes, in cells.
 *
 * The padding is then DISCARDED — see the note on `svgToCells`. Validating it
 * anyway is what makes the viewBox the thing that identifies a Pixle canvas:
 * any other extent means the file came from somewhere else.
 */
function readPaddingCells(viewBox: string | undefined): number {
  if (viewBox === undefined) fail("the <svg> has no viewBox");

  const parts = viewBox.trim().split(/[\s,]+/);
  if (parts.length !== 4 || !parts.every((part) => WHOLE_NUMBER.test(part))) {
    fail(`viewBox="${viewBox}" is not four whole numbers`);
  }

  const [minX, minY, width, height] = parts.map(Number);
  const pad = -minX;
  const symmetric = minY === minX && pad >= 0 && pad % CELL_UNITS === 0;
  if (!symmetric || width !== CANVAS_UNITS + pad * 2 || height !== width) {
    fail(
      `viewBox="${viewBox}" is not a Pixle canvas — expected "${VIEW_BOX}" or a symmetrically padded form of it`,
    );
  }

  return pad / CELL_UNITS;
}

/** Read an attribute that must be present and a whole number of user units. */
function readUnits(attributes: Attributes, name: string): number {
  const raw = attributes[name];
  if (raw === undefined) fail(`a <rect> is missing ${name}`);
  if (!WHOLE_NUMBER.test(raw)) {
    fail(`<rect> ${name}="${raw}" is not a whole number of user units`);
  }
  return Number(raw);
}

/**
 * Expand one rect into the cells it covers.
 *
 * The expansion is the whole point: `buildRects` merges a horizontal run of
 * same-colored cells into ONE rect of width N*CELL_UNITS, so a reader that
 * assumed one rect per cell would silently drop every pixel after the first of
 * each run.
 */
function paintRect(cells: Cells, attributes: Attributes): void {
  const x = readUnits(attributes, "x");
  const y = readUnits(attributes, "y");
  const width = readUnits(attributes, "width");
  const height = readUnits(attributes, "height");

  if (height !== CELL_UNITS) {
    fail(`<rect> height="${height}" — every exported rect is one cell tall`);
  }
  if (x % CELL_UNITS !== 0 || y % CELL_UNITS !== 0) {
    fail(`<rect> at (${x}, ${y}) is off the ${CELL_UNITS}-unit cell grid`);
  }
  if (width <= 0 || width % CELL_UNITS !== 0) {
    fail(`<rect> width="${width}" is not a whole number of cells`);
  }

  const col = x / CELL_UNITS;
  const row = y / CELL_UNITS;
  const run = width / CELL_UNITS;
  if (!inBounds(row, col) || col + run > GRID_SIZE) {
    fail(
      `<rect> at (${x}, ${y}) spanning ${run} cells falls outside the ${GRID_SIZE}x${GRID_SIZE} grid`,
    );
  }

  // normalizeHex also accepts 3-digit and uppercase hex, so a hand-edited
  // export still imports, and every cell lands in the stored form: lowercase,
  // 6 digits, leading # (types.ts). `fill="none"` fails here, as it should —
  // a colorless rect is not a pixel.
  const color = normalizeHex(attributes.fill ?? "");
  if (color === null) {
    fail(`<rect> fill="${attributes.fill ?? ""}" is not a hex color`);
  }

  for (let step = 0; step < run; step++) {
    const index = toIndex(row, col + step);
    if (cells[index] !== null) {
      fail(`two rects overlap at row ${row}, col ${col + step}`);
    }
    cells[index] = color;
  }
}

/** Index just past `</name>`, which must exist. */
function afterCloseTag(body: string, from: number, name: string): number {
  const close = body.indexOf(`</${name}>`, from);
  if (close === -1) fail(`<${name}> is never closed`);
  return close + name.length + 3;
}

/**
 * Parse an SVG back into cells — the reader behind Import in the composer
 * dock (INTERACTION.md §5).
 *
 * SCOPE (BACKLOG.md D): v1 guarantees round-tripping only what `cellsToSvg`
 * wrote. Behavior on arbitrary external SVGs is undefined, so this throws on
 * the first thing it does not recognize instead of importing what it can. A
 * half-parsed import hands the owner a drawing that is subtly missing pixels,
 * which is far worse than a refusal they can act on.
 *
 * TOLERATED SHAPE: an `<svg>` element containing only an optional `<title>`
 * and any number of `<rect>`, each self-closed or `</rect>`-closed, with
 * double-quoted attributes in any order and whitespace between elements. Root
 * attributes other than `viewBox` — the optional `width`/`height`, plus
 * `fill`, `role`, `xmlns` — are ignored: the viewBox is what identifies the
 * canvas.
 *
 * PADDING IS DROPPED, deliberately. A padded export carries a negative-origin
 * viewBox while its rects stay in the unpadded 0..44 space, because padding
 * grows the viewBox instead of moving the art (constants.ts). Padding is a
 * display setting rather than part of the icon, so importing a padded export
 * yields the same 11x11 art as importing the unpadded one — which is also the
 * only reading that can round-trip, since `Cells` has nowhere to put it.
 */
export function svgToCells(svg: string): Cells {
  const open = ROOT_TAG.exec(svg);
  if (open === null) fail("input has no <svg> element");

  const bodyStart = open.index + open[0].length;
  const bodyEnd = svg.lastIndexOf("</svg>");
  if (bodyEnd < bodyStart) fail("the <svg> element is never closed");

  // Validated for shape, then thrown away: padding is a display setting, not
  // something `Cells` can hold.
  readPaddingCells(parseAttributes(open[1] ?? "").viewBox);

  const cells = createEmptyCells();
  const body = svg.slice(bodyStart, bodyEnd);
  let cursor = 0;

  while (cursor < body.length) {
    const start = body.indexOf("<", cursor);
    if (start === -1) {
      assertBlank(body.slice(cursor), "after the last element");
      break;
    }
    assertBlank(body.slice(cursor, start), "between elements");

    const end = body.indexOf(">", start);
    if (end === -1) fail("an element's tag is never terminated");

    const tag = body.slice(start + 1, end);
    const name = TAG_NAME.exec(tag)?.[0];
    if (name === undefined) fail(`unexpected markup "<${tag}>"`);

    const selfClosing = tag.trimEnd().endsWith("/");
    const attributes = tag.slice(name.length);

    if (name === "title") {
      // Title text is the icon's name, which lives on the IconDef rather than
      // in cells, so it is read past and dropped.
      cursor = selfClosing ? end + 1 : afterCloseTag(body, end + 1, name);
      continue;
    }

    if (name === "rect") {
      paintRect(cells, parseAttributes(attributes));
      if (selfClosing) {
        cursor = end + 1;
      } else {
        cursor = afterCloseTag(body, end + 1, name);
        const close = cursor - name.length - 3;
        assertBlank(body.slice(end + 1, close), "in a <rect>");
      }
      continue;
    }

    fail(
      `unsupported element <${name}> — a Pixle export holds only <title> and <rect>`,
    );
  }

  return cells;
}
