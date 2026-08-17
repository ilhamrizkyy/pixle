"use client";

import { useState } from "react";
import { galleryColorFromInput } from "@/engine/color";
import {
  DEFAULT_ICON_SIZE,
  ICON_SIZES,
  PADDING_STEPS,
} from "@/engine/constants";
import { IDENTITY_ORIENTATION, type Orientation } from "@/engine/transform";
import { CATEGORIES } from "@/engine/types";
import type { Category } from "@/engine/types";
import { TransformControls } from "./TransformControls";

/**
 * Gallery sidebar: Search, Display (color / size / gridlines), Categories.
 *
 * The color control is DISPLAY ONLY — one hex recolors every icon in the
 * gallery, the way Lucide's customizer works. It never touches stored icons or
 * what gets copied and downloaded.
 *
 * There is no "no color" state: icons always render in exactly one color,
 * defaulting to black in light and white in dark. Clearing the field returns
 * to that default rather than to per-icon colors.
 *
 * Light/Dark moved out of here: theme is now a whole-app control in the nav.
 */

export type CategoryFilter = Category | "all";

type GallerySidebarProps = {
  search: string;
  onSearch: (value: string) => void;
  /**
   * Raw text of the hex field, or null to follow the theme default. Held by
   * the parent (not local state) so Reset can clear it without an effect
   * syncing two sources of truth.
   */
  colorText: string | null;
  onColorText: (value: string | null) => void;
  /** The color actually in effect. Never null — icons always have a color. */
  color: string;
  size: number;
  onSize: (value: number) => void;
  /** Padding in cells. */
  padding: number;
  onPadding: (value: number) => void;
  orientation: Orientation;
  onOrientation: (value: Orientation) => void;
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
  colorText,
  onColorText,
  color,
  size,
  onSize,
  padding,
  onPadding,
  orientation,
  onOrientation,
  category,
  onCategory,
  counts,
  total,
}: GallerySidebarProps) {
  /**
   * On narrow screens the controls collapse behind a Filters toggle, so the
   * icons are not pushed below a screenful of chrome. On lg and up the panel
   * is always shown: `lg:block` beats the conditional `hidden`, so this state
   * is simply ignored there and needs no media query in JS.
   */
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Position of the fill along the track.
  const progress = ((size - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100;

  // What the field shows: the typed text, or the theme default when untouched.
  const fieldValue = (colorText ?? color).replace(/^#/, "");
  // Parse rather than compare strings — "#FF0000" is valid but not equal to
  // the normalized "#ff0000".
  const invalid =
    colorText !== null &&
    colorText.trim() !== "" &&
    galleryColorFromInput(colorText) === null;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-b border-border px-6 py-6 lg:min-h-[calc(100vh-73px)] lg:w-66 lg:gap-8 lg:border-r lg:border-b-0 lg:py-7">
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

      {/* Mobile-only entry point to the rest of the controls. */}
      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
        aria-controls="gallery-filters"
        className="flex items-center justify-between rounded-sm border border-border bg-surface px-3 py-2.5 text-ui text-text lg:hidden"
      >
        <span>
          Filters
          {category !== "all" && (
            <span className="ml-2 text-caption text-accent">1 active</span>
          )}
        </span>
        <span aria-hidden="true" className="text-caption text-text-muted">
          {filtersOpen ? "▲" : "▼"}
        </span>
      </button>

      <div
        id="gallery-filters"
        className={`flex-col gap-6 lg:flex lg:gap-8 ${
          filtersOpen ? "flex" : "hidden"
        }`}
      >
        <section>
          <SectionHead title="Display">
            <ResetButton
              onClick={() => {
                onColorText(null);
                onSize(DEFAULT_ICON_SIZE);
                onPadding(0);
                onOrientation(IDENTITY_ORIENTATION);
              }}
            />
          </SectionHead>

          {/* ---- Color ---------------------------------------------------- */}
          <label
            htmlFor="icon-color"
            className="mb-2 block text-caption text-text-muted"
          >
            Color
          </label>

          <div
            className={`flex items-center gap-2 rounded-sm border bg-surface px-2 py-1.5 focus-within:border-accent ${
              invalid ? "border-danger" : "border-border"
            }`}
          >
            {/* The swatch is a native color input, so clicking it opens the OS
              picker while the text field stays the primary way in. */}
            <label
              className="size-5 shrink-0 cursor-pointer rounded-xs border border-border"
              style={{ backgroundColor: color }}
              title="Pick a color"
            >
              <input
                type="color"
                value={color}
                onChange={(event) => onColorText(event.target.value)}
                className="sr-only"
                aria-label="Pick a color"
              />
            </label>

            {/* The # and the digits form one string, so they sit flush with no
              gap between them — "#000000", not "# 000000". */}
            <div className="flex min-w-0 flex-1 items-center font-data text-ui text-text">
              <span aria-hidden="true">#</span>
              <input
                id="icon-color"
                type="text"
                inputMode="text"
                spellCheck={false}
                autoComplete="off"
                value={fieldValue}
                onChange={(event) => onColorText(event.target.value)}
                aria-invalid={invalid}
                className="w-full min-w-0 bg-transparent uppercase focus:outline-none"
              />
            </div>
            {colorText !== null && (
              <button
                type="button"
                onClick={() => onColorText(null)}
                aria-label="Reset to theme default"
                className="shrink-0 px-1 text-caption text-text-muted hover:text-text"
              >
                ✕
              </button>
            )}
          </div>

          {invalid && (
            <p className="mt-1.5 text-caption text-danger">
              Needs 3 or 6 hex digits.
            </p>
          )}

          {/* ---- Size ----------------------------------------------------- */}
          <div className="mt-6">
            <label
              htmlFor="icon-size"
              className="mb-1 block text-caption text-text-muted"
            >
              Size
            </label>

            {/* No value bubble: the tick labels below already show the current
              size, and the active one is highlighted. */}
            <div>
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

          {/* ---- Padding -------------------------------------------------- */}
          <div className="mt-5">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-caption text-text-muted">Padding</span>
              <span className="font-data text-caption text-text-faint">
                {padding === 0 ? "none" : `${padding} cell`}
              </span>
            </div>
            <div className="flex gap-1.5">
              {PADDING_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => onPadding(step)}
                  aria-pressed={padding === step}
                  className={`flex-1 rounded-sm border py-1.5 font-data text-caption transition-colors ${
                    padding === step
                      ? "border-accent bg-accent-subtle font-bold text-accent"
                      : "border-border bg-surface text-text-muted hover:text-text"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* ---- Transform ------------------------------------------------ */}
          <TransformControls
            orientation={orientation}
            onOrientation={onOrientation}
          />
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
      </div>
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
    <button
      type="button"
      onClick={onClick}
      className="text-caption text-accent"
    >
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
