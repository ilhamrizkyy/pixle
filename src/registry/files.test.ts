import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { iconToSvg } from "@/engine/svg";
import { DEFAULT_ICON_SIZE } from "@/engine/constants";
import { icons } from "./icons";

/**
 * The `icons/` folder at the repo root: one SVG per registry icon, for people
 * who want the files without running anything.
 *
 * `npm run icons` regenerates it (vitest -u). In CI a missing or stale file
 * fails here, so the folder can never drift from the registry.
 *
 * The files use `currentColor`, like Lucide and Phosphor, so an icon takes the
 * text color of wherever it is placed. The gallery's Copy/Download still bake
 * the color chosen on the page.
 */

const DIR = new URL("../../icons/", import.meta.url);

function fileSvg(id: string): string {
  const icon = icons.find((i) => i.id === id)!;
  const cells = icon.cells.map((c) => (c === null ? null : "currentColor"));
  return iconToSvg({ ...icon, cells }, { size: DEFAULT_ICON_SIZE }) + "\n";
}

describe("icons/ folder", () => {
  for (const { id } of icons) {
    it(`${id}.svg matches the registry`, async () => {
      await expect(fileSvg(id)).toMatchFileSnapshot(`../../icons/${id}.svg`);
    });
  }

  // Missing files fail the snapshots above; this catches the other direction.
  it("holds nothing but registry icons", () => {
    const ids = new Set(icons.map((i) => `${i.id}.svg`));
    const stray = readdirSync(DIR).filter((f) => !f.startsWith(".") && !ids.has(f));
    expect(stray, "delete these from icons/").toEqual([]);
  });
});
