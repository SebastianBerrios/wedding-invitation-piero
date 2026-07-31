/**
 * Raster asset pipeline: `public/images/*.png` (sources) -> `public/images/opt/`
 * (WebP + AVIF derivatives the app actually references).
 *
 * Run with `npm run images:optimize`. Idempotent and re-runnable: it always
 * rewrites every derivative from the source, so the committed output is
 * reproducible rather than a one-off someone did by hand.
 *
 * ## Why the sources are never touched
 *
 * `public/images/*.png` are the user-supplied originals (see ASSETS.md). They
 * are the input of record: this script only reads them. Nothing in `src/`
 * references a source PNG — every consumer points at `public/images/opt/`.
 *
 * ## Why every derivative is CROPPED
 *
 * The three envelope PNGs are 600x800 canvases holding a ~469x361 object with
 * transparent padding around it, and `sheet.png` is a 493x799 canvas holding a
 * 467x749 sheet. Shipping that padding costs bytes and — more importantly —
 * forces every CSS consumer to re-derive the object's offset inside its canvas.
 * Cropping to the object's own alpha bounding box makes the derivative's box
 * BE the object's box, so `letter.png` and `letter-open.png` register 1:1 by
 * construction (they share the identical crop rect) instead of by arithmetic
 * that drifts the next time anything moves.
 *
 * The crop rects below were measured off the sources' alpha channels, not
 * guessed. `ENVELOPE_RECT` is the front pocket's own bounds in `letter.png`;
 * `letter-open.png` is cropped with the SAME rect so its interior lines up
 * behind the front face exactly.
 *
 * ## Why the flap is a separate, vertically flipped derivative
 *
 * `letter-open.png` carries the flap as a lace-edged triangle ABOVE the
 * envelope body, apex up (its opened, folded-back position). The animated flap
 * needs that same paper apex DOWN, hinged on the envelope's top edge. Flipping
 * it here — rather than with a CSS `scaleY(-1)` wrapper nested inside a
 * `rotateX` in a `preserve-3d` subtree — keeps the animated element to ONE
 * transform, which is the only transform the keyframes are allowed to own.
 * Lace trim then sits on the two edges converging at the apex, i.e. the flap's
 * free edges, which is where it belongs on a closed envelope.
 *
 * ## Widths
 *
 * Derivatives are never upscaled past their source: an upscaled encode costs
 * real bytes and adds no detail, and the browser/compositor can scale the
 * smaller file to the same result. So the background stops at its native 901px
 * and the envelope/card layers ship a single width each (their rendered CSS
 * width never exceeds ~416px, so one 467-469px file covers DPR 1 outright and
 * is the best available for DPR 2 regardless).
 */

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC_DIR = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(SRC_DIR, "opt");

/**
 * The front pocket's own bounds inside `letter.png` (alpha > 16), and therefore
 * the shared registration frame for the whole envelope stack.
 * 469 x 361 => aspect 1.29917, which is what `.envelope` must use.
 */
const ENVELOPE_RECT = { left: 66, top: 323, width: 469, height: 361 };

/**
 * The lace-edged flap triangle inside `letter-open.png`: apex at (300, 99),
 * base at y = 331 spanning the envelope's full width. Cropped on the same x
 * range as `ENVELOPE_RECT` so the triangle's base is exactly as wide as the
 * envelope and its apex lands exactly on the box's horizontal centre.
 */
const FLAP_RECT = { left: 66, top: 99, width: 469, height: 232 };

/** The sheet's own bounds inside `sheet.png`. 467 x 749 => aspect 0.62350. */
const CARD_RECT = { left: 13, top: 25, width: 467, height: 749 };

/**
 * The lace doily's own bounds inside `heart.png` (alpha > 16).
 * 738 x 649 => aspect 1.13713, i.e. the heart is WIDER than it is tall.
 *
 * The source canvas is 800x779 and carries a light wedge of stray RGB in its
 * top-left corner; every pixel of it has alpha 0, so it never composites and
 * the crop does not need to dodge it.
 */
const HEART_RECT = { left: 28, top: 43, width: 738, height: 649 };

/**
 * The botanical sprig's own bounds inside `flowers.png` (alpha > 16).
 * 313 x 623 => aspect 0.50241. Only 1.1% of the source is fully opaque: this is
 * a soft watercolour study whose edges are almost entirely partial alpha, which
 * is exactly why it can overlap the doily's outline without looking pasted on.
 */
const FLOWERS_RECT = { left: 104, top: 61, width: 313, height: 623 };

