"use client";

import { useSyncExternalStore } from "react";

/**
 * Whole-app theme control: Light / Dark / System.
 *
 * "System" is a real third state, not a synonym for light. It removes
 * data-theme entirely so the CSS media query takes over, which means the app
 * keeps following the OS as it changes rather than freezing at whatever it was
 * on first load.
 *
 * The stored preference is an external store, so it is read through
 * useSyncExternalStore rather than an effect. That keeps server and client
 * renders consistent and avoids a setState-in-effect cascade.
 */

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "pixle-theme";

/** Fired on same-tab changes; the storage event only covers other tabs. */
const THEME_EVENT = "pixle-theme-change";

/**
 * Runs before first paint to stop a flash of the wrong theme. Inlined into
 * <head>, so it must stay dependency-free and defensive: a browser with
 * storage blocked should render light, not throw.
 */
export const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  if (t === "light" || t === "dark") {
    document.documentElement.setAttribute("data-theme", t);
  }
} catch (e) {}
`;

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀" },
  { value: "dark", label: "Dark", icon: "☾" },
  { value: "system", label: "System", icon: "⌗" },
];

function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage unavailable — fall through to system.
  }
  return "system";
}

/** The server cannot know the preference; system is the honest default. */
function getServerSnapshot(): Theme {
  return "system";
}

function setTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);

  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The preference simply will not persist.
  }

  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-sm border border-border bg-surface p-0.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          aria-label={option.label}
          aria-pressed={theme === option.value}
          title={option.label}
          className={`rounded-sm px-2 py-1 text-caption leading-none transition-colors ${
            theme === option.value
              ? "bg-accent-subtle text-accent"
              : "text-text-muted hover:text-text"
          }`}
        >
          <span aria-hidden="true">{option.icon}</span>
        </button>
      ))}
    </div>
  );
}
