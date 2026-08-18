"use client";

import { IconPreview } from "@/components/IconPreview";
import type { Cells, IconDef } from "@/engine/types";

/**
 * One icon in the grid.
 *
 * The card is always square and the name is always an overlay revealed on
 * hover or keyboard focus — see `.pixl-card-name`. On touch the name is
 * reached by tapping through to the detail modal.
 *
 * The label is aria-hidden and the button carries the accessible name instead,
 * so a card announces its name once rather than twice. That also means touch
 * screen-reader users still get the name from the button itself.
 *
 * Takes `cells` separately from `icon` because the gallery may hand it
 * RECOLORED cells for display while `icon` stays the untouched registry record.
 */

type IconCardProps = {
  icon: IconDef;
  cells: Cells;
  size: number;
  padding: number;
  selected: boolean;
  onSelect: (icon: IconDef) => void;
};

export function IconCard({
  icon,
  cells,
  size,
  padding,
  selected,
  onSelect,
}: IconCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(icon)}
      aria-haspopup="dialog"
      aria-label={icon.name}
      title={icon.name}
      className={`pixl-card group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-md border bg-surface p-3 transition-[box-shadow,border-color,transform] duration-100 hover:-translate-y-0.5 hover:border-border hover:shadow-md ${
        selected ? "border-accent ring-2 ring-accent" : "border-transparent"
      }`}
    >
      {/* Fills the square, so the icon stays centred at any card size and the
          footprint never shifts as the size slider moves. */}
      <span className="flex flex-1 items-center">
        <IconPreview cells={cells} size={size} padding={padding} />
      </span>

      <span aria-hidden="true" className="pixl-card-name pointer-events-none">
        {icon.name}
      </span>
    </button>
  );
}
