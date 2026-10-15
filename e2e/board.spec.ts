import { expect, test, type Page } from "@playwright/test";

/**
 * Layout and look, measured in a real browser: the home page's hero, and the
 * composer's screen. jsdom has no layout, so these live here.
 */

/**
 * The hero carries the name, one sentence and exactly two links. Nothing else
 * leaks into it, and never the owner-only composer.
 */
test("the hero links to the icons and GitHub, and nothing else", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const hero = page.locator("header.pixl-hero");
  await expect(hero).toBeVisible();
  expect(await page.locator("body > nav").count()).toBe(0);
  expect((await hero.getByRole("link").allTextContents()).map((t) => t.trim())).toEqual(["Explore icons", "GitHub"]);
  expect(await page.locator('a[href*="/create"]').count()).toBe(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pixle");
});

/**
 * THE HERO FILLS ONE SCREEN, AND IT GROWS RATHER THAN CLIPPING.
 *
 * Both halves, because only together are they safe — and this file has already
 * paid for getting that wrong once. `.pixl-board` carried
 * `height: calc(100dvh - var(--nav-h) - 3rem)` in its `lg` block for a day
 * after the base rule dropped the viewport lock, so the lock never actually
 * lifted on any window wide enough to see it: 508px of enforced white under the
 * grid at 1440x900, and nothing measured it.
 *
 * A `height` fills the screen and CLIPS; a `min-height` fills it and grows. The
 * short-viewport case is the one that separates them, and it is the one a
 * person hits with a large text size or a small laptop.
 */
test("the hero fills one screen and still grows past it", async ({ page }) => {
  await page.goto("/");

  for (const height of [900, 700]) {
    await page.setViewportSize({ width: 1440, height });
    const seen = await page.evaluate(() => {
      const hero = document.querySelector(".pixl-hero")!.getBoundingClientRect();
      const gallery = document
        .querySelector(".pixl-gallery")!
        .getBoundingClientRect();
      return {
        hero: Math.round(hero.height),
        // The grid begins exactly at the fold: the hero is the whole first
        // screen and the gallery is the second.
        galleryTop: Math.round(gallery.top - hero.top),
        viewport: window.innerHeight,
      };
    });
    expect(
      seen.hero,
      `the hero is ${seen.hero}px in a ${height}px window`,
    ).toBeGreaterThanOrEqual(height - 1);
    expect(Math.abs(seen.galleryTop - seen.hero)).toBeLessThanOrEqual(1);
  }

  /* AND IT IS `min-height`. At 320px of window the content cannot fit a screen,
     so a fixed height would clip it and put the links out of reach with no
     scroll to recover them. The hero has to come back TALLER than the viewport
     here, which is the assertion a `height` rule fails. */
  await page.setViewportSize({ width: 1024, height: 320 });
  const squeezed = await page.evaluate(() => ({
    hero: Math.round(document.querySelector(".pixl-hero")!.getBoundingClientRect().height),
    links: Math.round(
      document.querySelector(".pixl-hero-keyrow")!.getBoundingClientRect().bottom,
    ),
  }));
  expect(
    squeezed.hero,
    "the hero clipped its own content instead of growing",
  ).toBeGreaterThan(320);
  expect(squeezed.links).toBeGreaterThan(0);
});


/**
 * The art is the set's own icons at size, filling the half of the screen the
 * type does not use — and it is DESKTOP ONLY. A phone hero is one column with
 * no second half, and sprites behind a paragraph at 390px is a texture under
 * text.
 */
test("the hero's art fills the screen beside the type, and never the text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  // Dealt in the browser on hydration, so wait for the seats to fill.
  await expect(page.locator(".pixl-hero-sprite")).toHaveCount(6);

  const seen = await page.evaluate(() => {
    // The real INK extent of the type, via a Range — the blocks themselves span
    // the full body width, so their boxes say nothing about where the text
    // actually ends.
    const inkRight = (selector: string) => {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector(selector)!);
      return range.getBoundingClientRect().right;
    };
    const hero = document.querySelector(".pixl-hero")!.getBoundingClientRect();
    const sprites = [
      ...document.querySelectorAll<HTMLElement>(".pixl-hero-sprite"),
    ].map((s) => s.getBoundingClientRect());
    return {
      count: sprites.length,
      clearance: Math.round(
        Math.min(...sprites.map((s) => s.left)) -
          Math.max(inkRight(".pixl-hero-mark"), inkRight(".pixl-hero-line")),
      ),
      // How much of the hero's height the constellation actually covers. The
      // art was a child of the BODY for one pass, whose box is only as tall as
      // four lines of type — so the sprites sat in a 430px band in the middle
      // of a 900px screen and both thirds outside it stayed empty.
      coverage:
        (Math.max(...sprites.map((s) => s.bottom)) -
          Math.min(...sprites.map((s) => s.top))) /
        hero.height,
      /* BLEEDING OFF IS THE COMPOSITION (2026-09-15), which is phosphoricons.com's:
         big pieces cropped by the screen's edge. What must not happen is a
         piece hanging off the LEFT, into the type's side, or one entirely
         off screen, which would be decoration nobody can see. */
      spills: sprites.filter(
        (s) => s.left < hero.left + hero.width / 2 - 80 || s.bottom < hero.top || s.top > hero.bottom || s.left > hero.right,
      ).length,
      bleeds: sprites.filter((s) => s.top < hero.top || s.bottom > hero.bottom || s.right > hero.right).length,
    };
  });

  expect(seen.count).toBeGreaterThan(4);
  expect(
    seen.clearance,
    `the art begins ${seen.clearance}px from the type`,
  ).toBeGreaterThan(60);
  expect(
    seen.coverage,
    `the art covers ${(seen.coverage * 100).toFixed(0)}% of the hero's height`,
  ).toBeGreaterThan(0.6);
  expect(seen.spills, "a sprite is off screen or on the type's side").toBe(0);
  expect(seen.bleeds, "no piece bleeds off the screen's edge").toBeGreaterThan(0);

  // Below `lg` it is not rendered at all.
  await page.setViewportSize({ width: 390, height: 800 });
  expect(
    await page.locator(".pixl-hero-sprite").first().isVisible(),
  ).toBe(false);
});


