"use client";

import { useState } from "react";
import { normalizeHex } from "@/engine/grid";
import { useComposer, useComposerStore } from "./ComposerProvider";

/**
 * The paint colour: a live swatch and the exact hex behind it.
 *
 * Lives in the dock rather than on the toy. It is the one colour control that
 * is a VALUE rather than a gesture — the knobs and the saturation slider are
 * the toy's, this is the readout you copy and paste — and moving it off the
 * frame gives the board the height back.
 */
export function HexField() {
  const store = useComposerStore();
  const currentColor = useComposer((s) => s.currentColor);

  // The field is a DRAFT while it is being typed. Committing every keystroke
  // would reject "#ff" on the way to "#ff0000" and fight the typist; the colour
  // only moves when what is typed actually parses.
  const [text, setText] = useState(currentColor);
  const [syncedFrom, setSyncedFrom] = useState(currentColor);
  if (currentColor !== syncedFrom) {
    setSyncedFrom(currentColor);
    // Only when the change came from SOMEWHERE ELSE — a knob, the eyedropper.
    // If the field's own text already resolves to the new colour, overwriting
    // would expand "#00f" to "#0000ff" under the cursor and the rest of what is
    // being typed would land on the end of that.
    if (normalizeHex(text) !== currentColor) setText(currentColor);
  }

  const invalid = normalizeHex(text) === null;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        aria-hidden="true"
        className="size-7 shrink-0 rounded-sm border border-border"
        style={{ background: currentColor }}
      />
      <label htmlFor="pixl-hex" className="sr-only">
        Paint colour, hex
      </label>
      <input
        id="pixl-hex"
        value={text}
        spellCheck={false}
        onChange={(event) => {
          setText(event.target.value);
          store.getState().setColor(event.target.value);
        }}
        className={`w-24 rounded-sm border bg-surface px-2 py-1.5 font-data text-caption text-text focus:outline-none ${
          invalid ? "border-danger" : "border-border focus:border-accent"
        }`}
      />
    </div>
  );
}
