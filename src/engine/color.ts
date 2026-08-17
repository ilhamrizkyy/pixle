/**
 * Color model for the composer's HSL picker (INTERACTION.md §4).
 *
 * PHASE 2 — culori does the conversions (TECH-STACK.md); it is not a Phase 0
 * dependency, so the math is stubbed and only the shape is fixed here.
 *
 * The rule this module exists to serve: changing the color affects only the
 * NEXT cells drawn. Nothing here ever walks the grid — there is no recolor
 * function, and there should never be one.
 */

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

/** PHASE 2 STUB — HSL to stored hex. culori's formatHex. */
export function hslToHex(_hsl: Hsl): string {
  throw new Error("hslToHex: not implemented until Phase 2 (culori)");
}

/**
 * PHASE 2 STUB — hex to HSL, so a typed hex can snap the knobs and slider to
 * the nearest match while the exact hex becomes the paint color
 * (INTERACTION.md §4).
 */
export function hexToHsl(_hex: string): Hsl {
  throw new Error("hexToHsl: not implemented until Phase 2 (culori)");
}

/**
 * PHASE 2 STUB — human-readable hue name for the color panel readout
 * ("hue name · L% · S%").
 */
export function hueName(_hue: number): string {
  throw new Error("hueName: not implemented until Phase 2");
}
