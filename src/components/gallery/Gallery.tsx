"use client";

import { useMemo, useState } from "react";
import { Toast } from "@/components/Toast";
import { galleryColorFromInput, recolorCells } from "@/engine/color";
import { DEFAULT_ICON_SIZE } from "@/engine/constants";
import {
  IDENTITY_ORIENTATION,
  applyOrientation,
  type Orientation,
} from "@/engine/transform";
import { CATEGORIES } from "@/engine/types";
import type { Category, IconDef } from "@/engine/types";
import { THEME_ICON_COLOR, useResolvedTheme } from "@/lib/theme";
import { EmptyState } from "./EmptyState";
import { GallerySidebar, type CategoryFilter } from "./GallerySidebar";
import { IconCard } from "./IconCard";
import { IconModal } from "./IconModal";

/**
 * The public gallery. Read-only by design — browse, search, filter, copy,
 * download. Nothing here mutates an icon.
 *
 * The registry is a static module, so there is no async load and therefore no
 * loading state: the icons are present in the first paint. An empty state
 * exists because a search can legitimately match nothing.
 */

type GalleryProps = { icons: readonly IconDef[] };

export function Gallery({ icons }: GalleryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  /**
   * The raw field text lives here, not in the sidebar, so Reset can clear it
   * without two pieces of state needing an effect to stay in sync.
   *
   * null means "follow the theme", which is why the theme default is derived
   * on every render rather than seeded into state — seeding it would freeze
   * the color at whatever the theme was on mount.
   */
  const [colorText, setColorText] = useState<string | null>(null);
  const [size, setSize] = useState<number>(DEFAULT_ICON_SIZE);
  const [padding, setPadding] = useState(0);
  const [orientation, setOrientation] =
    useState<Orientation>(IDENTITY_ORIENTATION);
  const [selected, setSelected] = useState<IconDef | null>(null);
  const [toast, setToast] = useState("");

  /**
   * Search matches name + tags (INTERACTION.md §6). Plain substring matching:
   * with a set this size, fuzzy search would surface noise, not help. Fuse.js
   * is queued for when the set actually grows (TECH-STACK.md).
   */
  const searched = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return icons;
    return icons.filter(
      (icon) =>
        icon.name.toLowerCase().includes(query) ||
        icon.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [icons, search]);

  // Counts reflect the search, so they answer "what is left in each category".
  const counts = useMemo(() => {
    const tally = Object.fromEntries(
      CATEGORIES.map((entry) => [entry.id, 0]),
    ) as Record<Category, number>;
    for (const icon of searched) tally[icon.category] += 1;
    return tally;
  }, [searched]);

  const visible = useMemo(
    () =>
      category === "all"
        ? searched
        : searched.filter((icon) => icon.category === category),
    [searched, category],
  );

  /**
   * Display cells, keyed by icon id. The registry records are never modified —
   * this is a parallel map consulted only when drawing. Both transforms return
   * the input array unchanged in their identity cases, so the default path
   * costs nothing.
   */
  const theme = useResolvedTheme();
  const themeColor = THEME_ICON_COLOR[theme];

  /**
   * Icons ALWAYS render in exactly one color. An unparsed or empty field falls
   * back to the theme default rather than to per-icon colors, so there is no
   * state in which the gallery shows multi-color art.
   */
  const activeColor =
    colorText === null
      ? themeColor
      : (galleryColorFromInput(colorText) ?? themeColor);

  const displayCells = useMemo(() => {
    const map = new Map<string, IconDef["cells"]>();
    for (const icon of icons) {
      // Orientation first, then color: both are per-cell-independent, but
      // fixing the order keeps the pipeline easy to reason about.
      const oriented = applyOrientation(icon.cells, orientation);
      map.set(icon.id, recolorCells(oriented, activeColor));
    }
    return map;
  }, [icons, activeColor, orientation]);

  return (
    <div className="flex flex-col items-start lg:flex-row">
      <GallerySidebar
        search={search}
        onSearch={setSearch}
        colorText={colorText}
        onColorText={setColorText}
        color={activeColor}
        size={size}
        onSize={setSize}
        padding={padding}
        onPadding={setPadding}
        orientation={orientation}
        onOrientation={setOrientation}
        category={category}
        onCategory={setCategory}
        counts={counts}
        total={searched.length}
      />

      <main className="w-full min-w-0 flex-1 px-8 pt-6 pb-10">
        <div className="mb-5 flex flex-wrap items-baseline gap-3">
          <h1 className="text-h2">Icons</h1>
          <span className="font-data text-caption text-text-faint">
            {visible.length} icon{visible.length === 1 ? "" : "s"}
          </span>
        </div>

        {visible.length === 0 ? (
          <EmptyState query={search.trim() || undefined} />
        ) : (
          <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-[14px] p-1">
            {/* Each li IS the grid item. `display: contents` would be tidier
                CSS but has a history of dropping list semantics from the
                accessibility tree, so the card stretches to fill instead. */}
            {visible.map((icon) => (
              <li key={icon.id}>
                <IconCard
                  icon={icon}
                  cells={displayCells.get(icon.id) ?? icon.cells}
                  size={size}
                  padding={padding}
                  selected={selected?.id === icon.id}
                  onSelect={setSelected}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {selected && (
        <IconModal
          icon={selected}
          displayCells={displayCells.get(selected.id) ?? selected.cells}
          padding={padding}
          onClose={() => setSelected(null)}
          onNotify={setToast}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}
