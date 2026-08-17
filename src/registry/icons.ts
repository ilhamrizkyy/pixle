/**
 * The seed icon set — one icon per category, to exercise the whole taxonomy
 * and the multi-color model from day one.
 *
 * Every icon is drawn inside the 9x9 safe area (rows/cols 1–9), leaving the
 * symmetric 1-cell margin. Names, ids, and tags are kebab-case.
 *
 * SINGLE COLOR. The gallery always renders icons in one color, so every seed
 * is authored in one color too — multi-color cell data would be unreachable,
 * and would only surface as a surprise in an exported SVG.
 *
 * DRAWING NOTE: an icon must read as a silhouette. Draw OUTLINES, not filled
 * masses whose meaning depends on internal contrast — a filled envelope with a
 * lighter interior is a plain rectangle in one color; an outlined one survives.
 */

import type { IconDef } from "@/engine/types";
import { defineIcon } from "./authoring";

const SEEDED_AT = "2026-08-17T00:00:00.000Z";

export const icons: readonly IconDef[] = [
  defineIcon({
    id: "arrow-right",
    name: "arrow-right",
    category: "interface",
    tags: ["arrow", "right", "next", "forward", "direction"],
    createdAt: SEEDED_AT,
    palette: { "#": "#111111" },
    art: [
      "...........",
      "...........",
      "...........",
      ".......#...",
      "........#..",
      ".#########.",
      "........#..",
      ".......#...",
      "...........",
      "...........",
      "...........",
    ],
  }),

  defineIcon({
    id: "play",
    name: "play",
    category: "media",
    tags: ["play", "start", "media", "video", "triangle"],
    createdAt: SEEDED_AT,
    palette: { "#": "#111111" },
    art: [
      "...........",
      "...#.......",
      "...##......",
      "...###.....",
      "...####....",
      "...#####...",
      "...####....",
      "...###.....",
      "...##......",
      "...#.......",
      "...........",
    ],
  }),

  defineIcon({
    id: "heart",
    name: "heart",
    category: "arcade",
    tags: ["heart", "life", "health", "love", "favorite"],
    createdAt: SEEDED_AT,
    palette: { "#": "#111111" },
    art: [
      "...........",
      "..##...##..",
      ".#########.",
      ".#########.",
      ".#########.",
      ".#########.",
      "..#######..",
      "...#####...",
      "....###....",
      ".....#.....",
      "...........",
    ],
  }),

  defineIcon({
    id: "floppy-disk",
    name: "floppy-disk",
    category: "system",
    tags: ["floppy", "disk", "save", "storage", "file"],
    createdAt: SEEDED_AT,
    palette: { "#": "#111111" },
    art: [
      "...........",
      ".#########.",
      ".#..###..#.",
      ".#..#.#..#.",
      ".#..###..#.",
      ".#.......#.",
      ".#.#####.#.",
      ".#.#...#.#.",
      ".#.#####.#.",
      ".#########.",
      "...........",
    ],
  }),

  defineIcon({
    id: "mail",
    name: "mail",
    category: "communication",
    tags: ["mail", "email", "envelope", "message", "inbox"],
    createdAt: SEEDED_AT,
    palette: { "#": "#111111" },
    art: [
      "...........",
      "...........",
      ".#########.",
      ".##.....##.",
      ".#.##.##.#.",
      ".#..###..#.",
      ".#.......#.",
      ".#.......#.",
      ".#########.",
      "...........",
      "...........",
    ],
  }),

  defineIcon({
    id: "sun",
    name: "sun",
    category: "nature",
    tags: ["sun", "weather", "light", "day", "bright"],
    createdAt: SEEDED_AT,
    palette: { "#": "#111111" },
    art: [
      "...........",
      ".....#.....",
      "..#.....#..",
      "....###....",
      "...#####...",
      ".#.#####.#.",
      "...#####...",
      "....###....",
      "..#.....#..",
      ".....#.....",
      "...........",
    ],
  }),
];

/** Look up one icon by its stable id. */
export function getIcon(id: string): IconDef | undefined {
  return icons.find((icon) => icon.id === id);
}
