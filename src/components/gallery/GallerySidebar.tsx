"use client";

import { ICON_SIZES } from "@/engine/constants";
import { CATEGORIES } from "@/engine/types";
import type { Category } from "@/engine/types";

/**
 * Gallery sidebar (DESIGN.md §6): Search, Display, Categories.
 *
 * Category counts follow the ACTIVE SEARCH, not the whole set — so a count of
 * 0 tells you the search excluded that category, which is the useful signal.
 */

export type CategoryFilter = Category | "all";

type GallerySidebarProps = {
  search: string;
  onSearch: (value: string) => void;
  size: number;
  onSize: (value: number) => void;
  dark: boolean;
  onDark: (value: boolean) => void;
  category: CategoryFilter;
  onCategory: (value: CategoryFilter) => void;
  counts: Record<Category, number>;
  total: number;
};

const SIZE_MIN = ICON_SIZES[0];
const SIZE_MAX = ICON_SIZES[ICON_SIZES.length - 1];

export function GallerySidebar({
  search,
  onSearch,
  size,
  onSize,
  dark,
  onDark,
  category,
  onCategory,
  counts,
  total,
}: GallerySidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 border-b border-border px-6 py-7 lg:min-h-[calc(100vh-73px)] lg:w-66 lg:border-r lg:border-b-0">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-caption font-bold tracking-widest uppercase">
            Search
          </h3>
          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="text-caption text-accent"
            >
              Reset
            </button>
          )}
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search icons…"
          aria-label="Search icons by name or tag"
          className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-ui text-text placeholder:text-text-faint focus:border-accent"
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-caption font-bold tracking-widest uppercase">
            Display
          </h3>
          <button
            type="button"
            onClick={() => {
              onSize(32);
              onDark(false);
            }}
            className="text-caption text-accent"
          >
            Reset
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="icon-size" className="text-caption text-text-muted">
            Size
          </label>
          <span className="font-data text-caption text-text-faint">
            {size}px
          </span>
        </div>
        <input
          id="icon-size"
          type="range"
          min={SIZE_MIN}
          max={SIZE_MAX}
          step={8}
          value={size}
          onChange={(event) => onSize(Number(event.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-1.5 font-data text-caption tracking-wider text-text-faint">
          {ICON_SIZES.join(" · ")}
        </div>

        <div
          role="group"
          aria-label="Preview background"
          className="mt-4 flex gap-1.5"
        >
          {[
            { label: "Light", value: false },
            { label: "Dark", value: true },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={dark === option.value}
              onClick={() => onDark(option.value)}
              className={`flex-1 rounded-sm border px-3 py-1.5 text-caption ${
                dark === option.value
                  ? "border-accent bg-accent-subtle font-bold text-accent"
                  : "border-border bg-surface text-text-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-caption font-bold tracking-widest uppercase">
          Categories
        </h3>
        <ul className="flex flex-col gap-0.5 p-0 list-none">
          <li>
            <CategoryButton
              label="All"
              count={total}
              active={category === "all"}
              onClick={() => onCategory("all")}
            />
          </li>
          {CATEGORIES.map((entry) => (
            <li key={entry.id}>
              <CategoryButton
                label={entry.label}
                count={counts[entry.id]}
                active={category === entry.id}
                onClick={() => onCategory(entry.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function CategoryButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-ui ${
        active
          ? "bg-accent-subtle font-bold text-accent"
          : "text-text hover:bg-surface"
      }`}
    >
      <span>{label}</span>
      <span
        className={`font-data text-caption ${
          active ? "text-accent" : "text-text-faint"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
