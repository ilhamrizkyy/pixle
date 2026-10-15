import { expect, test, type Page } from "@playwright/test";

/**
 * Text contrast on surfaces axe structurally cannot check.
 *
 * axe refuses to judge contrast whenever an element's background is an image —
 * a gradient counts — and files those nodes under `incomplete` rather than
 * `violations`. The gallery has 32 such nodes: the nav and the sidebar are
 * built from the toy's layered gradients, so the whole blue surface of the
 * product sits in axe's blind spot while `expect(violations).toEqual([])`
 * passes over it in silence.
 *
 * That was measured, not assumed. Setting the tab ink to a mid blue at 1.44:1
 * left every axe scan green, on desktop and at phone width both.
 *
 * So this resolves the background the browser will actually paint — every
 * `color-mix()` is already expanded by the time it reaches `getComputedStyle`
 * — and checks the ink against each stop. The lightest stop is the worst case
 * for light ink and is exactly the one a hand check misses, because it is the
 * one written as a mix rather than as a hex.
 */

const AA = 4.5;

type Rgba = [number, number, number, number];

/** Every colour a resolved background names, as [r,g,b,a].
 *
 *  Three serialisations, all real: plain values come back `rgb(…)`, stops
 *  written as `color-mix()` come back `color(srgb 0.27 0.36 0.81)`, and a flat
 *  fill is on `background-color` rather than in the gradient at all. */
function colorsIn(value: string): Rgba[] {
  const found: Rgba[] = [];

  for (const match of value.matchAll(/rgba?\(([^)]+)\)/g)) {
    const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      found.push([parts[0], parts[1], parts[2], parts[3] ?? 1]);
    }
  }

  for (const match of value.matchAll(/color\(srgb ([^)]+)\)/g)) {
    const parts = match[1].split(/[\s/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      found.push([parts[0] * 255, parts[1] * 255, parts[2] * 255, parts[3] ?? 1]);
    }
  }

  return found;
}

/**
 * Flatten a background stack into the opaque colours text can actually land on.
 *
 * A TRANSLUCENT STOP IS NOT ITS OWN COLOUR. The sidebar's crown highlight is
 * `rgb(255 255 255 / 0.19)`, and reading that as white said the muted label
 * scored 1.46:1 when what is painted there is a pale blue. Every partial stop
 * is composited over the base — the last opaque colour in the stack, since CSS
 * paints the first-listed layer on top — which is what the browser does.
 *
 * Approximate in one direction: a translucent overlay is composited over the
 * base's DARKEST stop rather than over whatever sits locally beneath it, so an
 * overlay can read slightly darker here than on screen. The explicit stops —
 * which is where the real failures have been — are exact.
 */
function opaqueGrounds(stack: Rgba[]): [number, number, number][] {
  const base = [...stack].reverse().find((c) => c[3] >= 1);
  const grounds: [number, number, number][] = [];

  for (const [r, g, b, a] of stack) {
    if (a <= 0) continue;
    if (a >= 1) {
      grounds.push([r, g, b]);
    } else if (base !== undefined) {
      grounds.push([
        a * r + (1 - a) * base[0],
        a * g + (1 - a) * base[1],
        a * b + (1 - a) * base[2],
      ]);
    }
  }

  return grounds;
}

