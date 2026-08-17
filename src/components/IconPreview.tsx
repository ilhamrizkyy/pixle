/**
 * Renders an icon's cells as SVG rects.
 *
 * This is PRESENTATION: it reads engine data and draws it. It holds no icon
 * logic of its own — geometry comes from engine constants, colors come off the
 * cells it is handed. Any tint is applied upstream by the caller, so this
 * component cannot tell (and does not care) whether it is drawing baked or
 * tinted colors.
 */

import {
  CANVAS_UNITS,
  CELL_UNITS,
  GRID_SIZE,
  VIEW_BOX,
} from "@/engine/constants";
import { toIndex } from "@/engine/grid";
import type { Cells } from "@/engine/types";

type IconPreviewProps = {
  cells: Cells;
  /** Rendered px. Multiples of 8, 16 minimum. */
  size?: number;
  /** Accessible name. Omit for decorative use. */
  title?: string;
  /** Draw the faint 11×11 gridlines, echoing the composer board. */
  showGrid?: boolean;
};

/**
 * One path holding every gridline, rather than 24 separate line elements.
 *
 * `vector-effect: non-scaling-stroke` keeps the lines a hairline at every icon
 * size — a stroke width in user units would be invisible at 48px and would
 * swallow the icon at 16px, since a cell is only 1.5 device px there.
 */
function GridLines() {
  const segments: string[] = [];
  for (let i = 0; i <= GRID_SIZE; i++) {
    const offset = i * CELL_UNITS;
    segments.push(`M${offset} 0V${CANVAS_UNITS}`);
    segments.push(`M0 ${offset}H${CANVAS_UNITS}`);
  }

  return (
    <path
      d={segments.join("")}
      stroke="var(--color-grid-line)"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      fill="none"
    />
  );
}

export function IconPreview({
  cells,
  size = 32,
  title,
  showGrid = false,
}: IconPreviewProps) {
  const rects = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const color = cells[toIndex(row, col)];
      if (color === null) continue;
      rects.push(
        <rect
          key={`${row}-${col}`}
          x={col * CELL_UNITS}
          y={row * CELL_UNITS}
          width={CELL_UNITS}
          height={CELL_UNITS}
          fill={color}
        />,
      );
    }
  }

  return (
    <svg
      viewBox={VIEW_BOX}
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* Gridlines sit under the art, so they never dim the icon itself. */}
      {showGrid ? <GridLines /> : null}
      {rects}
    </svg>
  );
}
