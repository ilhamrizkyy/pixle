/**
 * The seed icon set — one icon per category, to exercise the whole taxonomy
 * and the multi-color model from day one.
 *
 * Every icon is drawn inside the 9x9 safe area (rows/cols 1–9), leaving the
 * symmetric 1-cell margin. Names, ids, and tags are kebab-case.
 *
 * DRAWING NOTE: the gallery can flatten every cell to one color, so icons are
 * drawn as OUTLINES rather than as filled masses whose meaning depends on
 * internal color contrast. A filled envelope with a lighter interior reads as
 * a solid rectangle the moment one color is applied; an outlined one survives.
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
    // Solid on purpose: a filled heart still reads as a heart when the gallery
    // flattens it, and the glint demonstrates the multi-color model.
    palette: { "#": "#dc2626", o: "#ffffff" },
    art: [
      "...........",
      "..##...##..",
      ".#oo######.",
      ".#o#######.",
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
    // Rays and core read as separate shapes rather than relying on color to
    // tell them apart, so the sun survives being flattened to one color.
    palette: { "#": "#92400e", o: "#fef08a" },
    art: [
      "...........",
      ".....#.....",
      "..#.....#..",
      "....ooo....",
      "...ooooo...",
      ".#.ooooo.#.",
      "...ooooo...",
      "....ooo....",
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
