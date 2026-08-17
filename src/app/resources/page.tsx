import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resources — Pixle",
  description: "Ways to get the whole Pixle set and work with it.",
};

/**
 * Resources shell. Contents are still an open decision (BACKLOG.md D), so this
 * lists the candidates and marks what is not built rather than implying links
 * that go nowhere.
 */

const RESOURCES = [
  { label: "Full set download — SVG & PNG", status: "later" },
  { label: "Figma library", status: "later" },
  { label: "Changelog", status: "later" },
  { label: "npm package", status: "later" },
] as const;

export default function ResourcesPage() {
  return (
    <div className="max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-h2">Resources</h1>
      <p className="prose-body mb-6 text-text-muted">
        Ways to get the whole set and work with it. Still being defined — for
        now, every icon is downloadable individually from the{" "}
        <Link href="/" className="text-accent">
          gallery
        </Link>
        .
      </p>

      <ul className="list-none p-0">
        <li className="flex items-center justify-between border-b border-border py-3.5 text-ui">
          <span>License — MIT</span>
          <a
            href="https://github.com/ilhamrizkyakbar/pixle/blob/main/LICENSE"
            className="text-caption text-accent"
          >
            Read
          </a>
        </li>
        {RESOURCES.map((resource) => (
          <li
            key={resource.label}
            className="flex items-center justify-between border-b border-border py-3.5 text-ui text-text-muted"
          >
            <span>{resource.label}</span>
            <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-caption text-accent">
              {resource.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
