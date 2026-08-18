/**
 * Renders an icon's cells as SVG rects.
 *
 * This is PRESENTATION: it reads engine data and draws it. It holds no icon
 * logic of its own — geometry comes from engine constants, colors come off the
 * cells it is handed. Recoloring happens upstream, so this component cannot
 * tell (and does not care) whether it is drawing baked or gallery colors.
 */

import {
  CANVAS_UNITS,
  CELL_UNITS,
  GRID_SIZE,
  viewBoxWithPadding,
} from "@/engine/constants";
import { toIndex } from "@/engine/grid";
import type { Cells } from "@/engine/types";

type IconPreviewProps = {
  cells: Cells;
  /** Rendered px. Multiples of 8, 16 minimum. Ignored if `className` sizes it. */
  size?: number;
  /** Accessible name. Omit for decorative use. */
  title?: string;
  /** Empty space around the art, in cells. Grows the viewBox. */
  padding?: number;
  /**
   * Draw the cell lattice behind the art.
   *
   * It lives INSIDE this SVG rather than layering behind it, because that is
   * the only way every filled cell is guaranteed to land in exactly one grid
   * box: art and lattice share one viewBox, so no pair of sizes has to agree.
   */
  grid?: boolean;
  className?: string;
};

/**
 * The lattice, spanning the padded canvas — so padding reads as extra grid
 * boxes around the art (11×11 → 13×13 → …), which is precisely what it is.
 */
function latticePath(padding: number): string {
  const pad = Math.max(0, padding) * CELL_UNITS;
  const min = -pad;
  const max = CANVAS_UNITS + pad;
  const segments: string[] = [];
  for (let o = min; o <= max; o += CELL_UNITS) {
    segments.push(`M${o} ${min}V${max}`, `M${min} ${o}H${max}`);
  }
  return segments.join("");
}

export function IconPreview({
  cells,
  size = 32,
  title,
  padding = 0,
  grid = false,
  className,
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
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* Behind the art, and scaled with it: the lattice is a diagram of the
          grid, so a thinning hairline at small sizes is correct. */}
      {grid && (
        <path
          d={latticePath(padding)}
          stroke="var(--color-border)"
          strokeWidth={0.25}
          fill="none"
        />
      )}
      {rects}
    </svg>
  );
}
