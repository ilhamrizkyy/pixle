import { describe, expect, it } from "vitest";
import { icons } from "@/registry";
import {
  CANVAS_UNITS,
  CELL_COUNT,
  CELL_UNITS,
  GRID_SIZE,
  PADDING_STEPS,
  VIEW_BOX,
  viewBoxWithPadding,
} from "./constants";
import { createEmptyCells, fillCell, isValidCells, toIndex } from "./grid";
import { cellsToSvg, iconToSvg, svgFileName, svgToCells } from "./svg";
import type { Cells, IconDef } from "./types";

const RED = "#ff0000";
const BLUE = "#0000ff";

function withRow(row: number, color: string): Cells {
  let cells = createEmptyCells();
  for (let col = 0; col < GRID_SIZE; col++) {
    cells = fillCell(cells, toIndex(row, col), color);
  }
  return cells;
}

function countRects(svg: string): number {
  return svg.match(/<rect /g)?.length ?? 0;
}

describe("cellsToSvg", () => {
  it("emits the canonical viewBox and no background", () => {
    const svg = cellsToSvg(createEmptyCells());
    expect(svg).toContain(`viewBox="${VIEW_BOX}"`);
    expect(svg).toContain('fill="none"');
    expect(countRects(svg)).toBe(0);
  });

  it("bakes literal hex and never emits currentColor", () => {
    const svg = cellsToSvg(fillCell(createEmptyCells(), 0, RED));
    expect(svg).toContain(`fill="${RED}"`);
    expect(svg).not.toContain("currentColor");
  });

  it("places a cell at its grid position in user units", () => {
    const svg = cellsToSvg(fillCell(createEmptyCells(), toIndex(2, 3), RED));
    expect(svg).toContain(
      `<rect x="${3 * CELL_UNITS}" y="${2 * CELL_UNITS}" width="${CELL_UNITS}" height="${CELL_UNITS}" fill="${RED}"/>`,
    );
  });

  it("merges a run of same-colored cells into one rect", () => {
    // Merging is what removes anti-aliasing seams between adjacent cells, so
    // this is a rendering-quality guarantee, not just a size optimization.
    const svg = cellsToSvg(withRow(0, RED));
    expect(countRects(svg)).toBe(1);
    expect(svg).toContain(`width="${GRID_SIZE * CELL_UNITS}"`);
  });

  it("breaks a run where the color changes", () => {
    let cells = withRow(0, RED);
    cells = fillCell(cells, toIndex(0, 5), BLUE);
    // red | blue | red
    expect(countRects(cellsToSvg(cells))).toBe(3);
  });

  it("does not merge across rows", () => {
    const cells = withRow(0, RED);
    const twoRows = withRow(1, RED).map((cell, index) =>
      cell !== null ? cell : cells[index],
    );
    expect(countRects(cellsToSvg(twoRows))).toBe(2);
  });

  it("adds width/height only when a size is given", () => {
    expect(cellsToSvg(createEmptyCells())).not.toContain("width=\"24\"");
    expect(cellsToSvg(createEmptyCells(), { size: 24 })).toContain(
      'width="24" height="24"',
    );
  });

  it("escapes markup in the title", () => {
    const svg = cellsToSvg(createEmptyCells(), { title: "a<b>&c" });
    expect(svg).toContain("<title>a&lt;b&gt;&amp;c</title>");
  });

  it("grows the viewBox for padding rather than scaling the art", () => {
    const cells = fillCell(createEmptyCells(), toIndex(0, 0), RED);
    const padded = cellsToSvg(cells, { padding: 2 });
    expect(padded).toContain(`viewBox="${viewBoxWithPadding(2)}"`);
    // The cell itself stays exactly where it was — that is what keeps pixel
    // edges on-grid at any padding.
    expect(padded).toContain('x="0" y="0"');
  });
});

describe("viewBoxWithPadding", () => {
  it("returns the base viewBox at zero", () => {
    expect(viewBoxWithPadding(0)).toBe(VIEW_BOX);
    expect(viewBoxWithPadding(-1)).toBe(VIEW_BOX);
  });

  it("expands symmetrically by whole cells", () => {
    const pad = CELL_UNITS;
    expect(viewBoxWithPadding(1)).toBe(
      `${-pad} ${-pad} ${CANVAS_UNITS + pad * 2} ${CANVAS_UNITS + pad * 2}`,
    );
    expect(viewBoxWithPadding(3)).toBe("-12 -12 68 68");
  });
});

describe("svgFileName", () => {
  it("uses the stable id, not the display name", () => {
    expect(svgFileName({ id: "arrow-right" } as IconDef)).toBe(
      "arrow-right.svg",
    );
  });
});

/* ============================================================================
   Import.
   ========================================================================= */

