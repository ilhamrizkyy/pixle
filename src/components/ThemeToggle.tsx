"use client";

import { useSyncExternalStore } from "react";

/**
 * Theme control: two buttons, Light and Dark.
 *
 * There is no "System" button, but system IS the default. Until you pick, no
 * data-theme attribute is set and the CSS media query decides — so a first
 * visit already matches the OS, and the app keeps following it as it changes.
 * Picking a side writes an explicit preference that then wins.
 *
 * The buttons highlight the RESOLVED theme, so on a first visit with a dark OS
 * the Dark button reads as active even though nothing is stored yet.
 *
 * The preference is external state, so it is read through useSyncExternalStore
 * rather than an effect.
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "pixle-theme";

/** Fired on same-tab changes; the storage event only covers other tabs. */
const THEME_EVENT = "pixle-theme-change";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs before first paint to stop a flash of the wrong theme. Inlined into
 * <head>, so it must stay dependency-free and defensive: a browser with
 * storage blocked should fall back to the media query, not throw.
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
];

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    media.removeEventListener("change", onChange);
  };
}

/** The resolved theme: an explicit choice if there is one, else the OS. */
function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage unavailable — fall through to the media query.
  }
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** The server cannot know the OS preference; light is the safe assumption. */
function getServerSnapshot(): Theme {
  return "light";
}

function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
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
