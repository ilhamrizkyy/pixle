// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gallery } from "@/components/gallery/Gallery";
import { icons } from "@/registry";
import { CELL_UNITS, GRID_SIZE, VIEW_BOX } from "@/engine/constants";

beforeAll(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((q: string) => ({
      matches: false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});
afterEach(cleanup);

const openFirstIcon = async (user: ReturnType<typeof userEvent.setup>) => {
  const grid = screen.getByRole("list", { name: "Icons" });
  await user.click(within(grid).getAllByRole("button")[0]);
  return screen.getByRole("dialog");
};

describe("icon detail panel", () => {
  it("shows the icon, its tags, and every action", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    const panel = await openFirstIcon(user);

    expect(within(panel).getByRole("heading", { level: 2 }).textContent).toBe(
      icons[0].name,
    );
    for (const name of [
      "Copy SVG",
      "Download SVG",
      "Download PNG",
      "Copy name",
      "Close",
    ]) {
      expect(within(panel).getByRole("button", { name })).toBeTruthy();
    }
    expect(within(panel).getByText(icons[0].tags.join(" · "))).toBeTruthy();
  });

  it("is NON-modal: no backdrop, and the grid stays reachable", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    const panel = await openFirstIcon(user);

    // A modal would claim the whole surface and lock the page behind it.
    expect(panel.getAttribute("aria-modal")).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");

    // The grid is still there, and picking another icon swaps the panel
    // rather than closing it.
    const grid = screen.getByRole("list", { name: "Icons" });
    await user.click(within(grid).getAllByRole("button")[1]);
    expect(
      within(screen.getByRole("dialog")).getByRole("heading", { level: 2 })
        .textContent,
    ).toBe(icons[1].name);
  });

  it("docks to the bottom edge rather than centring", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    const panel = await openFirstIcon(user);
    expect(panel.className).toContain("bottom-0");
    expect(panel.className).toContain("inset-x-0");
    // Clears the sidebar on desktop instead of covering it.
    expect(panel.className).toContain("lg:left-[var(--sidebar-width)]");
  });

  it("draws the art ON the lattice — one SVG, so cells land in grid boxes", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    const panel = await openFirstIcon(user);

    const svg = panel.querySelector("svg");
    expect(svg).toBeTruthy();
    // Same element carries both. Two SVGs is exactly how they drifted apart.
    expect(svg!.getAttribute("viewBox")).toBe(VIEW_BOX);
    const lattice = svg!.querySelector("path");
    const rects = [...svg!.querySelectorAll("rect")];
    expect(lattice).toBeTruthy();
    expect(rects.length).toBeGreaterThan(0);

    // One line per cell boundary, both axes, spanning the whole canvas.
    const d = lattice!.getAttribute("d") ?? "";
    expect(d.match(/M/g)!.length).toBe((GRID_SIZE + 1) * 2);

    // Every filled cell sits on a boundary and is exactly one box wide.
    for (const rect of rects) {
      expect(Number(rect.getAttribute("x")) % CELL_UNITS).toBe(0);
      expect(Number(rect.getAttribute("y")) % CELL_UNITS).toBe(0);
      expect(rect.getAttribute("width")).toBe(String(CELL_UNITS));
      expect(rect.getAttribute("height")).toBe(String(CELL_UNITS));
    }
  });

  it("closes on Escape and on the close button", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);

    await openFirstIcon(user);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    const panel = await openFirstIcon(user);
    await user.click(within(panel).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
