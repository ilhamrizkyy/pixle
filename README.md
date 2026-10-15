# Pixle

An open-source pixel icon set. Every icon is drawn cell by cell on the same
11 by 11 grid, so the set reads as one family. MIT licensed.

## Use the icons

**From the website.** Search or filter, pick a color, shape and size, then copy
the icon as SVG, React, HTML, CSS or a data URI, or download SVG or PNG. What
you see is what you copy.

**From this repo.** Every icon is a ready-to-use file in [`icons/`](icons):

```html
<img src="icons/heart.svg" width="24" height="24" alt="Heart" />
```

The files use `fill="currentColor"`, so inline SVG takes the text color around
it. They are 24px by default and stay crisp at any multiple of 8 (16, 24, 32,
48...).

## Run it locally

Requires Node.js 20.9 or newer. No accounts or environment variables needed.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm test` | Unit tests (engine, registry, components, `icons/` sync) |
| `npm run icons` | Regenerate `icons/` from the registry |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run test:e2e` | Playwright browser tests |

## Add an icon

Icons are written as 11-line text "art maps" in
[`src/registry/icons.ts`](src/registry/icons.ts), so a changed pixel is a
changed character in the diff. See [CONTRIBUTING.md](CONTRIBUTING.md).

## How it's built

An icon **is** its 121 cells. SVG and PNG are generated from them, never
stored.

```
icons/          Generated SVGs (one per icon)
src/engine/     Pure TypeScript: grid, render, SVG/PNG export. No React, no DOM.
src/registry/   The icon set, as art maps
src/components/ The website
src/composer/   The drawing tool (owner-only, see below)
src/app/        Next.js routes and styles
```

Next.js, TypeScript and Tailwind, deployed to Cloudflare Workers.

## For maintainers

<details>
<summary>The composer, deploys and the optional database</summary>

**Composer.** `/create` is the in-browser tool the icons are drawn in. It is
owner-only: it returns 404 unless `PIXLE_COMPOSER_ENABLED=true`, which you set
in `.env.local` for local use. "Copy entry" puts a `defineIcon(...)` block on
the clipboard to paste into the registry.

**Deploy.** `npm run deploy` builds for Cloudflare Workers through
`scripts/build-cloudflare.mjs`, which forces the composer off in the bundle and
fails the build if it was baked on, because the adapter bakes `.env.local` into
the Worker. `npm run preview` runs the Worker locally.

**Database (optional).** Supabase can hold published icons alongside the repo's
set. Leave it unset and the site shows the repo's icons. To use it: run
[`supabase/schema.sql`](supabase/schema.sql) in a Supabase project, put the keys
from [`.env.example`](.env.example) in `.env.local`, and run `npm run db:seed`.
Never set the secret key on the Worker.

</details>

## License

[MIT](LICENSE) © 2026 Ilham Rizky Akbar
