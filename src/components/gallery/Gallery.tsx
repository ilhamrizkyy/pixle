"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconPreview, glyph } from "@/components/IconPreview";
import { groundFor, galleryColorFromInput, recolorCells } from "@/engine/color";
import { DEFAULT_ICON_SIZE, SIZE_STOPS, renderedIconSize } from "@/engine/constants";
import { DEFAULT_CELL_STYLE, type CellStyle } from "@/engine/render";
import { CATEGORIES, type Category, type IconDef } from "@/engine/types";
import { useLocalIcons } from "@/composer/useLocalIcons";
import { CLOSE_MS, useDismissible } from "@/lib/useDismissible";
import { THEME_ICON_COLOR, useResolvedTheme } from "@/lib/theme";
import { mergeIcons } from "@/registry/merge";
import { searchIcons } from "@/registry/search";
import { IconDetail } from "./IconDetail";
import "./gallery.css";

/** Focused by the hero's "Explore icons". */
export const ICON_PANEL_ID = "icon-panel";

const SHAPES: { id: CellStyle; label: string }[] = [
  { id: "solid", label: "Square" },
  { id: "gap", label: "Inset" },
  { id: "dots", label: "Round" },
];

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORIES,
];

const MIN_SIZE = SIZE_STOPS[0];
const MAX_SIZE = SIZE_STOPS[SIZE_STOPS.length - 1];

const SEARCH = glyph("search");
const CLOSE = glyph("close");

