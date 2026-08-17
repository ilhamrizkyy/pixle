"use client";

import { useEffect } from "react";

/**
 * Transient confirmation for copy / download (INTERACTION.md §7).
 *
 * Announced politely rather than assertively: these confirm an action the user
 * just took, so interrupting a screen reader mid-sentence would be rude.
 */

type ToastProps = {
  message: string;
  onDismiss: () => void;
  duration?: number;
};

export function Toast({ message, onDismiss, duration = 2200 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded-md bg-text px-5 py-3 text-ui text-bg shadow-lg"
    >
      {message}
    </div>
  );
}
