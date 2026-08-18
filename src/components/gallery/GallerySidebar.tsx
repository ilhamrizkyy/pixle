"use client";

import type { Category } from "@/engine/types";
import { GalleryControls, ResetButton, SectionHead } from "./GalleryControls";
import type { GallerySettings } from "./settings";

/**
 * Gallery sidebar.
 *
 * Below `lg` this is just the search row plus a button that opens the filter
 * sheet — the controls themselves live in that sheet, so the icons are never
 * pushed below a screenful of chrome.
 *
 * At `lg` and up the same controls render inline and apply LIVE, because a
 * permanent sidebar has room to show their effect immediately. Only the sheet
 * defers behind Apply.
 */

type GallerySidebarProps = {
  search: string;
  onSearch: (value: string) => void;
  settings: GallerySettings;
  onSettings: (next: GallerySettings) => void;
  /** The color actually in effect. Never null — icons always have a color. */
  color: string;
  onOpenFilters: () => void;
  filtersOpen: boolean;
  counts: Record<Category, number>;
  total: number;
};

export function GallerySidebar({
  search,
  onSearch,
  settings,
  onSettings,
  color,
  onOpenFilters,
  filtersOpen,
  counts,
  total,
}: GallerySidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-b border-border px-6 py-6 lg:min-h-[calc(100vh-73px)] lg:w-66 lg:gap-8 lg:border-r lg:border-b-0 lg:py-7">
      <section>
        <SectionHead title="Search">
          {search && <ResetButton onClick={() => onSearch("")} />}
        </SectionHead>

        {/* On phones the filter button sits INLINE with search, as one row,
            rather than taking a row of its own — the Lucide mobile layout. */}
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search icons…"
            aria-label="Search icons by name or tag"
            className="w-full min-w-0 rounded-sm border border-border bg-surface px-3 py-2.5 text-ui text-text placeholder:text-text-faint focus:border-accent"
          />
          <button
            type="button"
            onClick={onOpenFilters}
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
            aria-label="Filters"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-text-muted lg:hidden"
          >
            <FilterGlyph />
            {/* A dot rather than a count: only one category can be active. */}
            {settings.category !== "all" && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-1 size-1.5 rounded-full bg-accent"
              />
            )}
          </button>
        </div>
      </section>

      <div className="hidden lg:flex lg:flex-col lg:gap-8">
        <GalleryControls
          settings={settings}
          onChange={onSettings}
          color={color}
          counts={counts}
          total={total}
        />
      </div>
    </aside>
  );
}

/** Sliders glyph for the mobile filter button. */
function FilterGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h10M4 17h6" />
    </svg>
  );
}