export function Gallery({ icons: registry }: { icons: readonly IconDef[] }) {
  // Icons the owner saved in the composer, in this browser only.
  const local = useLocalIcons();
  const icons = useMemo(() => mergeIcons(registry, local), [registry, local]);
  const localIds = useMemo(() => {
    const published = new Set(registry.map((i) => i.id));
    return new Set(local.filter((i) => !published.has(i.id)).map((i) => i.id));
  }, [registry, local]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [shape, setShape] = useState<CellStyle>(DEFAULT_CELL_STYLE);
  const [size, setSize] = useState<number>(DEFAULT_ICON_SIZE);
  // null = the theme's ink. The grid draws it as currentColor, so there is no
  // flash of black icons on a dark page before hydration.
  const [color, setColor] = useState<string | null>(null);
  const [hexText, setHexText] = useState("");
  const [selected, setSelected] = useState<IconDef | null>(null);

  const themeInk = THEME_ICON_COLOR[useResolvedTheme()];
  const shelf = useDismissible(() => setSelected(null), CLOSE_MS.modal);
  const select = (icon: IconDef) => {
    shelf.cancel();
    if (selected?.id === icon.id) shelf.requestClose();
    else setSelected(icon);
  };

  const shown = useMemo(
    () =>
      searchIcons(icons, query).filter(
        (icon) => category === "all" || icon.category === category,
      ),
    [icons, query, category],
  );

  const ink = color ?? "currentColor";
  const drawn = useMemo(
    () => new Map(icons.map((icon) => [icon.id, recolorCells(icon.cells, ink)])),
    [icons, ink],
  );

  // "/" focuses search from anywhere outside a text field.
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key !== "/" || target.closest("input, textarea, select, [contenteditable]")) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const typeHex = (value: string) => {
    setHexText(value);
    const parsed = galleryColorFromInput(value);
    if (parsed !== null) setColor(parsed);
    if (value.trim() === "") setColor(null);
  };
  const pickColor = (value: string) => {
    setColor(value);
    setHexText(value);
  };
  const resetColor = () => {
    setColor(null);
    setHexText("");
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    searchRef.current?.focus();
  };

  return (
    <section
      className="pixl-gallery"
      aria-labelledby="gallery-title"
      // The grid's ground flips when the chosen color would vanish on it.
      data-ground={color === null ? undefined : groundFor(color)}
    >
      <h2 id="gallery-title" className="sr-only">
        Icons
      </h2>

      <div className="gal-bar">
        <div className="gal-bar-row">
          <label className="gal-search">
            <span className="sr-only">Search icons</span>
            {SEARCH && <IconPreview cells={SEARCH} size={16} />}
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${icons.length} icons`}
              autoComplete="off"
              spellCheck={false}
            />
            <kbd aria-hidden="true">/</kbd>
            {query !== "" && (
              <button
                type="button"
                className="gal-reset gal-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                {CLOSE && <IconPreview cells={CLOSE} size={12} />}
              </button>
            )}
          </label>

          <fieldset
            className="gal-seg"
            style={{ "--i": SHAPES.findIndex((s) => s.id === shape) } as React.CSSProperties}
          >
            <legend className="sr-only">Cell shape</legend>
            {SHAPES.map((option) => (
              <label key={option.id}>
                <input
                  type="radio"
                  name="shape"
                  className="sr-only"
                  checked={shape === option.id}
                  onChange={() => setShape(option.id)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <label
            className="gal-size"
            style={
              {
                "--fill": `${((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100}%`,
              } as React.CSSProperties
            }
          >
            <span className="sr-only">Icon size</span>
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step={SIZE_STOPS[1] - SIZE_STOPS[0]}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              aria-valuetext={
                size > renderedIconSize(size)
                  ? `${size} pixels, export only; the grid shows ${renderedIconSize(size)}`
                  : `${size} pixels`
              }
            />
            <output>{size}px</output>
          </label>

          <div className="gal-color">
            <label
              className="gal-swatch"
              style={{ background: color ?? "var(--color-text)" }}
            >
              <span className="sr-only">Pick icon color</span>
              <input
                type="color"
                value={color ?? themeInk}
                onChange={(event) => pickColor(event.target.value)}
              />
            </label>
            <input
              className="gal-hex"
              aria-label="Icon color, hex"
              value={hexText}
              placeholder={themeInk}
              onChange={(event) => typeHex(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              maxLength={7}
            />
            {color !== null && (
              <button
                type="button"
                className="gal-reset"
                aria-label="Reset color"
                onClick={resetColor}
              >
                {CLOSE && <IconPreview cells={CLOSE} size={12} />}
              </button>
            )}
          </div>
        </div>

        <fieldset className="gal-chips">
          <legend className="sr-only">Category</legend>
          {FILTERS.map((filter) => (
            <label
              key={filter.id}
              className="gal-chip"
              style={
                {
                  "--cat": `var(--cat-${filter.id})`,
                  "--cat-ink": `var(--cat-${filter.id}-ink)`,
                } as React.CSSProperties
              }
            >
              <input
                type="radio"
                name="category"
                className="sr-only"
                checked={category === filter.id}
                onChange={() => setCategory(filter.id)}
              />
              {filter.label}
            </label>
          ))}
        </fieldset>
      </div>

      {shown.length > 0 ? (
        <ul id={ICON_PANEL_ID} tabIndex={-1} className="gal-grid" aria-label="Icons">
          {shown.map((icon) => (
            <li key={icon.id}>
              <button
                type="button"
                className="gal-tile"
                aria-pressed={selected?.id === icon.id}
                data-local={localIds.has(icon.id) || undefined}
                title={localIds.has(icon.id) ? "Saved in this browser only" : undefined}
                onClick={() => select(icon)}
              >
                <span className="gal-tile-art">
                  <IconPreview
                    cells={drawn.get(icon.id)!}
                    size={renderedIconSize(size)}
                    cellStyle={shape}
                  />
                </span>
                <span className="gal-tile-name">{icon.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div id={ICON_PANEL_ID} tabIndex={-1} className="gal-empty">
          <p>
            No icons match {query.trim() !== "" ? <q>{query.trim()}</q> : "this filter"}
            {category !== "all" && ` in ${category}`}.
          </p>
          <button type="button" className="gal-btn" onClick={clearFilters}>
            Show all icons
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {shown.length === 1 ? "1 icon" : `${shown.length} icons`}
      </p>

      {selected !== null && (
        <IconDetail
          icon={selected}
          cells={recolorCells(selected.cells, color ?? themeInk)}
          shape={shape}
          size={size}
          closing={shelf.closing}
          onClose={shelf.requestClose}
        />
      )}
    </section>
  );
}
