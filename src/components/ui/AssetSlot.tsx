/* eslint-disable @next/next/no-img-element --
 * See PageBackground.tsx: every raster here is served straight from `public/`,
 * already optimised by `scripts/optimize-images.mjs`, so `/_next/image` would
 * only re-encode it at a quality this project did not choose.
 */

import type {
  DecorativeAssetConfig,
  PhotoConfig,
} from "@/config/invitation.types";

/**
 * Renders ONE reusable slot for every photograph and every decorative
 * illustration/icon this project is still missing, shared by every section
 * that needs one — this is deliberately the ONE component for the job, not
 * a per-section variant.
 *
 * ## Why a visible placeholder now, where a previous pass rendered nothing
 *
 * An earlier instruction was "no grey boxes, no 'image here' placeholders,
 * no stock substitutes", and this component used to return `null` when a
 * slot was empty. That instruction has been REVERSED: the couple wants to
 * see exactly what is missing and exactly where to drop the real file, so
 * assets can be handed off in one pass instead of hunting through
 * components. This file is the single place that decision now lives.
 *
 * ## The placeholder reserves the SAME box the real asset will occupy
 *
 * `VARIANTS.box` fixes an `aspect-ratio` regardless of whether an asset is
 * present, so the placeholder and the eventual real image occupy an
 * identical box. Dropping a real file in therefore causes ZERO layout shift
 * — CLS stays 0 by construction, not by measurement after the fact.
 *
 * ## `box` vs `shape` — why the placeholder does NOT get the real crop
 *
 * `VARIANTS.shape` is the oval/overflow-hidden crop that makes a REAL photo
 * read as the reference's oval or full-bleed frame. The placeholder never
 * gets it: a first pass gave the placeholder the same rounded/clipped shape
 * as the real image and, measured in a real browser, the label text either
 * spilled past the ellipse's rectangle at the corners or (for the small
 * `icon` variant, whose intrinsic box is far too small for a sentence) ran
 * on top of neighbouring slots. A placeholder that clips or overlaps its own
 * handover text has failed at the one thing it exists to do. So the
 * placeholder is always a plain, unclipped rectangle at the variant's `box`
 * size — visibly NOT the final shape, which if anything reinforces that it
 * is a placeholder, not a preview.
 *
 * ## The `icon` variant additionally moves its label OUT of the box
 *
 * A real itinerary icon is small by design (it sits above one row's time in
 * a narrow column), and no font size keeps a path like
 * "itinerary.icons.ceremony → public/images/icon-ceremony.png" legible
 * inside a box that size. So `icon` renders a small dashed square (the
 * actual reserved box — unchanged when a real icon lands) plus its label
 * BELOW it as a separate, narrow, wrapping caption, rather than inside it.
 * The reserved icon box's own size is unaffected by the caption, so CLS is
 * still zero for the icon itself; the caption is new content with nothing
 * before it to displace.
 *
 * ## Content vs decorative — and why the PLACEHOLDER ignores that split
 *
 * `kind="content"` is a real photograph a guest can perceive: `alt` is
 * required on `PhotoConfig` and is rendered on the real `<img>`.
 * `kind="decorative"` is a line-art illustration/icon that, once real, is
 * purely visual (`aria-hidden="true"`, empty `alt`) because the surrounding
 * text already carries the information — an itinerary row's own label, a
 * section's own heading.
 *
 * The PLACEHOLDER state is neither of those; it is AUTHOR-FACING scaffolding
 * for whoever is finishing the page, not guest-facing content or guest-facing
 * decoration. So it is always real, visible, perceivable text — NEVER
 * `aria-hidden`, regardless of `kind` — and its label lives in this
 * component, not in `src/config/invitation.ts`'s guest copy.
 *
 * ## Handover, in visible text
 *
 * The label reads "{description}" over "{slotPath} → {filePath}", so the
 * rendered PAGE itself tells the couple/developer exactly what goes where
 * without opening a single component file. `break-all` on the path is
 * load-bearing: it is one long token with no spaces, and without it the
 * text does not wrap and instead overflows its box — measured in a real
 * browser, not assumed. `data-asset-slot={slotPath}` is also set on the
 * rendered element (placeholder or real), so measurement tooling can select
 * any one slot directly.
 *
 * ## Contrast on two different grounds
 *
 * This project alternates cream (`bg-surface`) and dark-olive
 * (`bg-surface-dark`) section backgrounds, and this component is used on
 * both — and, within one section, a slot can sit either on the bare section
 * background OR on a `PaperPanel`'s cream paper (see `EventDetailsSection`'s
 * doc comment for a real case where those differ within the SAME section).
 * `tone` is therefore set per call site to whatever the slot's actual
 * nearest painted ground is, not inferred from the section. `tone="on-cream"`
 * uses `text-body` (7.29:1 on cream); `tone="on-olive"` uses `text-surface`
 * (7.28:1 on olive, the same pairing the rest of the project already relies
 * on for cream text on this ground — see `--color-surface-dark`'s comment in
 * globals.css). The dashed border and the tinted fill both derive from the
 * SAME token as the text, at reduced alpha, so a placeholder never
 * introduces a third colour that would need its own contrast check.
 *
 * ## Going from placeholder to real — the same three steps every time
 *
 * 1. Put the file under `public/images/` (the path this component's label
 *    advertises).
 * 2. If it needs resizing/format conversion, add a job for it in
 *    `scripts/optimize-images.mjs` and run `npm run images:optimize`. A
 *    plain PNG/JPEG that needs no processing may be referenced directly —
 *    the validator (`invitation.validate.ts`) accepts `.webp`, `.avif`,
 *    `.jpg`, `.jpeg`, or `.png`.
 * 3. Set the matching config field to `{ src: "/images/opt/<file>.webp" }`
 *    (add `alt` too for a `kind="content"` slot).
 * The placeholder disappears and the real asset fills its exact box —
 * no other code changes.
 */
