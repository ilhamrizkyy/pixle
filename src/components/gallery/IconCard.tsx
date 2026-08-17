"use client";

import { IconPreview } from "@/components/IconPreview";
import type { Cells, IconDef } from "@/engine/types";

/**
 * One icon in the grid: the icon alone, with its name revealed on hover.
 *
 * The name label is aria-hidden and the button carries the accessible name
 * instead — otherwise every card would announce its name twice. It reveals on
 * focus as well as hover, so keyboard users are not left guessing.
 *
 * Takes `cells` separately from `icon` because the gallery may hand it
 * RECOLORED cells for display while `icon` stays the untouched registry record.
 */

type IconCardProps = {
  icon: IconDef;
  cells: Cells;
  size: number;
  showGrid: boolean;
  selected: boolean;
  onSelect: (icon: IconDef) => void;
};

export function IconCard({
  icon,
  cells,
  size,
  showGrid,
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
      className={`group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border bg-surface transition-[box-shadow,border-color,transform] duration-100 hover:-translate-y-0.5 hover:border-border hover:shadow-md ${
        selected ? "border-accent ring-2 ring-accent" : "border-transparent"
      }`}
    >
      <IconPreview cells={cells} size={size} showGrid={showGrid} />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-text/85 px-1.5 py-1 text-center font-data text-caption text-bg opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {icon.name}
      </span>
    </button>
  );
}