/** A row segment, so a merged multi-cell rect can be tested in isolation. */
function withRun(row: number, from: number, length: number, color: string): Cells {
  let cells = createEmptyCells();
  for (let col = from; col < from + length; col++) {
    cells = fillCell(cells, toIndex(row, col), color);
  }
  return cells;
}

/** Wrap a body in our root element, so a test can vary only what it is about. */
function svgWith(body: string, viewBox: string = VIEW_BOX): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" role="img">${body}</svg>`;
}

type RectAttributes = Partial<
  Record<"x" | "y" | "width" | "height" | "fill", string>
>;

/** One valid cell-sized rect, with any attribute overridden for the bad cases. */
function rect(overrides: RectAttributes = {}): string {
  const a = {
    x: "0",
    y: "0",
    width: String(CELL_UNITS),
    height: String(CELL_UNITS),
    fill: RED,
    ...overrides,
  };
  return `<rect x="${a.x}" y="${a.y}" width="${a.width}" height="${a.height}" fill="${a.fill}"/>`;
}

describe("svgToCells round-trip", () => {
  it("restores every icon in the registry exactly", () => {
    // The load-bearing test: the registry is the real corpus, so a parser that
    // mishandles any run, gap, or row boundary fails here rather than in the
    // composer after an owner has already lost work.
    for (const icon of icons) {
      expect(svgToCells(cellsToSvg(icon.cells)), icon.id).toEqual(icon.cells);
    }
  });

  it("survives the title and size options", () => {
    for (const icon of icons) {
      const svg = iconToSvg(icon, { size: 24 });
      expect(svgToCells(svg), icon.id).toEqual(icon.cells);
    }
  });

  it("reads an escaped title without treating it as markup", () => {
    const cells = withRun(3, 2, 4, BLUE);
    const svg = cellsToSvg(cells, { title: "a<b>&c" });
    expect(svgToCells(svg)).toEqual(cells);
  });

  it("drops padding at every step, since padding is display-only", () => {
    // A padded export has a negative-origin viewBox while its rects stay in
    // the unpadded space, so every padding must yield the identical drawing.
    // The corner cell is the one that catches a parser that "helpfully"
    // subtracts the viewBox origin: it would slide the art off the grid.
    const corner = fillCell(createEmptyCells(), toIndex(0, 0), BLUE);
    for (const padding of PADDING_STEPS) {
      const label = `pad ${padding}`;
      expect(svgToCells(cellsToSvg(icons[0].cells, { padding })), label).toEqual(
        icons[0].cells,
      );
      expect(svgToCells(cellsToSvg(corner, { padding })), label).toEqual(corner);
    }
  });

  it("expands a merged horizontal run back into separate cells", () => {
    // buildRects merges a run into ONE wide rect. A reader assuming one rect
    // per cell passes every other test here and silently loses four pixels.
    const cells = withRun(4, 3, 5, RED);
    const svg = cellsToSvg(cells);
    expect(countRects(svg)).toBe(1);

    const parsed = svgToCells(svg);
    expect(parsed).toEqual(cells);
    for (let col = 3; col < 8; col++) {
      expect(parsed[toIndex(4, col)]).toBe(RED);
    }
    expect(parsed[toIndex(4, 8)]).toBeNull();
  });

  it("restores a full-width row and a mixed row", () => {
    const full = withRow(0, RED);
    expect(svgToCells(cellsToSvg(full))).toEqual(full);

    const mixed = fillCell(withRow(5, RED), toIndex(5, 5), BLUE);
    expect(svgToCells(cellsToSvg(mixed))).toEqual(mixed);
  });

  it("returns 121 nulls for an empty grid", () => {
    const parsed = svgToCells(cellsToSvg(createEmptyCells()));
    expect(parsed).toHaveLength(CELL_COUNT);
    expect(parsed.every((cell) => cell === null)).toBe(true);
  });

  it("returns a grid that passes the structural check", () => {
    expect(isValidCells(svgToCells(iconToSvg(icons[0])))).toBe(true);
  });
});

