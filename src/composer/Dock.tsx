"use client";

import { useRef, useState } from "react";
import type { ToastTone } from "@/components/Toast";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useComposer, useComposerStore } from "./ComposerProvider";
import { CategoryField, NameField, TagsField } from "./DockFields";
import { DockSheet } from "./DockSheet";
import { ColorSwatch, HexField } from "./HexField";
import { useDock, type Dock as DockApi } from "./useDock";

/**
 * The composer's bottom dock (DESIGN.md §6, INTERACTION.md §5).
 *
 * Import lives HERE and not in the global nav (BACKLOG.md §B) — it is a
 * creation action, and the nav is public. There is no filled-cell counter
 * (§A5).
 *
 * TWO SHAPES, ONE AT A TIME.
 *
 * The wide row needs about 950px. Below that it used to wrap, and wrapping is
 * what broke it: on a phone the dock became a 188x288 slab parked over the
 * middle of the toy, covering the tool strip, the saturation slider and the
 * bottom of the frame. A floating toolbar that hides the thing it floats over
 * has stopped being a toolbar.
 *
 * So below `lg` it becomes a phone bar — the paint colour, the name, a door,
 * and Save — with everything else in a sheet. `lg` is not a guess: it is the
 * width at which the full row stops fitting, and it is the same breakpoint the
 * gallery already moves its controls into a sheet at (DESIGN.md §6).
 *
 * Rendered, not merely hidden, because two Save buttons in one accessibility
 * tree is worse than a layout shift on resize.
 */
