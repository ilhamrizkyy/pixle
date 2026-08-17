/**
 * The seed icon set — one icon per category, to exercise the whole taxonomy
 * and the multi-color model from day one.
 *
 * Every icon is drawn inside the 9x9 safe area (rows/cols 1–9), leaving the
 * symmetric 1-cell margin. Colors are baked literals per cell.
 */

import type { IconDef } from "@/engine/types";
import { defineIcon } from "./authoring";

const SEEDED_AT = "2026-08-17T00:00:00.000Z";

export const icons: readonly IconDef[] = [
  defineIcon({
    id: "arrow-right",
    name: "Arrow Right",
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
    name: "Play",
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
    name: "Heart",
    category: "arcade",
    tags: ["heart", "life", "health", "love", "favorite"],
    createdAt: SEEDED_AT,
    // Two colors: the red body and the classic 8-bit glint.
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
    name: "Floppy Disk",
    category: "system",
    tags: ["floppy", "disk", "save", "storage", "file"],
    createdAt: SEEDED_AT,
    palette: { "#": "#3f3f46", o: "#fafafa" },
    art: [
      "...........",
      ".#########.",
      ".###ooo###.",
      ".###ooo###.",
      ".#########.",
      ".#########.",
      ".#ooooooo#.",
      ".#ooooooo#.",
      ".#ooooooo#.",
      ".#########.",
      "...........",
    ],
  }),

  defineIcon({
    id: "mail",
    name: "Mail",
    category: "communication",
    tags: ["mail", "email", "envelope", "message", "inbox"],
    createdAt: SEEDED_AT,
    palette: { "#": "#111111", o: "#e8edff" },
    art: [
      "...........",
      "...........",
      ".#########.",
      ".##ooooo##.",
      ".#o#ooo#o#.",
      ".#oo###oo#.",
      ".#ooooooo#.",
      ".#ooooooo#.",
      ".#########.",
      "...........",
      "...........",
    ],
  }),

  defineIcon({
    id: "sun",
    name: "Sun",
    category: "nature",
    tags: ["sun", "weather", "light", "day", "bright"],
    createdAt: SEEDED_AT,
    palette: { "#": "#d97706", o: "#eab308" },
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
