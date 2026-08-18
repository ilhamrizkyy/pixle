"use client";

import { useEffect, useState } from "react";
import type { IconDef } from "@/engine/types";
import { listSavedIcons } from "./storage";

/**
 * Icons the owner has saved locally, for the gallery to show alongside the
 * published registry.
 *
 * These are OWNER-LOCAL and BROWSER-ONLY: they live in this browser's
 * IndexedDB, are not published, and do not exist on another device. Phase 3
 * replaces them with Supabase records.
 *
 * Loaded AFTER MOUNT and starting from an empty list, because IndexedDB cannot
 * be read on the server. Rendering the same empty list the server rendered and
 * filling it in afterwards is what keeps hydration honest — a first paint that
 * disagreed with the server would be a real bug, not a warning to silence.
 */
export function useLocalIcons(): readonly IconDef[] {
  const [local, setLocal] = useState<readonly IconDef[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listSavedIcons().then((saved) => {
      if (!cancelled && saved.length > 0) setLocal(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return local;
}

/**
 * Registry first, then local icons that do not collide with it.
 *
 * The published registry WINS a collision: it is the source of truth, and an
 * id is never recycled (BACKLOG.md §D). Filtering rather than concatenating is
 * also what stops a collision from producing two React children with the same
 * key.
 */
export function mergeLocalIcons(
  registry: readonly IconDef[],
  local: readonly IconDef[],
): readonly IconDef[] {
  if (local.length === 0) return registry;
  const published = new Set(registry.map((icon) => icon.id));
  const extra = local.filter((icon) => !published.has(icon.id));
  return extra.length === 0 ? registry : [...registry, ...extra];
}