/**
 * The sprig is ROTATED HERE, not in CSS, and that is a bug fix rather than a
 * preference.
 *
 * The source stands upright with its buds at the top and its stem trailing down
 * to the right; the reference lays it diagonally across the doily's lower-left
 * with the buds up-right and the stem down-left, which is -52deg.
 *
 * Done as a CSS `-rotate-[52deg]` it rendered correctly and still had to go: a
 * transform does not change an element's layout box, but it DOES change
 * `getBoundingClientRect()`, and the rotated box of a 117 x 233 element is 256 px
 * wide. Measured on the real page at a 390px viewport, that box reached x = -53 —
 * i.e. 53 px outside the viewport — while the visible ink stayed comfortably
 * inside, because the corners of a rotated bounding box are empty. So it read as
 * a real edge-crossing element to `audit.mjs` and no amount of repositioning fixed
 * it without dragging the sprig off the doily.
 *
 * Rotating in `sharp` and re-cropping to the rotated ink's own alpha bounds makes
 * the element axis-aligned again, so its box IS its ink — the same rule the rest
 * of this pipeline follows — and the geometry cannot lie to a measurement script.
 */
const FLOWERS_ROTATE_DEG = -52;

/**
 * The divider rule's own bounds inside `separator.png` (alpha > 16).
 * 794 x 21. Its opaque pixels are pure rgb(0,0,0) — a black hairline with a
 * small diamond at the centre, which is what the reference draws.
 */
const SEPARATOR_RECT = { left: 3, top: 0, width: 794, height: 21 };

/**
 * The paper PANEL's own bounds inside `sheet-two.png` — the sheet only, with
 * the baked drop shadow deliberately EXCLUDED.
 *
 * Measured off the alpha channel and the luminance profile: the paper is fully
 * opaque over x 91..674, y 89..1500 (584 x 1412 => aspect 0.41389), and a soft
 * shadow band of partial alpha (peaking at a=78) runs down its right side over
 * x 675..702. Cropping the shadow out keeps the derivative's box EQUAL to the
 * paper's box — the same rule the envelope layers follow — so a CSS percentage
 * inset means what it says instead of silently including 5% of shadow. The
 * shadow is then drawn with `box-shadow`, where its direction and softness are
 * tunable and can match the reference's left-hand fall.
 *
 * Also measured, and load-bearing for the CSS: the paper carries an embossed
 * DOUBLE frame whose two lines sit 29 px and 39 px inside the paper edge, and
 * the inset is the same on all four sides. `.paper-panel` in globals.css slices
 * this image as a `border-image` at 52 px, i.e. just inside the inner line, so
 * the frame renders undistorted at any panel height.
 */
const PANEL_RECT = { left: 91, top: 89, width: 584, height: 1412 };