export function Dock({
  onNotify,
}: {
  onNotify: (message: string, tone?: ToastTone) => void;
}) {
  const dock = useDock(onNotify);
  const [sheetOpen, setSheetOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Reading the ref inside a handler, which is the one place a ref may be read.
  const pickFile = () => fileRef.current?.click();
  // Server snapshot is false, so the phone bar is what renders before
  // hydration: it is the layout that fits every viewport, and the wide row is
  // the one that would overflow if the guess went the other way.
  const wide = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {/* The file input sits OUTSIDE both layouts and outside the sheet. It is
          what the OS picker is anchored to, so unmounting it — which closing
          the sheet would do — cancels the pick. */}
      <input
        ref={fileRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void dock.importFile(file);
            // Only once a file is really chosen. Closing on the tap instead
            // would dismiss the sheet for anyone who cancelled the picker.
            setSheetOpen(false);
          }
          // Reset, or picking the same file twice fires no change event.
          event.target.value = "";
        }}
      />

      {wide ? (
        <WideDock dock={dock} onPickFile={pickFile} />
      ) : (
        <CompactDock dock={dock} sheetOpen={sheetOpen} onOpenSheet={() => setSheetOpen(true)} />
      )}

      {!wide && sheetOpen && (
        <DockSheet dock={dock} onPickFile={pickFile} onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}

/**
 * A floating toolbar, Figma-style: out of flow, pinned to the bottom of the
 * viewport and centred, so the toy owns the whole height above it.
 *
 * BACKLOG.md §A3 — ONE row, sized to its own content. It is a form about the
 * drawing, not a caption for it, so it does not match the toy's width.
 */
function WideDock({ dock, onPickFile }: { dock: DockApi; onPickFile: () => void }) {
  const store = useComposerStore();
  const annotations = useComposer((s) => s.annotations);

  return (
    <Bar className="w-auto max-w-[calc(100vw-1.5rem)] px-3 py-2">
      <div className="flex items-center gap-2">
        <NameField className="w-36 shrink-0" />
        <CategoryField className="w-28 shrink-0" />
        <TagsField className="w-40 shrink-0" text={dock.tagText} onText={dock.setTagText} />
        <Divider />
        <HexField />
        <Divider />
        {/* Lives in the dock, not on the toy: the toy has eight buttons and a
            ninth would break the four-a-side symmetry that tells you the two
            columns are two halves of one set. */}
        <button
          type="button"
          onClick={() => store.getState().toggleAnnotations()}
          aria-pressed={annotations}
          aria-label="Show control names on the toy"
          title="Show control names on the toy"
          className={`${ACTION} w-8 px-0 text-center aria-pressed:border-accent aria-pressed:bg-accent-subtle aria-pressed:text-accent`}
        >
          ?
        </button>
        <button type="button" className={ACTION} onClick={onPickFile}>
          Import SVG
        </button>
        <button type="button" className={ACTION} onClick={dock.exportSvg}>
          Export SVG
        </button>
        {/* The publish step. Save keeps the icon in this browser; this is how
            it reaches the set everyone else sees. */}
        <button
          type="button"
          className={ACTION}
          title="Copy the registry entry to paste into src/registry/icons.ts"
          onClick={() => void dock.copyRegistryEntry()}
        >
          Copy entry
        </button>
        <SaveButton dock={dock} label="Save icon" className="px-4 py-1.5" />
      </div>
    </Bar>
  );
}

/**
 * The phone bar: what you touch WHILE drawing, and nothing else.
 *
 * The swatch is here because the paint colour is the one piece of dock state
 * that changes constantly — the knobs above set it, and this is where you read
 * back what they landed on. Name is here because it is what Save refuses
 * without, so the field and the error that names it stay on the same surface.
 * Category, tags, the exact hex, and the file actions are set once and are
 * behind the chevron.
 */
function CompactDock({
  dock,
  sheetOpen,
  onOpenSheet,
}: {
  dock: DockApi;
  sheetOpen: boolean;
  onOpenSheet: () => void;
}) {
  const currentColor = useComposer((s) => s.currentColor);

  return (
    <Bar className="w-[calc(100vw-1.5rem)] max-w-sm p-1.5">
      <div className="flex items-center gap-1.5">
        <ColorSwatch color={currentColor} className="size-11" />
        <NameField tall className="min-w-0 flex-1" />
        <button
          type="button"
          onClick={onOpenSheet}
          aria-label="Icon details"
          aria-expanded={sheetOpen}
          aria-controls="pixl-dock-sheet"
          title="Category, tags, colour, import and export"
          className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-text-muted transition-colors hover:text-text"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 10l5-5 5 5" />
          </svg>
        </button>
        <SaveButton dock={dock} label="Save" className="h-11 px-3" />
      </div>
    </Bar>
  );
}

/**
 * The floating card both layouts sit in. It carries position and skin only —
 * WIDTH AND PADDING BELONG TO THE CALLER, because two utilities for the same
 * property do not resolve by their order in a className string, they resolve by
 * their order in the generated stylesheet. A `w-auto` here quietly outranked
 * the phone bar's `w-[calc(...)]`, leaving it shrink-to-fit at 203px, and the
 * only symptom was a bar that looked a bit narrow. Max-width left with it, or
 * the phone bar's `max-w-sm` and a viewport clamp would fight the same way.
 */
function Bar({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div
      className={`fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-col gap-1.5 rounded-lg border border-border bg-bg shadow-[var(--shadow-overlay)] ${className}`}
    >
      {children}
    </div>
  );
}

function SaveButton({
  dock,
  label,
  className,
}: {
  dock: DockApi;
  label: string;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={() => void dock.save()}
      disabled={dock.saving}
      className={`shrink-0 rounded-sm bg-accent text-caption whitespace-nowrap text-bg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {dock.saving ? "Saving…" : label}
    </button>
  );
}

/* Hairline between the dock's three groups: what the icon IS (name, category,
   tags), what it is drawn IN (colour), and what you DO with it. Decorative, so
   it is hidden from assistive tech — the grouping is visual shorthand, not
   information a screen reader is missing. */
function Divider() {
  return <span aria-hidden="true" className="h-7 w-px shrink-0 bg-border" />;
}

const ACTION =
  "shrink-0 whitespace-nowrap rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text transition-colors hover:border-text-faint";
