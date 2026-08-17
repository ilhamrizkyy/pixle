/**
 * Shown when a search or filter matches nothing (INTERACTION.md §7).
 *
 * Uses the pixel grid motif (DESIGN.md §1) rather than a generic message, so
 * the empty state still looks like this product. The pattern is deterministic,
 * not random, so it does not flicker between renders.
 */

const PATTERN_CELLS = 25;

export function EmptyState({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-text-muted">
      <div
        aria-hidden="true"
        className="grid grid-cols-5 gap-[3px]"
      >
        {Array.from({ length: PATTERN_CELLS }, (_, i) => (
          <div
            key={i}
            className="size-3.5 bg-text-faint"
            style={{ opacity: (i * 7) % 5 === 0 ? 1 : 0.2 }}
          />
        ))}
      </div>
      <p className="text-ui">
        {query ? `No icons match "${query}".` : "No icons match that filter."}
      </p>
    </div>
  );
}
