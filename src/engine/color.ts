/**
 * Color model (INTERACTION.md §4) and the gallery tint.
 *
 * Still pure: culori is a math library with no DOM dependency, so the engine
 * boundary holds.
 *
 * THE RULE THIS MODULE SERVES: changing a color affects only the NEXT cells
 * drawn. Nothing here mutates an icon in the registry. `tintCells` returns a
 * NEW array for display; the stored icon and every export keep their baked
 * colors.
 */

import { converter, formatHex } from "culori";
import type { Cells } from "./types";
import { normalizeHex } from "./grid";

const toHsl = converter("hsl");

export type Hsl = {
  /** 0–360, wraps. Driven by the left knob. */
  h: number;
  /** 0–100. Driven by the saturation slider. */
  s: number;
  /** 0–100, black -> color -> white. Driven by the right knob. */
  l: number;
};

/** Presets row, including true black and true white (DESIGN.md §3). */
export const PRESET_COLORS: readonly string[] = [
  "#000000",
  "#ffffff",
  "#dc2626",
  "#d97706",
  "#eab308",
  "#16a34a",
  "#2b5bff",
  "#7c3aed",
  "#ec4899",
  "#71717a",
] as const;

/** The color a fresh composer session starts on. */
export const DEFAULT_COLOR = "#111111";

/** HSL to a stored hex. */
export function hslToHex(hsl: Hsl): string {
  return formatHex({
    mode: "hsl",
    h: hsl.h,
    s: hsl.s / 100,
    l: hsl.l / 100,
  });
}

/**
 * Hex to HSL, so a typed hex can snap the knobs and slider to the nearest
 * match while the exact hex becomes the paint color (INTERACTION.md §4).
 *
 * Achromatic colors have no meaningful hue; culori reports it as undefined and
 * we report 0, which is the conventional stand-in.
 */
export function hexToHsl(hex: string): Hsl {
  const parsed = toHsl(hex);
  if (parsed === undefined) return { h: 0, s: 0, l: 0 };
  return {
    h: parsed.h ?? 0,
    s: (parsed.s ?? 0) * 100,
    l: parsed.l * 100,
  };
}

const HUE_NAMES: readonly [number, string][] = [
  [0, "Red"],
  [18, "Vermilion"],
  [35, "Orange"],
  [48, "Amber"],
  [60, "Yellow"],
  [90, "Lime"],
  [140, "Green"],
  [168, "Teal"],
  [186, "Cyan"],
  [205, "Sky"],
  [225, "Blue"],
  [255, "Indigo"],
  [278, "Violet"],
  [300, "Purple"],
  [322, "Magenta"],
  [338, "Pink"],
  [351, "Rose"],
  [360, "Red"],
];

/** Human-readable hue name for the color panel readout. */
export function hueName(hue: number): string {
  const normalized = ((hue % 360) + 360) % 360;
  let best = "Red";
  let bestDistance = Infinity;

  for (const [degrees, name] of HUE_NAMES) {
    const raw = Math.abs(normalized - degrees);
    const distance = Math.min(raw, 360 - raw);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = name;
    }
  }

  return best;
}

/* ============================================================================
   Gallery tint — DISPLAY ONLY.

   A tint replaces each cell's hue and saturation while KEEPING that cell's own
   lightness. That distinction is the whole point: flattening every cell to one
   literal color would destroy any icon whose meaning lives in its internal
   contrast (an envelope is a dark border around a light interior — one color
   makes it a rectangle). Preserving lightness keeps the drawing readable while
   unifying the palette across the gallery.

   Consequence worth knowing: two colors that differ in HUE but not in
   LIGHTNESS collapse into each other under a tint. That is a property of the
   icon's own color choices, not a bug here.
   ========================================================================= */

/** A tint: a hue plus a saturation, both taken from a picked color. */
export type Tint = { h: number; s: number };

/** Derive a tint from a hex. Returns null for input that will not parse. */
export function tintFromHex(hex: string): Tint | null {
  const normalized = normalizeHex(hex);
  if (normalized === null) return null;
  const hsl = hexToHsl(normalized);
  return { h: hsl.h, s: hsl.s };
}

/** Recolor one hex to the tint's hue/saturation, keeping its lightness. */
export function tintHex(hex: string, tint: Tint): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ h: tint.h, s: tint.s, l: hsl.l });
}

/**
 * Recolor cells for display. Returns a NEW array — the icon in the registry is
 * never touched, and neither is anything that gets exported.
 */
export function tintCells(cells: Cells, tint: Tint | null): Cells {
  if (tint === null) return cells;
  return cells.map((cell) => (cell === null ? null : tintHex(cell, tint)));
}

/**
 * Swatches for the gallery tint control. "Original" (no tint) is represented
 * by null at the UI layer rather than by a color here.
 */
export const TINT_PRESETS: readonly string[] = [
  "#111111",
  "#71717a",
  "#dc2626",
  "#d97706",
  "#16a34a",
  "#0d9488",
  "#2b5bff",
  "#7c3aed",
  "#ec4899",
] as const;
