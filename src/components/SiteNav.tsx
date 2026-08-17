"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Top nav (DESIGN.md §6): logo left, then Icons / Guide / Resources /
 * Contribute.
 *
 * NOTE ON WHAT IS ABSENT. There is no "+ Create" entry and no Import control
 * here, and that is deliberate:
 *
 *   - Create is owner-only. The button arrives with the server-side auth gate
 *     in Phase 3, not before. Shipping a visible entry to a route that is not
 *     yet gated is exactly the failure CLAUDE.md rule 1 forbids.
 *   - Import is a composer action and belongs in the composer dock
 *     (BACKLOG.md B), not in the global nav where the prototype had it.
 */

const LINKS = [
  { href: "/", label: "Icons" },
  { href: "/guide", label: "Guide" },
  { href: "/resources", label: "Resources" },
  { href: "/contribute", label: "Contribute" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-7 py-5">
      <Link
        href="/"
        className="font-pixel text-body tracking-wider text-text no-underline"
      >
        Pix<span className="text-accent">le</span>
      </Link>

      <ul className="flex flex-wrap items-center gap-5 p-0 list-none">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-ui no-underline transition-colors hover:text-accent ${
                  active ? "font-bold text-accent" : "text-text"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
