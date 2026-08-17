"use client";

import { IconPreview } from "@/components/IconPreview";
import type { Cells, IconDef } from "@/engine/types";

/**
 * One icon in the grid (DESIGN.md §6): surface fill, radius-md, hover lift +
 * border, name below, accent ring when selected.
 *
 * Takes `cells` separately from `icon` because the gallery may hand it TINTED
 * cells for display while `icon` stays the untouched registry record.
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
      className={`flex h-full w-full flex-col items-center gap-2 rounded-md border bg-surface p-4 pb-2.5 transition-[box-shadow,border-color,transform] duration-100 hover:-translate-y-0.5 hover:border-border hover:shadow-md ${
        selected ? "border-accent ring-2 ring-accent" : "border-transparent"
      }`}
    >
      {/* Fixed height so cards keep their footprint as the size slider moves. */}
      <span className="flex h-12 items-center">
        <IconPreview
          cells={cells}
          size={size}
          title={icon.name}
          showGrid={showGrid}
        />
      </span>
      <span className="max-w-full truncate text-caption text-text-muted">
        {icon.name}
      </span>
    </button>
  );
}