/** @type {{out: string, src: string, widths: number[], crop?: object, flipY?: boolean, rotate?: number, backLace?: boolean, quality?: number, alphaQuality?: number, role: string}[]} */
const JOBS = [
  {
    out: "background",
    src: "background-main.png",
    // Native width is 901; the page paints it with `cover`, so `sizes="100vw"`
    // picks the smallest width that still covers the viewport.
    //
    // 768 exists specifically for the 2x-ish phone. Lighthouse emulates a
    // 412 CSS px viewport at DPR 1.75, i.e. 721 device px, which without this
    // step jumps straight to 901 and made `uses-responsive-images` score 0 with
    // "est. savings 33 KiB" — the largest single item on the critical path.
    widths: [480, 640, 768, 901],
    // Quality 62, not the shared 72. This is a soft watercolour wash painted
    // under a cream veil, and the two encodes differ by a mean of 3.38/255 per
    // channel against 3.29 at q66 — i.e. the curve has gone flat and the extra
    // 18 KiB at 901w buys nothing the veil would not swallow anyway. The small
    // envelope/card layers keep 72 because they carry the lace and the emboss,
    // and they are 2-8 KiB regardless.
    quality: 62,
    role: "page background",
  },
  {
    out: "envelope-back",
    src: "letter-open.png",
    crop: ENVELOPE_RECT,
    widths: [ENVELOPE_RECT.width],
    role: "envelope interior (L1)",
  },
  {
    out: "envelope-front",
    src: "letter.png",
    crop: ENVELOPE_RECT,
    widths: [ENVELOPE_RECT.width],
    role: "envelope front face + rose (L4)",
  },
  {
    out: "envelope-flap",
    src: "letter-open.png",
    crop: FLAP_RECT,
    flipY: true,
    backLace: true,
    widths: [FLAP_RECT.width],
    role: "animated flap (L3)",
  },
  {
    out: "card",
    src: "sheet.png",
    crop: CARD_RECT,
    widths: [CARD_RECT.width],
    role: "hero card (L2)",
  },
  {
    out: "heart",
    src: "heart.png",
    crop: HEART_RECT,
    // Four widths. The doily IS the Date section, so it renders from ~290 CSS px
    // on a 320 viewport to 480 px on desktop.
    //
    // 640 exists for the same reason `background` has a 768 step, and the figure
    // is measured rather than guessed: Lighthouse emulates 412 CSS px at DPR 1.75,
    // where the doily is 88vw = 362 CSS px = 634 device px. Without a step just
    // above that, `sizes` selects 738 and pays 10 KiB for resolution nothing can
    // display. 600 stays for the 1440 desktop case (480 CSS px at DPR 1).
    widths: [420, 600, 640, HEART_RECT.width],
    // Quality 48, not the shared 72. A near-white linen texture with lace relief,
    // no hard edges and no text. Composited over the olive section ground and
    // diffed against the source at 640w: q72 27.8 KiB @420w, q58 mean 2.75/255,
    // q48 mean 3.02/255, q40 mean 3.29/255 — the curve is flat from the high 50s
    // down, so q48 saves 4.7 KiB at 640w (the width Lighthouse's phone fetches)
    // for a difference of 0.27/255.
    quality: 48,
    alphaQuality: 70,
    role: "date-section doily",
  },
  {
    out: "flowers",
    src: "flowers.png",
    crop: FLOWERS_RECT,
    rotate: FLOWERS_ROTATE_DEG,
    // One width, 300: the rotated sprig is LANDSCAPE (see the rotate note), and
    // it renders at ~46% of the doily's width, i.e. ~160 CSS px on a phone and
    // ~220 on desktop. 300 therefore covers DPR 1 everywhere with headroom, and
    // is the best available at DPR 2.
    widths: [300],
    quality: 55,
    alphaQuality: 70,
    role: "sprig overlapping the doily",
  },
  {
    out: "separator",
    src: "separator.png",
    crop: SEPARATOR_RECT,
    widths: [SEPARATOR_RECT.width],
    // A 21px-tall hairline: quantisation reads directly as a fuzzy line, so
    // this one keeps a high quality. It is under 1 KiB regardless.
    quality: 88,
    role: "section divider rule",
  },
  {
    out: "panel",
    src: "sheet-two.png",
    crop: PANEL_RECT,
    // One width. This is consumed as a `border-image`, whose corner slices
    // scale by `border-width / border-image-slice` and are therefore
    // independent of how wide the panel renders; only the stretched middle
    // cares, and it is a soft near-white grain.
    widths: [PANEL_RECT.width],
    // Quality 40. The flattest curve in the whole batch: composited over the olive
    // ground and diffed, q58 measures a mean 2.07/255 against the source and q34
    // measures 2.31 — 9.2 KiB for 0.24/255. This is a near-white paper wash whose
    // only structure is a soft emboss, and crucially NONE of the text on it is part
    // of the image (the panel is a border-image behind real HTML), so quantisation
    // cannot blur a glyph. q40 keeps a little margin over the knee.
    quality: 40,
    alphaQuality: 70,
    role: "paper panel (border-image source)",
  },
];

/**
 * Encoder settings. Quality was chosen per-format rather than copied: these are
 * soft watercolour/paper textures with no hard edges or text, so they tolerate
 * far more aggressive quantisation than a UI screenshot would, and `effort`
 * costs only build time.
 */
const WEBP = { quality: 72, effort: 6 };
const AVIF = { quality: 52, effort: 6 };

/**
 * WebP only, by measurement — not by habit.
 *
 * Both formats were generated and compared at these exact settings
 * (`IMG_FORMATS=webp,avif node scripts/optimize-images.mjs` reproduces it):
 *
 *   derivative        webp        avif       avif delta
 *   background-480w   39.3 KiB    34.1 KiB   -5.2 KiB
 *   background-901w   119.6 KiB   108.4 KiB  -11.2 KiB
 *   envelope-back      2.4 KiB      1.9 KiB   -0.5 KiB
 *   envelope-front     7.7 KiB      6.6 KiB   -1.1 KiB
 *   envelope-flap     17.3 KiB     14.3 KiB   -3.0 KiB
 *   card               2.7 KiB      3.4 KiB   +0.7 KiB  <- AVIF is BIGGER
 *
 * One page load fetches one background width plus the four layers: 149.7 KiB
 * of WebP vs 134.6 KiB of AVIF on desktop, 69.4 vs 60.3 KiB on a 480w phone.
 * That is a ~10% saving — under 100 ms even on Lighthouse's simulated mobile
 * link — bought with a second `<source>` on every consumer and a decode that
 * is consistently slower than WebP's on the same pixels. The background is an
 * LCP candidate, so decode time lands directly on the metric this asset swap
 * is most at risk of regressing. It did not pay for itself; `card` would even
 * have needed a per-asset exception. Set `IMG_FORMATS` to re-measure.
 */
