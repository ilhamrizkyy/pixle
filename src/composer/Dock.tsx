"use client";

import { useRef, useState } from "react";
import { cellsToSvg, svgToCells } from "@/engine/svg";
import { CATEGORIES, type Category, type IconDef } from "@/engine/types";
import { downloadSvg } from "@/lib/download";
import { icons as registryIcons } from "@/registry";
import { useComposer, useComposerStore } from "./ComposerProvider";
import { HexField } from "./HexField";
import { clearDraft, isIdTaken, listSavedIcons, parseTags, saveIcon, toIconId } from "./storage";
import { toIconDraft } from "./store";

/**
 * The composer's bottom dock (DESIGN.md §6, INTERACTION.md §5).
 *
 * Import lives HERE and not in the global nav (BACKLOG.md §B) — it is a
 * creation action, and the nav is public. There is no filled-cell counter
 * (§A5).
 */

const FIELD =
  "w-full rounded-sm border border-border bg-surface px-2 py-1.5 text-caption text-text focus:border-accent focus:outline-none";
const LABEL = "sr-only";
/* Hairline between the dock's three groups: what the icon IS (name, category,
   tags), what it is drawn IN (colour), and what you DO with it. Decorative, so
   it is hidden from assistive tech — the grouping is visual shorthand, not
   information a screen reader is missing. */
function Divider() {
  return <span aria-hidden="true" className="h-7 w-px shrink-0 bg-border" />;
}

const ACTION =
  "shrink-0 whitespace-nowrap rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text transition-colors hover:border-text-faint";

export function Dock({ onNotify }: { onNotify: (message: string) => void }) {
  const store = useComposerStore();
  const name = useComposer((s) => s.name);
  const category = useComposer((s) => s.category);
  const tags = useComposer((s) => s.tags);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const annotations = useComposer((s) => s.annotations);
  const [tagText, setTagText] = useState(tags.join(", "));
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    setError("");
    try {
      // svgToCells throws on anything that is not a Pixle export. Catching it
      // here is what keeps a stray file from taking the whole route down.
      store.getState().loadCells(svgToCells(await file.text()));
      onNotify(`Imported ${file.name}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read that SVG");
    }
  };

  const handleSave = async () => {
    // Two clicks would both read the taken-id list BEFORE either wrote, so both
    // would find the name free and the second would overwrite the first. The
    // guard is the fix; disabling the button is only the visible half of it.
    if (saving) return;
    setSaving(true);
    setError("");
    const draft = toIconDraft(store.getState());

    const fail = (message: string) => {
      setError(message);
      setSaving(false);
    };

    if (draft.name.trim() === "") {
      fail("Give the icon a name before saving.");
      return;
    }
    if (draft.cells.every((cell) => cell === null)) {
      fail("Draw something before saving.");
      return;
    }

    // An id is immutable once published and must never be recycled, so it is
    // checked against BOTH the published registry and what is already saved
    // locally (BACKLOG.md §D).
    const taken = [
      ...registryIcons.map((icon) => icon.id),
      ...(await listSavedIcons()).map((icon) => icon.id),
    ];
    const id = toIconId(draft.name);
    if (id === "") {
      fail("That name has no letters or digits to build an id from.");
      return;
    }
    if (isIdTaken(id, taken)) {
      fail(`"${id}" already exists. Names must be unique — pick another.`);
      return;
    }

    const icon: IconDef = {
      ...draft,
      id,
      name: id,
      author: "ilham",
      status: "published",
      createdAt: new Date().toISOString(),
    };

    if (!(await saveIcon(icon))) {
      fail("This browser would not store the icon. Export the SVG instead.");
      return;
    }
    await clearDraft();
    setSaving(false);
    onNotify(`Saved ${id}`);
  };

  // A floating toolbar, Figma-style: out of flow, pinned to the bottom of the
  // viewport and centred, so the toy owns the whole height above it.
  //
  // BACKLOG.md §A3 — ONE row, sized to its own content. It is a form about
  // the drawing, not a caption for it, so it does not match the toy's width.
  // Labels are visually hidden and carried by placeholders; screen readers
  // still get a real <label> for every control.
  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex w-auto max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-col gap-1.5 rounded-lg border border-border bg-bg px-3 py-2 shadow-[var(--shadow-overlay)]">
      {/* ONE row from `sm` up, as asked. Below that the same row is ~800px of
          controls in a ~350px window, which pushes Save off-screen behind a
          horizontal scroll nobody would think to try — so on a phone it wraps
          instead. */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:overflow-x-auto">
        <div className="w-36 shrink-0">
          <label htmlFor="pixl-name" className={LABEL}>
            Name
          </label>
          <input
            id="pixl-name"
            value={name}
            placeholder="Name"
            onChange={(event) => store.getState().setName(event.target.value)}
            className={`${FIELD} font-data`}
          />
        </div>
        <div className="w-28 shrink-0">
          <label htmlFor="pixl-category" className={LABEL}>
            Category
          </label>
          <select
            id="pixl-category"
            value={category}
            onChange={(event) =>
              store.getState().setCategory(event.target.value as Category)
            }
            className={FIELD}
          >
            {CATEGORIES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40 shrink-0">
          <label htmlFor="pixl-tags" className={LABEL}>
            Tags
          </label>
          <input
            id="pixl-tags"
            value={tagText}
            placeholder="Tags"
            onChange={(event) => {
              setTagText(event.target.value);
              // Stored kebab-cased, shown as typed: forcing the field itself
              // would fight anyone typing a multi-word tag.
              store.getState().setTags(parseTags(event.target.value));
            }}
            className={`${FIELD} font-data`}
          />
        </div>
        <Divider />

        <HexField />

        <Divider />
        <input
          ref={fileRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImport(file);
            // Reset, or picking the same file twice fires no change event.
            event.target.value = "";
          }}
        />
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

        <button type="button" className={ACTION} onClick={() => fileRef.current?.click()}>
          Import SVG
        </button>
        <button
          type="button"
          className={ACTION}
          onClick={() => {
            const draft = toIconDraft(store.getState());
            const file = `${draft.name.trim() === "" ? "untitled" : draft.name}.svg`;
            downloadSvg(file, cellsToSvg(draft.cells, { title: draft.name || undefined }));
            onNotify(`Exported ${file}`);
          }}
        >
          Export SVG
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="shrink-0 whitespace-nowrap rounded-sm bg-accent px-4 py-1.5 text-caption text-bg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save icon"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
