import type { Metadata } from "next";
import {
  CANVAS_UNITS,
  GRID_SIZE,
  ICON_SIZES,
  SAFE_AREA_SIZE,
} from "@/engine/constants";

export const metadata: Metadata = {
  title: "Guide — Pixle",
  description: "How to use the set, and the rules every Pixle icon follows.",
};

/**
 * Guide shell. The four cards state rules that are already locked, so they are
 * written as fact rather than placeholder. Values come from engine constants
 * rather than being retyped, so the page cannot drift from the geometry.
 */

const CARDS = [
  {
    title: "Multi-color",
    body: "Icons carry real colors, painted per cell. A new color applies to the next cells drawn — it never repaints what is already down, and nothing downstream recolors an icon.",
  },
  {
    title: "Sizing",
    body: `Built for the 8-point scale: ${ICON_SIZES.join(", ")}. ${ICON_SIZES[0]}px is the floor.`,
  },
  {
    title: "The grid",
    body: `${GRID_SIZE}×${GRID_SIZE} on a ${CANVAS_UNITS} viewBox — an odd grid, so there is an absolute center for symmetry. A ${SAFE_AREA_SIZE}×${SAFE_AREA_SIZE} safe area guides composition. Square pixels, always.`,
  },
  {
    title: "Any color",
    body: "A hue knob, a lightness knob, a saturation slider, and a hex field — the full spectrum, including true black and true white.",
  },
] as const;

export default function GuidePage() {
  return (
    <div className="max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-h2">Guide</h1>
      <p className="prose-body mb-6 text-text-muted">
        How to use the set, and the rules every icon follows. This doubles as
        the contributor style guide once contribution opens.
      </p>

      <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[14px] p-0">
        {CARDS.map((card) => (
          <li
            key={card.title}
            className="rounded-md border border-border bg-surface p-5"
          >
            <h3 className="mb-2 text-body">{card.title}</h3>
            <p className="prose-body text-ui text-text-muted">{card.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
