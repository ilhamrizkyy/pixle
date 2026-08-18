import { describe, expect, it } from "vitest";
import {
  CANVAS_UNITS,
  CELL_UNITS,
  GRID_SIZE,
  VIEW_BOX,
  viewBoxWithPadding,
} from "./constants";
import { createEmptyCells, fillCell, toIndex } from "./grid";
import { cellsToSvg, svgFileName } from "./svg";
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
