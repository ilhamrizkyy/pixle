"use client";

import { useEffect, useRef, useState } from "react";
import { IconPreview, glyph } from "@/components/IconPreview";
import {
  COPY_FORMATS,
  FORMAT_LABELS,
  FORMAT_NOUNS,
  formatIcon,
  type CopyFormat,
} from "@/engine/formats";
import type { CellStyle } from "@/engine/render";
import { cellsToSvg, svgFileName } from "@/engine/svg";
import { CATEGORIES, type Cells, type IconDef } from "@/engine/types";
import { cellsToPngBlob, copyText, downloadBlob, downloadSvg } from "@/lib/download";

const CLOSE = glyph("close");

type Props = {
  icon: IconDef;
  /** Already recolored: what you see here is what you copy. */
  cells: Cells;
  shape: CellStyle;
  size: number;
  closing: boolean;
  onClose: () => void;
};

/**
 * The selected icon: a big preview on its 11 by 11 lattice, its name and tags,
 * and every way to take it. Sticky to the bottom of the gallery, so it stays in
 * view while you scroll and settles under the last row at the end.
 */
export function IconDetail({ icon, cells, shape, size, closing, onClose }: Props) {
  const [format, setFormat] = useState<CopyFormat>("svg");
  const [done, setDone] = useState<{ text: string; ok: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Escape closes, unless it is clearing a text field first.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLInputElement && target.value !== "") return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const svg = cellsToSvg(cells, { title: icon.name, cellStyle: shape, size });
  const source = formatIcon(format, svg, icon.name, size);
  // Feedback belongs to what was copied: switch icon or format and it is gone.
  const result = done?.text === source ? done : null;

  const copy = async () => {
    const ok = await copyText(source);
    setDone({ text: source, ok });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(null), 1600);
  };

  const savePng = async () => {
    const blob = await cellsToPngBlob(cells, { pixels: size });
    if (blob !== null) downloadBlob(`${icon.id}.png`, blob);
  };

  const category = CATEGORIES.find((c) => c.id === icon.category)?.label;

  return (
    <aside
      className="gal-detail"
      aria-label={`${icon.name} details`}
      data-closing={closing || undefined}
    >
      <div className="gal-detail-body">
        <div className="gal-lattice">
          <IconPreview cells={cells} size={132} cellStyle={shape} />
        </div>

        <div className="gal-detail-main">
          <div className="gal-detail-head">
            <div>
              <h3 className="gal-detail-name">{icon.name}</h3>
              <p className="gal-detail-meta">
                {category}
                {icon.tags.length > 0 && <> · {icon.tags.join(", ")}</>}
              </p>
            </div>
            <button
              type="button"
              className="gal-close"
              aria-label="Close details"
              onClick={onClose}
            >
              {CLOSE && <IconPreview cells={CLOSE} size={16} />}
            </button>
          </div>

          <fieldset className="gal-formats">
            <legend className="sr-only">Copy as</legend>
            {COPY_FORMATS.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="format"
                  className="sr-only"
                  checked={format === option}
                  onChange={() => setFormat(option)}
                />
                {FORMAT_LABELS[option]}
              </label>
            ))}
          </fieldset>

          <pre className="gal-code">
            <code>{source}</code>
          </pre>

          <div className="gal-actions">
            <button
              type="button"
              className="gal-btn is-primary gal-swap"
              data-done={result ? (result.ok ? "ok" : "fail") : undefined}
              onClick={copy}
            >
              <span className="gal-swap-idle" aria-hidden={result !== null}>
                Copy {FORMAT_LABELS[format]}
              </span>
              <span className="gal-swap-done" aria-hidden={result === null}>
                {result?.ok === false ? "Copy failed" : "Copied"}
              </span>
            </button>
            <button
              type="button"
              className="gal-btn"
              onClick={() => downloadSvg(svgFileName(icon), svg)}
            >
              Download SVG
            </button>
            <button type="button" className="gal-btn" onClick={savePng}>
              Download PNG
            </button>
          </div>

          <p className="sr-only" role="status">
            {result === null
              ? ""
              : result.ok
                ? `${FORMAT_NOUNS[format]} copied`
                : "Could not copy. Use Download SVG instead."}
          </p>
        </div>
      </div>
    </aside>
  );
}