const FORMATS = (process.env.IMG_FORMATS ?? "webp").split(",");
const ENCODERS = { webp: WEBP, avif: AVIF };

function fmtBytes(n) {
  return `${(n / 1024).toFixed(1)} KiB`;
}

/**
 * Alpha below which a pixel is treated as "not the flap" and left see-through.
 * 64 = 25% opaque: enough to catch the lace's own body while leaving the
 * outermost scallop tips delicate.
 */
const LACE_ALPHA_FLOOR = 64;

/**
 * Back the flap's lace with its own paper.
 *
 * The lace border is real openwork: 149 pixels inside the triangle are FULLY
 * transparent and a wide band around them is only partly opaque. The flap sits
 * over the sunk card, so at rest the card's near-black script showed straight
 * through those holes — measured as ~45 stray pixels inside the envelope with a
 * peak difference of 194/255 (rgb(29,30,34) where the paper is rgb(223,221,214)).
 * That is not a geometry bug and no amount of retuning `--flap-depth` touches
 * it; it is the asset's own alpha.
 *
 * So the derivative is composited over a backing shaped like its OWN silhouette:
 * opaque wherever the lace is at least `LACE_ALPHA_FLOOR`, plus every enclosed
 * hole (found by flood-filling the transparent region from the border, so the
 * outside stays transparent and only true holes are filled), filled with the
 * flap's own mean paper colour. Physically this is also the right answer: a
 * lace-trimmed flap lying on an envelope shows PAPER through its holes, not the
 * letter inside.
 *
 * Doing it here rather than as a second CSS background layer keeps the animated
 * element to one background and one transform, and keeps the fix in the tool
 * that owns the pixels.
 */
