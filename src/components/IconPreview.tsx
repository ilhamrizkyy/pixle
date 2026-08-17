/**
 * Renders an icon's cells as SVG rects.
 *
 * This is PRESENTATION: it reads engine data and draws it. It holds no icon
 * logic of its own — geometry comes from engine constants, colors come off the
 * cells it is handed. Recoloring happens upstream, so this component cannot
 * tell (and does not care) whether it is drawing baked or gallery colors.
 */

import { CELL_UNITS, GRID_SIZE, viewBoxWithPadding } from "@/engine/constants";
import { toIndex } from "@/engine/grid";
import type { Cells } from "@/engine/types";

type IconPreviewProps = {
  cells: Cells;
  /** Rendered px. Multiples of 8, 16 minimum. */
  size?: number;
  /** Accessible name. Omit for decorative use. */
  title?: string;
  /** Empty space around the art, in cells. Grows the viewBox. */
  padding?: number;
};

export function IconPreview({
  cells,
  size = 32,
  title,
  padding = 0,
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
      viewBox={viewBoxWithPadding(padding)}
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {rects}
    </svg>
  );
}