function luminance([r, g, b]: [number, number, number]) {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(
  ink: [number, number, number],
  ground: [number, number, number],
) {
  const [hi, lo] = [luminance(ink), luminance(ground)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Ink and ground are read from DIFFERENT elements wherever the text does not
 * paint its own background — a nav link sits on the brow, not on itself, and
 * reading its own (transparent) background is how this test would silently
 * measure nothing.
 */
const SURFACES = [
  /* THE NAV BAR IS GONE FROM THIS ROUTE (2026-09-13) and its links are in the
     hero and the footer, so the pairings it used to stand for are measured
     where they actually are now. `nav a` on `nav` matched the FOOTER's own
     `<nav aria-label="Site">` after the removal — a transparent ground, which
     this suite correctly refused rather than passing on nothing.

     Every one of these is a MUTED ink, which is the exact blind spot: axe reads
     a link against its own transparent background and finds nothing to
     measure. `--text-muted` was darkened specifically to clear on these
     grounds (DESIGN.md §2), and it is one `color-mix` away from being softened
     back. */
  /* THE HERO IS A CRT SCREEN (2026-09-15) with its own ground and a neon
     palette scoped to it, so every ink on it is measured against `--crt`
     rather than the page's background. The neon was picked for glow, not for
     text, and these entries are what hold the pairings that carry reading. */
  { name: "hero tagline", ink: ".pixl-hero-line", ground: ".pixl-hero" },
  { name: "hero secondary key", ink: ".pixl-hero-key:not(.is-primary)", ground: ".pixl-hero" },
  { name: "hero name", ink: ".pixl-hero-mark", ground: ".pixl-hero" },
  // An inverse block: the neon filled and the label knocked out of it. The
  // ground is the FACE, because the link around it paints nothing and only
  // carries the glow.
  {
    name: "hero key",
    ink: ".pixl-hero-key.is-primary",
    ground: ".pixl-hero-key.is-primary .pixl-hero-key-face",
  },
  { name: "footer link", ink: ".pixl-footer-links a", ground: ".pixl-footer" },
  { name: "footer note", ink: ".pixl-footer-note", ground: ".pixl-footer" },
  // The gallery. Every ink is read on the surface it actually sits on.
  { name: "hex field", ink: ".gal-hex", ground: ".gal-color" },
  { name: "size value", ink: ".gal-size output", ground: ".gal-bar" },
  { name: "shape option", ink: ".gal-seg label:not(:has(:checked))", ground: ".gal-bar" },
  { name: "category chip", ink: ".gal-chip:not(:has(:checked))", ground: ".gal-bar" },
  { name: "selected chip", ink: ".gal-chip:has(:checked)", ground: ".gal-chip:has(:checked)" },
  { name: "icon name", ink: ".gal-tile-name", ground: ".gal-tile" },
  { name: "detail name", ink: ".gal-detail-name", ground: ".gal-detail" },
  { name: "detail meta", ink: ".gal-detail-meta", ground: ".gal-detail" },
  { name: "format tab", ink: ".gal-formats label:not(:has(:checked))", ground: ".gal-detail" },
  { name: "source", ink: ".gal-code", ground: ".gal-code" },
  { name: "primary button", ink: ".gal-btn.is-primary", ground: ".gal-btn.is-primary" },
  { name: "secondary button", ink: ".gal-btn:not(.is-primary)", ground: ".gal-detail" },
] as const;

async function readSurface(page: Page, inkSel: string, groundSel: string) {
  return page.evaluate(
    ([ink, ground]) => {
      const inkNode = document.querySelector(ink);
      const groundNode = document.querySelector(ground);
      if (inkNode === null || groundNode === null) return null;
      const groundStyle = getComputedStyle(groundNode);
      return {
        color: getComputedStyle(inkNode).color,
        // The grain is a noise texture carrying no colour stops of its own.
        image: groundStyle.backgroundImage.replace(/url\("[^"]*"\)/g, ""),
        fill: groundStyle.backgroundColor,
      };
    },
    [inkSel, groundSel] as const,
  );
}

for (const theme of ["light", "dark"] as const) {
  test(`text clears AA on every gradient and card surface (${theme})`, async ({
    page,
  }) => {
    await page.goto("/");
    // The detail panel exists only while an icon is selected.
    await page.getByRole("button", { name: /arrow-right/ }).first().click();
    await page.evaluate(
      (t) => document.documentElement.setAttribute("data-theme", t),
      theme,
    );

    /* LET THE THEME LAND BEFORE READING IT.
       Flipping `data-theme` starts a 150ms background-color transition on every
       tinted chip, and `getComputedStyle` reads whatever frame it lands on. It
       caught a selected chip at rgb(122,122,125) — a colour that exists nowhere
       in either palette, being halfway between the light tint and the dark one
       — and reported a 2.90:1 failure against a pairing that is really 11:1.
       CSS transitions are in `getAnimations()`, so they can be awaited. */
    await page.evaluate(
      () =>
        Promise.race([
          Promise.all(
            document.getAnimations().map((a) => a.finished.catch(() => {})),
          ),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]),
    );

    for (const { name, ink: inkSel, ground: groundSel } of SURFACES) {
      const surface = await readSurface(page, inkSel, groundSel);
      expect(surface, `${name}: "${inkSel}" or "${groundSel}" is not on the page`)
        .not.toBeNull();
      const { color, image, fill } = surface!;

      /* THE INK'S ALPHA IS PART OF THE INK. It was dropped here — read as
         `[r, g, b]` and measured at full strength — which made this whole suite
         a no-op for anything written as `color-mix(…, transparent)`: the shape
         list's dimmed row measured its token instead of what is painted, and
         passed at an alpha that really comes to 1.99:1. `opaqueGrounds` has
         composited the BACKGROUND's partial stops since it was written; the
         foreground needed the same treatment and never got it. */
      const ink = colorsIn(color)[0];
      const grounds = opaqueGrounds([...colorsIn(image), ...colorsIn(fill)]);

      // Without these two, a refactor that made a background transparent would
      // turn this whole test into a green no-op rather than a failure.
      expect(ink, `${name}: unreadable colour "${color}"`).toBeDefined();
      expect(
        grounds.length,
        `${name}: no background colour in "${image}" / "${fill}"`,
      ).toBeGreaterThan(0);

      for (const ground of grounds) {
        const alpha = ink[3];
        const painted = [0, 1, 2].map(
          (i) => ink[i] * alpha + ground[i] * (1 - alpha),
        ) as [number, number, number];
        const value = contrast(painted, ground);
        expect(
          value,
          `${name} (${theme}): ${color} on rgb(${ground.map(Math.round)}) is ${value.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(AA);
      }
    }
  });
}

/**
 * THE COMPOSER'S TOOL BUTTONS, on their own route.
 *
 * They wore `--frame-3` for their ink — the chassis's DEEPEST tone, which
 * inverts with the theme — on a cap whose face is a light dome in both. So in
 * light mode every glyph on the toy was painted a pale silver on white and read
 * correctly only in dark. `.pixl-key` was corrected for exactly this and this
 * class was missed, which is the argument for measuring it rather than
 * eyeballing it: a wrong ink on a gradient is invisible to axe and, at 3:1-ish,
 * nearly invisible to a person who already knows what the glyph says.
 */
const TOY_SURFACES = [
  /* The instrument's pushbutton caps. They were `.toy-button`, round domed caps
     on a light chassis; they are square caps seated in routed wells now, and
     the ink rule that matters is unchanged — a CONSTANT light face takes a
     CONSTANT dark ink. §2 records the bug this catches: `--frame-3` painted on
     a light dome went pale silver on white for a week and read correctly only
     in dark. */
  { name: "tool button", sel: ".scope-switch-cap:not([aria-pressed='true'])" },
  {
    name: "latched tool button",
    sel: ".scope-switch-cap[aria-pressed='true']",
    press: "Mirror",
  },
  /* EVERY SILKSCREEN LEGEND — HUE / SAT / LUM, MIRROR, FLIP H, COLOR.
     Separate ground, because printing has no background of its own, and the
     ground here is a GRADIENT, which is the exact case axe reads as transparent
     and skips.

     THE GROUND IS THE CASE NOW, NOT A PANEL. The rails carried a tone of their
     own until the panels were stripped to pure layout (2026-09-19), so every
     legend lands on the shell itself — and pointing this at `.scope-panel`
     after that measured nothing at all, which is how the entry was found.
     Getting it wrong is the defect §2 records for `--toy-ink` and the tool
     caps both: silkscreen solved against a surface it does not sit on. */
  {
    name: "control legend",
    sel: ".scope-legend",
    ground: ".scope-frame",
  },
  /* THE HISTORY PILLS, Undo and Redo. The one place on this instrument a
     legend is printed ON a control rather than silkscreened under it — a pill
     four times as wide as it is tall can hold a word where a key cannot — so
     the pairing is the pill's own face rather than the panel.

     They were SHOULDER mouldings on the top corners for a day. A front
     elevation can only show those by cropping a part behind the shell's corner
     sweep, and after four builds it never stopped looking like a mistake,
     because the thing being drawn genuinely is not visible from the front. */
  { name: "history pill", sel: ".scope-pill" },
  /* THE EYEDROPPER, IN BOTH OF ITS STATES (2026-09-19). Quiet by default — a
     dark glyph on a flush key routed into the panel — and the accent when
     armed. Two entries, because they are two different pairings and the armed
     one is the state that matters: an eyedropper waiting for your next tap and
     not saying so is a mode you have forgotten you are in. */
  { name: "eyedropper", sel: ".scope-pick:not([aria-pressed='true'])" },
  {
    name: "armed eyedropper",
    sel: ".scope-pick[aria-pressed='true']",
    press: "Pick color (eyedropper)",
  },
] as const;

for (const theme of ["light", "dark"] as const) {
  test(`the toy's tool glyphs clear AA on their own caps (${theme})`, async ({
    page,
  }) => {
    await page.goto("/create");
    await expect(page.getByRole("application", { name: /Drawing grid/ })).toBeVisible();

    await page.evaluate(
      (t) => document.documentElement.setAttribute("data-theme", t),
      theme,
    );
    await page.evaluate(
      () =>
        Promise.race([
          Promise.all(
            document.getAnimations().map((a) => a.finished.catch(() => {})),
          ),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]),
    );

    for (const entry of TOY_SURFACES) {
      const { name, sel } = entry;

      /* ENGAGED IN THE LOOP, NOT IN THE SETUP. Two entries measure a control
         that is held down, and both used to be armed before the sweep started
         — which worked while the latching control was one of several caps and
         broke the moment the eyedropper became the only key of its kind: with
         it armed up front, `.scope-pick:not([aria-pressed='true'])` matched
         nothing and the resting pairing went unmeasured.

         Pressing here instead means every entry names the state it measures,
         and the resting entries are simply listed before the engaged ones.
         Nothing here disarms: `armEyedropper` sets rather than toggles, and
         Mirror stays latched, which is fine because each only has to still be
         engaged when its own entry is read. */
      if ("press" in entry) {
        await page.getByRole("button", { name: entry.press }).click();
        // The cap crosses to its latched value on the house 150ms clock, and a
        // computed style read mid-transition is a colour in neither state.
        await page.waitForTimeout(250);
      }

      // Printing takes its ground from the part it is printed ON; a control
      // with a cap of its own is both.
      const groundSel = "ground" in entry ? entry.ground : sel;
      const surface = await readSurface(page, sel, groundSel);
      expect(surface, `${name}: "${sel}" is not on the page`).not.toBeNull();
      const { color, image, fill } = surface!;
      const inkRgba = colorsIn(color)[0];
      expect(inkRgba, `${name}: unreadable colour "${color}"`).toBeDefined();
      const ink: [number, number, number] = [inkRgba[0], inkRgba[1], inkRgba[2]];
      const grounds = opaqueGrounds([...colorsIn(image), ...colorsIn(fill)]);
      expect(grounds.length, `${name}: no background in "${image}"`).toBeGreaterThan(0);

      for (const ground of grounds) {
        const value = contrast(ink, ground);
        expect(
          value,
          `${name} (${theme}): ${color} on rgb(${ground}) is ${value.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