describe("svgToCells tolerance", () => {
  it("accepts any attribute order and the </rect> closing form", () => {
    const svg = svgWith(
      `<rect fill="${RED}" height="${CELL_UNITS}" width="${CELL_UNITS}" y="${CELL_UNITS}" x="${2 * CELL_UNITS}"></rect>`,
    );
    expect(svgToCells(svg)[toIndex(1, 2)]).toBe(RED);
  });

  it("accepts whitespace between elements", () => {
    const svg = svgWith(`\n  <title>spaced</title>\n  ${rect()}\n`);
    expect(svgToCells(svg)[0]).toBe(RED);
  });

  it("normalizes shorthand and uppercase hex to the stored form", () => {
    // A hand-edited export still imports, and every cell comes back in the one
    // form a cell may hold: lowercase, 6 digits, leading #.
    expect(svgToCells(svgWith(rect({ fill: "#F00" })))[0]).toBe(RED);
    expect(svgToCells(svgWith(rect({ fill: "#FF0000" })))[0]).toBe(RED);
  });

  it("tolerates a leading XML prolog", () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>${svgWith(rect())}`;
    expect(svgToCells(svg)[0]).toBe(RED);
  });
});

describe("svgToCells rejection", () => {
  it("rejects input that is not markup at all", () => {
    expect(() => svgToCells("")).toThrow(/no <svg> element/);
    expect(() => svgToCells("arrow-right")).toThrow(/no <svg> element/);
  });

  it("rejects an unclosed root", () => {
    expect(() => svgToCells(`<svg viewBox="${VIEW_BOX}">${rect()}`)).toThrow(
      /never closed/,
    );
  });

  it("rejects a valid SVG from another icon set", () => {
    // A Lucide icon is a perfectly good SVG and must still be refused — the
    // viewBox is what identifies a Pixle canvas.
    const lucide =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>';
    expect(() => svgToCells(lucide)).toThrow(/not a Pixle canvas/);
  });

  it("rejects a missing or misshapen viewBox", () => {
    expect(() =>
      svgToCells('<svg xmlns="http://www.w3.org/2000/svg">' + rect() + "</svg>"),
    ).toThrow(/no viewBox/);
    expect(() => svgToCells(svgWith(rect(), "0 0 44 48"))).toThrow(
      /not a Pixle canvas/,
    );
    // Padded origin without the grown extent: the art would land off-canvas.
    expect(() => svgToCells(svgWith(rect(), "-4 -4 44 44"))).toThrow(
      /not a Pixle canvas/,
    );
    expect(() => svgToCells(svgWith(rect(), "0 0 44"))).toThrow(
      /four whole numbers/,
    );
  });

  it("rejects any element we never write", () => {
    expect(() => svgToCells(svgWith('<path d="M0 0h44"/>'))).toThrow(
      /unsupported element <path>/,
    );
    expect(() => svgToCells(svgWith('<g><rect x="0"/></g>'))).toThrow(
      /unsupported element <g>/,
    );
  });

  it("rejects stray text between elements", () => {
    expect(() => svgToCells(svgWith(`${rect()}oops`))).toThrow(
      /unexpected content/,
    );
  });

  it("rejects a non-integer coordinate", () => {
    expect(() => svgToCells(svgWith(rect({ x: "2.5" })))).toThrow(
      /not a whole number/,
    );
  });

  it("rejects a coordinate off the cell grid", () => {
    expect(() => svgToCells(svgWith(rect({ y: "2" })))).toThrow(/off the/);
  });

  it("rejects a rect outside the grid", () => {
    const past = String(GRID_SIZE * CELL_UNITS);
    expect(() => svgToCells(svgWith(rect({ x: past })))).toThrow(/outside the/);
    expect(() => svgToCells(svgWith(rect({ x: "-4" })))).toThrow(/outside the/);
    // A run that starts on the grid but overflows the row end.
    const lastCol = String((GRID_SIZE - 1) * CELL_UNITS);
    expect(() =>
      svgToCells(
        svgWith(rect({ x: lastCol, width: String(CELL_UNITS * 2) })),
      ),
    ).toThrow(/outside the/);
  });

  it("rejects a rect that is not one cell tall or a cell multiple wide", () => {
    expect(() =>
      svgToCells(svgWith(rect({ height: String(CELL_UNITS * 2) }))),
    ).toThrow(/one cell tall/);
    expect(() => svgToCells(svgWith(rect({ width: "6" })))).toThrow(
      /whole number of cells/,
    );
    expect(() => svgToCells(svgWith(rect({ width: "0" })))).toThrow(
      /whole number of cells/,
    );
  });

  it("rejects a fill that is not a baked hex", () => {
    expect(() => svgToCells(svgWith(rect({ fill: "none" })))).toThrow(
      /not a hex color/,
    );
    expect(() => svgToCells(svgWith(rect({ fill: "currentColor" })))).toThrow(
      /not a hex color/,
    );
  });

  it("rejects a rect with a missing attribute", () => {
    expect(() =>
      svgToCells(svgWith(`<rect y="0" width="4" height="4" fill="${RED}"/>`)),
    ).toThrow(/missing x/);
    expect(() =>
      svgToCells(svgWith(`<rect x="0" y="0" width="4" height="4"/>`)),
    ).toThrow(/not a hex color/);
  });

  it("rejects overlapping rects rather than letting one win", () => {
    // Our writer emits disjoint runs, so an overlap means the file came from
    // somewhere else and the drawing cannot be trusted.
    expect(() => svgToCells(svgWith(rect() + rect({ fill: BLUE })))).toThrow(
      /overlap at row 0, col 0/,
    );
  });
});
