"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Shared behavior for modal surfaces (the icon detail dialog, the filter
 * sheet): focus the panel on open, trap Tab inside it, close on Escape, lock
 * background scroll, and return focus to whatever opened it.
 *
 * Extracted rather than duplicated — a focus trap that exists in two copies is
 * a focus trap that will be fixed in one of them.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea",
  'input:not([type="hidden"])',
  "select",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();

    // Stop the page behind from scrolling while the surface is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      // Keyboard users land back where they came from, not at the page top.
      opener?.focus?.();
    };
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || ref.current === null) return;

      const focusable = [
        ...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE),
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

  return { ref, onKeyDown };
}
