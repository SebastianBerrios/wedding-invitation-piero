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

/** @type {{out: string, src: string, widths: number[], crop?: object, flipY?: boolean, backLace?: boolean, quality?: number, role: string}[]} */
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

      const base = job.crop ?? (await sharp(srcPath).metadata());
      if (width !== base.width) {
        pipeline = pipeline.resize({ width, withoutEnlargement: true });
      }

      const stem = job.widths.length > 1 ? `${job.out}-${width}w` : job.out;
      /** @type {Record<string, number>} */
      const sizes = {};
      for (const ext of FORMATS) {
        const buf = await pipeline
          .clone()[ext]({ ...ENCODERS[ext], ...(job.quality ? { quality: job.quality } : {}) })
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
  console.log(`sources (5 PNGs, kept untouched): ${fmtBytes(sourceBytes)}`);
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
