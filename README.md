# Pixle

An open-source pixel / 32-bit / arcade **icon set**, plus an in-browser
**composer** styled like an Etch A Sketch. MIT licensed.

> **Status: Phase 1 complete — the public gallery is live.** 24 icons, search,
> filtering, a single-color customizer, size/padding/transform controls, and
> copy/download that matches what you see. The owner-only composer is Phase 2.
> See [PLAN.md](PLAN.md).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm test` | Vitest over the engine + registry |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Architecture

One rule holds the project together: **the icon engine is decoupled from
presentation.**

```
src/
  engine/      Pure TypeScript. No React, DOM, Canvas, or WebGL imports, ever.
  registry/    The static icon set, authored as ASCII art maps.
  components/  Presentation. Reads engine state, forwards input to it.
  app/         Next.js App Router + design tokens.
```

An icon **is** its 11×11 grid of cells — SVG and PNG are render targets
generated from that data, never the stored form. Because the engine knows
nothing about rendering, the composer can ship as DOM/CSS-3D now and become a
React Three Fiber toy later as a presentation swap rather than a rewrite.

### Grid

11×11 cells on `viewBox "0 0 44 44"` (4 units per cell), with a **9×9 safe
area** leaving a symmetric 1-cell margin. Colors are **baked per cell** — a
literal hex on every cell, no `currentColor`, no theme inheritance, no
downstream recoloring.

### Authoring an icon

Icons are written as art maps so a changed pixel shows up as a changed
character in review. Malformed art throws at module load, failing the build:

```ts
defineIcon({
  id: "heart",
  name: "Heart",
  category: "arcade",
  tags: ["heart", "life"],
  createdAt: "2026-08-17T00:00:00.000Z",
  palette: { "#": "#dc2626", o: "#ffffff" },
  art: [
    "...........",
    "..##...##..",
    // ...9 more rows of 11 characters
  ],
});
```

## Access control

The composer is **owner-only** and gated server-side. The public may browse the
gallery and read the Guide and Resources — nothing else. Public contribution is
a future phase.

## Deploying

Zero-config on Vercel — import the repo and it builds with the defaults. No
`vercel.json` is needed.

## Docs

[CLAUDE.md](CLAUDE.md) is the constitution and index; it links
[DESIGN.md](DESIGN.md), [INTERACTION.md](INTERACTION.md),
[TECH-STACK.md](TECH-STACK.md), [PLAN.md](PLAN.md), and
[BACKLOG.md](BACKLOG.md).

## License

[MIT](LICENSE) © 2026 Ilham Rizky Akbar
