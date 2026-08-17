"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconPreview } from "@/components/IconPreview";
import { cellsToSvg, svgFileName } from "@/engine/svg";
import type { Cells, IconDef } from "@/engine/types";
import {
  cellsToPngBlob,
  copyText,
  downloadBlob,
  downloadSvg,
} from "@/lib/download";

/**
 * Icon detail (DESIGN.md §6): a small centered panel with a large preview,
 * name, category, tags, and the four actions.
 *
 * WHAT YOU SEE IS WHAT YOU COPY. Every export is built from `displayCells` —
 * the gallery's color, flip, rotation, and padding already applied — so the
 * clipboard matches the preview. There is no color control here because the
 * gallery already owns it.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

type IconModalProps = {
  icon: IconDef;
  /** Cells with the gallery's display settings already applied. */
  displayCells: Cells;
  /** Padding in cells, applied to the preview and to exports. */
  padding: number;
  onClose: () => void;
  onNotify: (message: string) => void;
};

export function IconModal({
  icon,
  displayCells,
  padding,
  onClose,
  onNotify,
}: IconModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [copyLabel, setCopyLabel] = useState("Copy SVG");
  const svg = cellsToSvg(displayCells, { title: icon.name, padding });

  // Restore focus to whatever opened the dialog when it closes, so keyboard
  // users land back on the card they came from rather than at the page top.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  // Escape closes (INTERACTION.md §6), and Tab stays inside the dialog.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || dialogRef.current === null) return;

      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const handleCopySvg = async () => {
    if (await copyText(svg)) {
      setCopyLabel("Copied");
      onNotify("SVG copied");
    } else {
      // Clipboard refused — the code field below is the recoverable path.
      setCopyLabel("Select the code below");
    }
    setTimeout(() => setCopyLabel("Copy SVG"), 1600);
  };

  const handleDownloadSvg = () => {
    downloadSvg(svgFileName(icon), svg);
    onNotify(`Downloaded ${svgFileName(icon)}`);
  };

  const handleDownloadPng = async () => {
    const blob = await cellsToPngBlob(displayCells, { padding });
    if (blob === null) {
      onNotify("Could not render a PNG in this browser");
      return;
    }
    downloadBlob(`${icon.id}.png`, blob);
    onNotify(`Downloaded ${icon.id}.png`);
  };

  const handleCopyName = async () => {
    onNotify((await copyText(icon.name)) ? "Name copied" : "Could not copy");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/45 p-5"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
        className="w-full max-w-100 rounded-lg border border-border bg-bg p-6 shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="icon-modal-title" className="text-h3">
              {icon.name}
            </h2>
            <p className="mt-1 text-caption text-accent">{icon.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm px-2 text-body text-text-muted hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="my-4 flex items-center justify-center rounded-md bg-surface p-7">
          <IconPreview
            cells={displayCells}
            size={104}
            title={icon.name}
            padding={padding}
          />
        </div>

        {icon.tags.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-1.5 p-0 list-none">
            {icon.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-caption text-text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopySvg}
            className="rounded-sm border border-accent bg-accent px-3 py-2.5 text-caption text-bg hover:bg-accent-hover"
          >
            {copyLabel}
          </button>
          <button type="button" onClick={handleDownloadSvg} className={ACTION}>
            Download SVG
          </button>
          <button type="button" onClick={handleDownloadPng} className={ACTION}>
            Download PNG
          </button>
          <button type="button" onClick={handleCopyName} className={ACTION}>
            Copy name
          </button>
        </div>

        <textarea
          readOnly
          value={svg}
          aria-label={`SVG markup for ${icon.name}`}
          onFocus={(event) => event.currentTarget.select()}
          className="mt-3.5 h-15 w-full resize-none rounded-sm border border-border bg-surface-2 p-2 font-data text-caption text-text-muted"
        />
        <p className="mt-1.5 text-caption text-text-faint">
          Colors are baked in — this SVG matches the preview exactly.
        </p>
      </div>
    </div>
  );
}

const ACTION =
  "rounded-sm border border-border bg-surface px-3 py-2.5 text-caption text-text hover:border-text-faint";