async function paint(
  page: Page,
  selector: string,
  prop: "background" | "color",
) {
  return page.evaluate(
    ([sel, which]) => {
      const cs = getComputedStyle(document.querySelector(sel)!);
      const source =
        which === "color" ? cs.color : cs.backgroundImage + cs.backgroundColor;
      // OPAQUE STOPS ONLY. The LCD carries a glass sheen over it — white at 3%
      // and 14% — and a parser that drops the alpha counts those as pure white
      // and reports the panel a third brighter than it paints. This test read
      // 3.1:1 on a panel that actually measures 9:1 for exactly that reason.
      const opaque = (c: number[]) =>
        c.every((v) => Number.isFinite(v)) &&
        (c[3] === undefined || c[3] > 0.999);
      const stops = [
        ...[...source.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => {
          const parts = m[1].split(/[,\s/]+/).map(Number);
          return [
            ...parts.slice(0, 3).map((v) => v / 255),
            ...parts.slice(3, 4),
          ];
        }),
        ...[...source.matchAll(/color\(srgb ([^)]+)\)/g)].map((m) =>
          m[1]
            .trim()
            .split(/[\s/]+/)
            .map(Number),
        ),
      ]
        .filter(opaque)
        .map((c) => c.slice(0, 3));
      const flat = stops.flat();
      return {
        level: flat.reduce((a, b) => a + b, 0) / flat.length,
        // Mean per-channel, for judging a colour cast.
        rgb: [0, 1, 2].map(
          (i) => stops.reduce((a, c) => a + c[i], 0) / stops.length,
        ) as [number, number, number],
      };
    },
    [selector, prop] as const,
  );
}

/**
 * THE TWO BOARDS NO LONGER DRAW ON THE SAME PANEL (2026-09-19), and that is the
 * point of this test now.
 *
 * It used to assert the opposite: that the composer's screen and the gallery's
 * mini screen were ONE part in two places — the same sage segment panel, within
 * 0.06 of a level of each other. That was true and worth pinning for three
 * weeks. The scope reskin ended it: the composer's screen is a CATHODE TUBE
 * with a lit phosphor face, and the gallery's is a segment panel. A tube and an
 * LCD are different parts, and the moment they were required to match, one of
 * them would have had to stop being what it is.
 *
 * What is asserted instead is the thing that can still silently break: that the
 * composer's face is LIT, in the phosphor's own blue-green, and that it did not
 * quietly revert to the near-black tube of the first reskin pass — which is the
 * build where black art vanished into a black screen.
 */
for (const theme of ["light", "dark"] as const) {
  test(`the composer's tube is a LIT phosphor face — ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    /* THE OS IS THE ONLY THEME SOURCE (2026-09-13). `emulateMedia` drives the
       same rule the stylesheet actually reads. */
    await page.emulateMedia({ colorScheme: theme });

    await page.goto("/create");
    const tube = await paint(page, ".scope-crt", "background");

    // LIT, not a dark tube. The first reskin pass had this inverted — a glowing
    // graticule on near-black glass, which measured ~0.01 — and dark art
    // disappeared into it.
    expect(tube.level).toBeGreaterThan(0.2);
    /* GREEN LEADS, which is the one claim that survives a phosphor swap. The
       screen is DMG olive; it was scope cyan a day earlier and
       `--crt-phosphor-cyan` is kept beside it so switching back is one edit.
       Asserting the exact hue would make this test fail on a supported swap,
       so it asserts the property both phosphors share. */
    expect(tube.rgb[1]).toBeGreaterThanOrEqual(tube.rgb[0]);
    expect(tube.rgb[1]).toBeGreaterThanOrEqual(tube.rgb[2]);

    /* AND IT DOES NOT FOLLOW THE THEME. The instrument paints its own world, as
       the hero does — so this same assertion has to hold under both, and the
       two runs of this test are what prove it rather than a comment saying so.
       If the chassis is ever put back on the shell's palette, one of these two
       fails and names which. */
    const chassis = await paint(page, ".toy-frame", "background");
    /* The shell is GRAPHITE (2026-09-20) and does NOT follow the theme — the
       two runs of this test are what prove that rather than a comment saying
       so. Put the chassis back on the shell's palette and the LIGHT run fails
       and names itself, because the shell is near-white in light mode.

       IT WAS `> 0.5`, FOR THE OFF-WHITE SHELL. The threshold flipped with the
       finish; what it pins did not. */
    expect(chassis.level).toBeLessThan(0.3);

    /* AND THE TUBE IS THE BRIGHTEST THING ON THE BOARD, which is the whole
       argument for a dark case on the one route whose job is drawing. It is a
       relationship rather than a level, so it survives a retune of either. */
    expect(tube.level).toBeGreaterThan(chassis.level);
  });
}
