"use client";

import { IconPreview } from "@/components/IconPreview";
import type { IconDef } from "@/engine/types";

/**
 * One icon in the grid (DESIGN.md §6): surface fill, radius-md, hover lift +
 * border, name below, accent ring when selected.
 */

type IconCardProps = {
  icon: IconDef;
  size: number;
  dark: boolean;
  selected: boolean;
  onSelect: (icon: IconDef) => void;
};

export function IconCard({
  icon,
  size,
  dark,
  selected,
  onSelect,
}: IconCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(icon)}
      aria-haspopup="dialog"
      className={`flex h-full w-full flex-col items-center gap-2 rounded-md border p-4 pb-2.5 transition-[box-shadow,border-color,transform] duration-100 hover:-translate-y-0.5 hover:shadow-md ${
        dark
          ? "bg-preview-dark-card hover:border-text-muted"
          : "bg-surface hover:border-border"
      } ${selected ? "border-accent ring-2 ring-accent" : "border-transparent"}`}
    >
      {/* Fixed height so cards keep their footprint as the size slider moves. */}
      <span className="flex h-12 items-center">
        <IconPreview cells={icon.cells} size={size} title={icon.name} />
      </span>
      <span
        className={`max-w-full truncate text-caption ${
          dark ? "text-preview-dark-text" : "text-text-muted"
        }`}
      >
        {icon.name}
      </span>
    </button>
  );
}
