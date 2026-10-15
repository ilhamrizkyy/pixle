import { CONTRIBUTING_URL, LICENSE_URL, REPO_URL } from "@/lib/site";

/**
 * Every page's foot: who made the set, under what license, and where the
 * source lives. A server component; it reads no state.
 */

const LINKS = [
  { href: REPO_URL, label: "GitHub" },
  { href: CONTRIBUTING_URL, label: "Contribute" },
  { href: LICENSE_URL, label: "License" },
] as const;

export function SiteFooter() {
  return (
    <footer className="pixl-footer">
      <div className="pixl-footer-body">
        <div className="pixl-footer-say">
          <p className="pixl-footer-mark">Pixle</p>
          <p className="pixl-footer-line">
            A pixel icon set drawn by <b>lovvfat</b>, cell by cell on an 11 by
            11 grid.
          </p>
          <p className="pixl-footer-line">
            Free and open source under the <b>MIT license</b>. Use it in
            anything, commercial work included, with no attribution required.
          </p>
        </div>

        <nav aria-label="Site" className="pixl-footer-nav">
          <ul className="pixl-footer-links">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <p className="pixl-footer-note">Made with square pixels.</p>
        </nav>
      </div>
    </footer>
  );
}
