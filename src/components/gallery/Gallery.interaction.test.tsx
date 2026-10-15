// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { icons } from "@/registry";
import { clearViewport, setViewportWidth } from "@/test/viewport";
import { Gallery } from "./Gallery";

beforeEach(() => setViewportWidth(1280));
afterEach(clearViewport);
afterEach(cleanup);

const grid = () => screen.getByRole("list", { name: "Icons" });
const tiles = () => within(grid()).getAllByRole("button");
const tile = (name: string) => within(grid()).getByRole("button", { name });

describe("the gallery", () => {
  it("shows every icon, then narrows by name or tag", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    expect(tiles()).toHaveLength(icons.length);

    await user.type(screen.getByRole("searchbox"), "arrow-right");
    expect(tiles().map((t) => t.textContent)).toContain("arrow-right");
    expect(tiles().length).toBeLessThan(icons.length);
  });

  it("says when nothing matches, and gets you back", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    await user.type(screen.getByRole("searchbox"), "zzzz");

    expect(screen.queryByRole("list", { name: "Icons" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Show all icons" }));
    expect(tiles()).toHaveLength(icons.length);
    expect(screen.getByRole("searchbox")).toHaveProperty("value", "");
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    await user.click(screen.getByRole("radio", { name: "Arcade" }));

    const arcade = icons.filter((i) => i.category === "arcade");
    expect(tiles()).toHaveLength(arcade.length);
  });

  it("copies what you see: the chosen color, as SVG", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    await user.type(screen.getByRole("textbox", { name: "Icon color, hex" }), "#ff0000");
    await user.click(tile("heart"));

    const details = screen.getByRole("complementary", { name: "heart details" });
    await user.click(within(details).getByRole("button", { name: "Copy SVG" }));

    const copied = await navigator.clipboard.readText();
    expect(copied).toMatch(/^<svg /);
    expect(copied).toContain('fill="#ff0000"');
    expect(within(details).getByRole("status").textContent).toBe("SVG copied");
  });

  it("closes the details on Escape and on a second click", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);

    await user.click(tile("heart"));
    expect(tile("heart").getAttribute("aria-pressed")).toBe("true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("complementary")).toBeNull());

    await user.click(tile("heart"));
    await user.click(tile("heart"));
    await waitFor(() => expect(screen.queryByRole("complementary")).toBeNull());
  });

  it("flips the grid's ground when the color would vanish on it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Gallery icons={icons} />);
    const section = container.querySelector(".pixl-gallery")!;
    expect(section.getAttribute("data-ground")).toBeNull();

    await user.type(screen.getByRole("textbox", { name: "Icon color, hex" }), "#ffffff");
    expect(section.getAttribute("data-ground")).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Reset color" }));
    expect(section.getAttribute("data-ground")).toBeNull();
  });

  it("focuses search on /", async () => {
    const user = userEvent.setup();
    render(<Gallery icons={icons} />);
    await user.keyboard("/");
    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
    expect(screen.getByRole("searchbox")).toHaveProperty("value", "");
  });
});
