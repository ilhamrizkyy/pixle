# Contributing to Pixle

Thanks for helping. Most contributions are new icons, and adding one takes a
single edit.

## Setup

You need Node.js 20.9 or newer.

```bash
git clone https://github.com/ilhamrizkyy/pixle.git
cd pixle
npm install
npm run dev        # http://localhost:3000
```

No environment variables or accounts are needed.

## Add an icon

Every icon lives in [`src/registry/icons.ts`](src/registry/icons.ts) as an
**art map**: 11 rows of 11 characters, where `#` is a filled cell and `.` is
empty. Add one `defineIcon` entry to the `icons` array:

```ts
defineIcon({
  id: "heart",
  name: "heart",
  category: "arcade",
  tags: ["love", "like", "life"],
  createdAt: "2026-10-15T00:00:00.000Z",
  palette: INK,
  art: [
    "...........",
    "..##...##..",
    ".#..#.#..#.",
    ".#...#...#.",
    ".#.......#.",
    "..#.....#..",
    "...#...#...",
    "....#.#....",
    ".....#.....",
    "...........",
    "...........",
  ],
}),
```

Then regenerate the SVG folder and run the tests:

```bash
npm run icons      # writes icons/<id>.svg
npm test
```

Commit both the registry change and the new file in `icons/`, then open a pull
request.

### The rules (the tests check all of these)

- **11 by 11, inside the 9 by 9 safe area.** Leave the outer ring of cells
  empty, so every icon has the same one-cell margin.
- **One color.** Use `palette: INK`. Color is chosen by whoever uses the icon.
- **Outlines, not filled shapes.** The icon has to read as a silhouette at
  16px. A filled envelope is just a rectangle; an outlined one is an envelope.
- **kebab-case** for `id`, `name` and every tag: `arrow-right`, not
  `arrowRight`. The `id` is permanent once merged, so choose it carefully.
- **One of six categories:** `interface`, `media`, `arcade`, `system`,
  `communication`, `nature`.
- **Draw it yourself.** Don't trace or downsample another set's icons.

Check it in the gallery at `localhost:3000` at 16px and 24px before opening the
PR.

## Code changes

```bash
npm run lint
npm run typecheck
npm test
```

CI runs these plus a production build on every pull request. The rendering
logic lives in `src/engine/` and must stay free of React and DOM imports, so it
can be tested on its own.

By contributing, you agree your work is released under the [MIT license](LICENSE).
