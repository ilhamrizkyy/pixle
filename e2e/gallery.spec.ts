import { expect, test } from "@playwright/test";

/**
 * The gallery in a real browser: what jsdom cannot see. Layout (sticky bar,
 * sticky panel, page width on a phone) and the real clipboard.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator(".pixl-gallery").scrollIntoViewIfNeeded();
});

test("the page is exactly as wide as the screen", async ({ page }) => {
  // A fieldset's default min-content width once made the chip row 624px wide
  // on a 390px phone, and the phone zoomed the whole page out to fit it.
  const { width } = page.viewportSize()!;
  const seen = await page.evaluate(() => ({
    inner: window.innerWidth,
    doc: document.documentElement.scrollWidth,
  }));
  expect(seen).toEqual({ inner: width, doc: width });
});

test("the bar stays on screen while you scroll the icons", async ({ page }) => {
  await page.mouse.wheel(0, 1200);
  await expect
    .poll(() => page.locator(".gal-bar").evaluate((el) => el.getBoundingClientRect().top))
    .toBeLessThanOrEqual(0);
  await expect(page.getByRole("searchbox")).toBeInViewport();
});

test("the detail panel floats at the bottom, then settles below the last row", async ({
  page,
}) => {
  await page.getByRole("button", { name: "arrow-right", exact: true }).click();
  const details = page.getByRole("complementary", { name: "arrow-right details" });
  await expect(details).toBeInViewport();

  // Scroll to the end of the gallery: the panel is back in flow there.
  await page.evaluate(() => {
    const end = document.querySelector(".pixl-gallery")!.getBoundingClientRect().bottom;
    window.scrollTo(0, window.scrollY + end - window.innerHeight);
  });
  const last = page.locator(".gal-tile").last();
  await expect(last).toBeInViewport();
  const lastBottom = (await last.boundingBox())!;
  const panelTop = (await details.boundingBox())!;
  expect(panelTop.y).toBeGreaterThanOrEqual(lastBottom.y + lastBottom.height);
});

test("Copy puts the icon on the clipboard, in the chosen color", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only here");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  // The hex field is hidden on phones; the native picker carries color there.
  const hex = page.getByRole("textbox", { name: "Icon color, hex" });
  if (await hex.isVisible()) await hex.fill("#2b5bff");

  await page.getByRole("button", { name: "heart", exact: true }).click();
  const details = page.getByRole("complementary", { name: "heart details" });
  await details.locator("label", { hasText: "React" }).click();
  await expect(details.getByRole("radio", { name: "React" })).toBeChecked();
  await details.getByRole("button", { name: "Copy React" }).click();
  await expect(details.getByRole("status")).toHaveText("React component copied");

  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("export function Heart(");
  if (await hex.isVisible()) expect(text).toContain("#2b5bff");
});
