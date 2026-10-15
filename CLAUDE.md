# CLAUDE.md

**Pixle**: an open-source pixel icon set (MIT), a public gallery at `/`, and
an owner-only composer at `/create`. See README.md and CONTRIBUTING.md.

## Rules

1. **The composer is owner-only.** `/create` 404s unless
   `PIXLE_COMPOSER_ENABLED=true` (checked server-side in `src/lib/owner.ts`).
   Never link to it from a public page. `scripts/build-cloudflare.mjs` forces it
   off in deploy bundles; don't weaken that.
2. **Cells are the source of truth.** An icon is 121 cells (11 by 11, viewBox
   `0 0 44 44`). SVG, PNG and `icons/*.svg` are generated from them.
3. **`src/engine/` stays pure TypeScript**: no React, DOM, Canvas or WebGL.
4. **Icons:** one color, outlines, inside the 9 by 9 safe area, kebab-case ids,
   one of six categories. Tests enforce all of it. After changing the registry,
   run `npm run icons`.
5. **Display settings never touch stored cells.** The gallery's color, shape
   and size are view state; Copy/Download follow them.
6. **A fresh clone must just work**: no env vars required. Supabase is optional
   and the gallery falls back to the repo's icons.
7. **Keep it simple.** Least code that works. Comments explain why, briefly;
   they don't narrate past redesigns (git has the history).

## Style

- Page copy: American English, active voice, no em dashes.
- Colors and spacing come from the CSS variables in `src/app/globals.css`.
- Respect `prefers-reduced-motion`; keep everything keyboard-reachable.

## Commands

`npm run dev` · `npm test` · `npm run icons` · `npm run lint` ·
`npm run typecheck` · `npm run test:e2e`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