export type AssetVariant = "oval" | "interlude" | "icon" | "illustration";

const VARIANTS: Record<
  AssetVariant,
  { box: string; shape: string; image: string; captionBelow?: boolean }
> = {
  /**
   * The venue view inside the paper panel: an oval, desaturated, as the
   * reference renders it. `rounded-[50%]` on a 5:3 box is the ellipse —
   * applied only to the REAL image (`shape`), never to the placeholder.
   */
  oval: {
    box: "relative w-[68%] aspect-[5/3]",
    shape: "overflow-hidden rounded-[50%]",
    image: "absolute inset-0 h-full w-full object-cover grayscale",
  },
  /**
   * A full-bleed portrait of the couple between blocks. Full section width,
   * no frame and no rounding — the reference lets these run edge to edge.
   */
  interlude: {
    box: "relative w-full aspect-[4/5] sm:aspect-[3/2]",
    shape: "overflow-hidden",
    image: "absolute inset-0 h-full w-full object-cover",
  },
  /**
   * A small line-art icon above an itinerary row's time. See the class doc
   * comment: this is the one variant whose placeholder label moves BELOW
   * the reserved box instead of inside it.
   */
  icon: {
    box: "relative mx-auto aspect-square w-8 sm:w-10",
    shape: "",
    image: "absolute inset-0 h-full w-full object-contain",
    captionBelow: true,
  },
  /** A larger line-art illustration inside the dress-code/gifts blocks. */
  illustration: {
    box: "relative mx-auto aspect-[4/3] w-2/3 max-w-xs sm:max-w-sm",
    shape: "",
    image: "absolute inset-0 h-full w-full object-contain",
  },
};

const TONE = {
  "on-cream": "border-body/60 bg-body/5 text-body",
  "on-olive": "border-surface/60 bg-surface/10 text-surface",
} as const;

interface AssetSlotBaseProps {
  variant: AssetVariant;
  /**
   * Which ground this slot's PLACEHOLDER text sits on — the slot's nearest
   * actually-painted background, not necessarily "the section's" colour
   * (a slot inside a `PaperPanel` sits on cream even in an olive section).
   * See the contrast note above.
   */
  tone: keyof typeof TONE;
  /** Short author-facing description, e.g. "Ceremony itinerary icon". */
  description: string;
  /**
   * The exact config path this slot reads from, e.g.
   * "venues.ceremony.photo" or "itinerary.icons.ceremony". Also set as
   * `data-asset-slot` on the rendered element, so a placeholder is
   * independently selectable for contrast/visual regression checks without
   * a hand-rolled CSS selector per slot.
   */
  slotPath: string;
  /**
   * Root-relative-to-repo path to drop the real source file at, e.g.
   * "public/images/venue-church.png". Combined with `slotPath` into the
   * placeholder's visible label as "{slotPath} → {filePath}".
   */
  filePath: string;
  className?: string;
}

type AssetSlotProps =
  | (AssetSlotBaseProps & { kind: "content"; asset: PhotoConfig | undefined })
  | (AssetSlotBaseProps & {
      kind: "decorative";
      asset: DecorativeAssetConfig | undefined;
    });

export function AssetSlot({
  asset,
  variant,
  kind,
  tone,
  description,
  slotPath,
  filePath,
  className = "",
}: AssetSlotProps) {
  const { box, shape, image, captionBelow } = VARIANTS[variant];

  if (!asset) {
    // Deliberately NOT aria-hidden (see the class doc comment): this text is
    // the entire point of the placeholder and must be perceivable, not just
    // visible. `break-all` is load-bearing on the path — one long token
    // with no spaces, measured to overflow its box without it. Colour comes
    // from `TONE` on the nearest ancestor with that class (below); this
    // element only sets layout.
    //
    // `text-xs` (12px), never smaller: Lighthouse's Best Practices
    // "legible font sizes" audit flags body text under ~12px, and a first
    // pass at 11.2px (`text-[0.7rem]`) measurably dropped that score from
    // 100 to 96 across ten new placeholder labels. 12px is also the
    // practical floor for `break-all` monospace text to stay readable.
    const label = (
      <p className="font-serif text-xs leading-snug">
        {description}
        <br />
        <span className="break-all font-mono">
          {slotPath} → {filePath}
        </span>
      </p>
    );

    if (captionBelow) {
      return (
        <div
          data-asset-slot={slotPath}
          className={`flex flex-col items-center gap-1 ${TONE[tone]}`}
        >
          <div
            className={`${box} ${className} flex items-center justify-center border-2 border-dashed`}
          >
            {/*
              A plain `<div>`, not a `<span>`: this box sits inside an
              itinerary `<ol>` alongside real `<span>` time/label text, and a
              stray decorative `<span>` here would be indistinguishable from
              that real content to a broad `ol span` selector (measurement
              tooling, or a future one) — this element carries no
              information (`aria-hidden`), so it should not even resemble one.
            */}
            <div aria-hidden="true">?</div>
          </div>
          <div className="max-w-[9rem] text-center">{label}</div>
        </div>
      );
    }

    return (
      <div
        data-asset-slot={slotPath}
        className={`${box} ${className} flex items-center justify-center border-2 border-dashed p-2 text-center ${TONE[tone]}`}
      >
        {label}
      </div>
    );
  }

  return (
    <div data-asset-slot={slotPath} className={`${box} ${shape} ${className}`}>
      <img
        src={asset.src}
        alt={kind === "content" ? asset.alt : ""}
        aria-hidden={kind === "decorative" ? "true" : undefined}
        loading="lazy"
        decoding="async"
        className={image}
      />
    </div>
  );
}
