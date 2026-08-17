import { IconPreview } from "@/components/IconPreview";
import { CATEGORIES } from "@/engine/types";
import { icons } from "@/registry";

/**
 * Phase 0 shell. Deliberately not the gallery — no search, sidebar, filters,
 * or detail modal, all of which are Phase 1. This page exists to prove the
 * chain end to end: tokens render, the registry loads, and cells become SVG.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-accent">Pixle</h1>
        <p className="mt-6 max-w-prose text-text-muted">
          An open-source pixel, 32-bit, and arcade icon set, with an in-browser
          composer. MIT licensed.
        </p>
      </header>

      <section className="mb-12">
        <h3 className="mb-4">Seed icons</h3>
        <ul className="flex flex-wrap gap-[14px] p-0 list-none">
          {icons.map((icon) => (
            <li
              key={icon.id}
              className="flex min-w-[92px] flex-col items-center gap-3 rounded-md bg-surface p-4"
            >
              <IconPreview cells={icon.cells} size={32} title={icon.name} />
              <span className="text-caption text-text-muted">{icon.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h3 className="mb-4">Categories</h3>
        <ul className="flex flex-wrap gap-2 p-0 list-none">
          {CATEGORIES.map((category) => (
            <li
              key={category.id}
              className="rounded-sm border border-border px-3 py-1 text-caption text-text-muted"
            >
              {category.label}
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border pt-6 text-caption text-text-faint">
        Phase 0 — foundation. The gallery is Phase 1; the composer is owner-only
        and arrives in Phase 2.
      </footer>
    </main>
  );
}
