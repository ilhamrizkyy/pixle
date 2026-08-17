"use client";

import { ICON_SIZES } from "@/engine/constants";
import { TINT_PRESETS, hueName, tintFromHex } from "@/engine/color";
import { CATEGORIES } from "@/engine/types";
import type { Category } from "@/engine/types";

/**
 * Gallery sidebar: Search, Display (color / size / gridlines), Categories.
 *
 * The color control is a DISPLAY tint — it re-hues the previews so the gallery
 * reads as one palette, and never touches stored icons or exports. Each cell
 * keeps its own lightness, which is what stops an envelope from flattening
 * into a rectangle.
 *
 * Light/Dark moved out of here: theme is now a whole-app control in the nav.
 */

export type CategoryFilter = Category | "all";

type GallerySidebarProps = {
  search: string;
  onSearch: (value: string) => void;
  /** Hex of the active tint, or null for each icon's own colors. */
  tint: string | null;
  onTint: (value: string | null) => void;
  size: number;
  onSize: (value: number) => void;
  showGrid: boolean;
  onShowGrid: (value: boolean) => void;
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
  tint,
  onTint,
  size,
  onSize,
  showGrid,
  onShowGrid,
  category,
  onCategory,
  counts,
  total,
}: GallerySidebarProps) {
  // Position of the fill and the value bubble along the track.
  const progress = ((size - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100;
  const tintHsl = tint === null ? null : tintFromHex(tint);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 border-b border-border px-6 py-7 lg:min-h-[calc(100vh-73px)] lg:w-66 lg:border-r lg:border-b-0">
      <section>
        <SectionHead title="Search">
          {search && <ResetButton onClick={() => onSearch("")} />}
        </SectionHead>
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
        <SectionHead title="Display">
          <ResetButton
            onClick={() => {
              onTint(null);
              onSize(32);
              onShowGrid(false);
            }}
          />
        </SectionHead>

        {/* ---- Color ---------------------------------------------------- */}
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-caption text-text-muted">Color</span>
          <span className="font-data text-caption text-text-faint">
            {tintHsl === null ? "Original" : hueName(tintHsl.h)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onTint(null)}
            aria-pressed={tint === null}
            title="Each icon's own colors"
            className={`size-6 rounded-sm border-2 ${
              tint === null
                ? "border-accent"
                : "border-border hover:border-text-faint"
            }`}
            style={{
              // A quartered swatch reads as "many colors" at a glance, which
              // is exactly what "Original" means here.
              backgroundImage:
                "linear-gradient(135deg,#dc2626 0 25%,#d97706 25% 50%,#16a34a 50% 75%,#2b5bff 75% 100%)",
            }}
          >
            <span className="sr-only">Original colors</span>
          </button>

          {TINT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onTint(preset)}
              aria-pressed={tint === preset}
              title={preset}
              className={`size-6 rounded-sm border-2 ${
                tint === preset
                  ? "border-accent"
                  : "border-border hover:border-text-faint"
              }`}
              style={{ backgroundColor: preset }}
            >
              <span className="sr-only">Tint {hueName(tintFromHex(preset)?.h ?? 0)}</span>
            </button>
          ))}

          <label
            className="flex size-6 cursor-pointer items-center justify-center rounded-sm border-2 border-border text-caption text-text-muted hover:border-text-faint"
            title="Custom color"
          >
            +
            <input
              type="color"
              value={tint ?? "#2b5bff"}
              onChange={(event) => onTint(event.target.value)}
              className="sr-only"
              aria-label="Custom tint color"
            />
          </label>
        </div>

        <p className="mt-2 text-caption text-text-faint">
          Preview only — copies keep each icon&apos;s own colors.
        </p>

        {/* ---- Size ----------------------------------------------------- */}
        <div className="mt-6">
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor="icon-size" className="text-caption text-text-muted">
              Size
            </label>
          </div>

          <div className="relative pt-6">
            {/* Value bubble rides the thumb. The 20px thumb means its centre
                travels only (100% - 20px), so the offset is corrected by
                translating back a matching fraction of the thumb width. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-sm border border-border bg-surface px-1.5 py-0.5 font-data text-caption text-text"
              style={{
                left: `calc(${progress}% + ${10 - (progress / 100) * 20}px)`,
              }}
            >
              {size}px
            </span>

            <input
              id="icon-size"
              type="range"
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={8}
              value={size}
              onChange={(event) => onSize(Number(event.target.value))}
              className="pixl-range"
              style={{ "--fill": `${progress}%` } as React.CSSProperties}
            />

            <div className="mt-1 flex justify-between px-0.5">
              {ICON_SIZES.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => onSize(step)}
                  className={`font-data text-caption transition-colors ${
                    size === step
                      ? "font-bold text-accent"
                      : "text-text-faint hover:text-text-muted"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Gridlines ------------------------------------------------ */}
        <button
          type="button"
          role="switch"
          aria-checked={showGrid}
          onClick={() => onShowGrid(!showGrid)}
          className="mt-5 flex w-full items-center justify-between rounded-sm border border-border bg-surface px-3 py-2 text-ui text-text hover:border-text-faint"
        >
          <span className="text-caption text-text-muted">Gridlines</span>
          <span
            aria-hidden="true"
            className={`relative h-5 w-9 rounded-full transition-colors ${
              showGrid ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 size-4 rounded-full bg-bg transition-transform ${
                showGrid ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </section>

      <section>
        <SectionHead title="Categories" />
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

function SectionHead({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-caption font-bold tracking-widest uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-caption text-accent">
      Reset
    </button>
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