async function backLaceWithPaper(pipeline) {
  const { data, info } = await pipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const n = W * H;

  // Mean paper colour, from fully opaque pixels only.
  let r = 0, g = 0, bl = 0, count = 0;
  for (let i = 0; i < n; i++) {
    if (data[i * C + 3] === 255) {
      r += data[i * C];
      g += data[i * C + 1];
      bl += data[i * C + 2];
      count++;
    }
  }
  const paper = [Math.round(r / count), Math.round(g / count), Math.round(bl / count)];

  // Flood-fill the OUTSIDE: every below-floor pixel reachable from the border.
  const outside = new Uint8Array(n);
  const stack = [];
  const push = (x, y) => {
    const i = y * W + x;
    if (!outside[i] && data[i * C + 3] < LACE_ALPHA_FLOOR) {
      outside[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % W, y = (i - x) / W;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }

  // Composite the original over that backing (source-over, un-premultiplied).
  const out = Buffer.alloc(n * 4);
  let filledHoles = 0;
  for (let i = 0; i < n; i++) {
    const a = data[i * C + 3] / 255;
    const backed = !outside[i];
    if (backed && data[i * C + 3] < LACE_ALPHA_FLOOR) filledHoles++;
    for (let c = 0; c < 3; c++) {
      const src = data[i * C + c];
      out[i * 4 + c] = backed ? Math.round(src * a + paper[c] * (1 - a)) : src;
    }
    out[i * 4 + 3] = backed ? 255 : data[i * C + 3];
  }
  return {
    pipeline: sharp(out, { raw: { width: W, height: H, channels: 4 } }),
    note: `lace backed with rgb(${paper}), ${filledHoles} sub-${LACE_ALPHA_FLOOR}-alpha px filled`,
  };
}

/**
 * Alpha threshold for a re-crop. Matches the threshold the hardcoded `*_RECT`
 * constants above were measured at, so a computed crop and a measured one mean
 * the same thing.
 */
const ALPHA_FLOOR = 16;

/**
 * Re-crops a pipeline to its content's own alpha bounding box.
 *
 * Needed after a rotation, which pads the canvas with transparency by an amount
 * that depends on the angle. Computing the bbox here rather than hardcoding it
 * keeps the angle the single tunable: change `FLOWERS_ROTATE_DEG` and the crop
 * follows, instead of silently shipping empty margins that would offset every CSS
 * percentage that positions the sprig.
 */
async function cropToAlphaBounds(pipeline) {
  const { data, info } = await pipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * C + 3] > ALPHA_FLOOR) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const rect = {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
  return {
    pipeline: sharp(data, { raw: { width: W, height: H, channels: C } }).extract(
      rect,
    ),
    rect,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const rows = [];
  const notes = [];
  let sourceBytes = 0;
  /** @type {Record<string, number>} */
  const outputBytes = Object.fromEntries(FORMATS.map((f) => [f, 0]));

  for (const job of JOBS) {
    const srcPath = path.join(SRC_DIR, job.src);
    sourceBytes += (await stat(srcPath)).size;

    for (const width of job.widths) {
      let pipeline = sharp(srcPath);
      if (job.crop) pipeline = pipeline.extract(job.crop);
      if (job.flipY) pipeline = pipeline.flip();
      if (job.backLace) {
        const backed = await backLaceWithPaper(pipeline);
        pipeline = backed.pipeline;
        notes.push(`${job.out}: ${backed.note}`);
      }
      let base = job.crop ?? (await sharp(srcPath).metadata());
      if (job.rotate) {
        const rotated = await cropToAlphaBounds(
          pipeline.rotate(job.rotate, {
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          }),
        );
        pipeline = rotated.pipeline;
        base = rotated.rect;
        notes.push(
          `${job.out}: rotated ${job.rotate}deg, re-cropped to ${rotated.rect.width}x${rotated.rect.height}` +
            ` (aspect ${(rotated.rect.width / rotated.rect.height).toFixed(5)}) — use THESE as the img width/height`,
        );
      }

      if (width !== base.width) {
        pipeline = pipeline.resize({ width, withoutEnlargement: true });
      }

      const stem = job.widths.length > 1 ? `${job.out}-${width}w` : job.out;
      /** @type {Record<string, number>} */
      const sizes = {};
      for (const ext of FORMATS) {
        const buf = await pipeline
          .clone()[ext]({
            ...ENCODERS[ext],
            ...(job.quality ? { quality: job.quality } : {}),
            // Lossy ALPHA, where it pays. `heart`, `flowers` and `panel` are
            // dominated by their alpha channel, which WebP stores losslessly by
            // default: `flowers` measured 29.2 KiB at alphaQuality 100 against
            // 18.1 at 70, and compositing both over the olive section ground and
            // diffing every pixel put the whole difference at a mean of
            // 0.03/255 with an IDENTICAL peak — i.e. the 11 KiB buys nothing
            // visible. `separator` deliberately opts out: it is a 21px hairline
            // where any alpha error reads as a fuzzy line, and it is under 1 KiB.
            ...(job.alphaQuality ? { alphaQuality: job.alphaQuality } : {}),
          })
          .toBuffer();
        await writeFile(path.join(OUT_DIR, `${stem}.${ext}`), buf);
        outputBytes[ext] += buf.length;
        sizes[ext] = buf.length;
      }

      rows.push({ file: stem, role: job.role, width, sizes });
    }
  }

  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    `\n${pad("derivative", 22)}${pad("w", 6)}${FORMATS.map((f) => pad(f, 12)).join("")}role`,
  );
  console.log("-".repeat(78));
  for (const r of rows) {
    console.log(
      pad(r.file, 22) +
        pad(r.width, 6) +
        FORMATS.map((f) => pad(fmtBytes(r.sizes[f]), 12)).join("") +
        r.role,
    );
  }
  console.log("-".repeat(78));
  console.log(`sources (unique PNGs, kept untouched): ${fmtBytes(sourceBytes)}`);
  for (const f of FORMATS) {
    console.log(`all ${pad(f, 5)} derivatives:            ${fmtBytes(outputBytes[f])}`);
  }
  for (const note of notes) console.log(note);

  // Anything left in opt/ that this run did not write is a stale derivative
  // from an older manifest. Report it loudly instead of leaving it to be
  // referenced by accident.
  const expected = new Set(
    rows.flatMap((r) => FORMATS.map((f) => `${r.file}.${f}`)),
  );
  const stale = (await readdir(OUT_DIR)).filter((f) => !expected.has(f));
  if (stale.length > 0) {
    console.log(`\nSTALE files in ${path.relative(ROOT, OUT_DIR)}: ${stale.join(", ")}`);
  }
}

await main();
