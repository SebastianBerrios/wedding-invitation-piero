# Asset Provenance

This document accounts for every visual and audio asset used to build this
site. It is split into two parts because the project now contains both kinds:

- **User-supplied raster images** — eight PNGs placed in `public/images/` by the
  repository owner. **Their provenance is NOT established. It is pending
  confirmation from the repository owner** (see the section below). No license
  is asserted for them here, because none is known.
- **Self-authored graphics and permissively-licensed fonts** — everything else:
  hand-written SVG/CSS, Google Fonts loaded via `next/font`, and a locally
  synthesized placeholder audio file.

> **This repository is public** (`github.com/SebastianBerrios/wedding-invitation-piero`).
> Anything committed here, including the eight PNGs, is publicly distributed.
> Until their provenance and licensing are confirmed, that is a real and
> unresolved risk, not a formality.

### What changed, and what this document used to claim

Earlier revisions of this file asserted two things that are **no longer true**
and have been removed rather than softened:

1. *"Nothing in this project originates from `mejorinvitacion.com`... no fetched
   files, no copied SVG, Lottie, image, audio, or font data of any kind."*
   That claim was verifiable while every graphic was written in this repository.
   It is not verifiable for the eight supplied PNGs, whose origin is unknown to
   this document. `grep -ri "mejorinvitacion"` still returns no matches in the
   codebase, but a filename grep says nothing about where a binary came from —
   it never did, and it must not be read as provenance evidence for them.
2. *"No raster image is used anywhere for decoration"* and *"Every graphic is
   either self-authored or a permissively-licensed Google Font."*
   Both are now false: the page background, the envelope's three layers and the
   hero card are all raster images derived from the supplied PNGs.

## User-supplied raster images — provenance PENDING

Eight PNGs were supplied by the repository owner and committed under
`public/images/`. They are the **sources of record**: no build step modifies
them, and nothing in `src/` references them directly.

| File | Pixels | Source | License | Used by |
|---|---|---|---|---|
| `background-main.png` | 901×1600 | **User-supplied. Provenance pending confirmation from the repository owner.** | **Unknown — not asserted** | Page background (`decor/PageBackground.tsx`) |
| `letter.png` | 600×800 | **User-supplied. Provenance pending confirmation.** | **Unknown — not asserted** | Envelope front face + rose closure (`decor/Envelope.tsx`, L4) |
| `letter-open.png` | 600×800 | **User-supplied. Provenance pending confirmation.** | **Unknown — not asserted** | Envelope interior (L1) *and* the animated flap (L3), cropped twice |
| `sheet.png` | 493×799 | **User-supplied. Provenance pending confirmation.** | **Unknown — not asserted** | Hero card (L2) |
| `sheet-two.png` | 800×1600 | **User-supplied. Provenance pending confirmation.** | **Unknown — not asserted** | The venue panel AND the itinerary panel, as one `border-image` 9-slice (`decor/PaperPanel.tsx`) |
| `flowers.png` | 533×800 | **User-supplied. Provenance pending confirmation.** | **Unknown — not asserted** | The sprig overlapping the date doily (`sections/DateSection.tsx`) |
| `heart.png` | 800×779 | **User-supplied. Provenance pending confirmation.** | **Unknown — not asserted** | The date section's lace doily (`sections/DateSection.tsx`) |
| `separator.png` | 800×21 | **User-supplied. Provenance pending confirmation.** | **Unknown — not asserted** | Every section divider (`decor/Separator.tsx`) — four instances, one file |

**Action required from the repository owner** before launch, and before this
repository stays public with these files in it: state for each file whether it
was (a) purchased or licensed, and under which licence and from whom,
(b) created by the couple or by someone who has granted permission, or
(c) obtained from somewhere that does not permit redistribution — in which case
it must be replaced. This document will record the answer; it will not guess it.

### Derivatives actually shipped

`public/images/opt/` holds the WebP files the app references. They are generated
from the sources above by `scripts/optimize-images.mjs` (`npm run
images:optimize`) — cropped to each object's own alpha bounding box, resized,
and re-encoded. They carry the same unresolved provenance as their sources.

| Derivative | From | Transform |
|---|---|---|
| `background-{480,640,768,901}w.webp` | `background-main.png` | resize, WebP q62 |
| `envelope-back.webp` | `letter-open.png` | crop `[66,323,469×361]`, WebP q72 |
| `envelope-front.webp` | `letter.png` | crop `[66,323,469×361]` (identical rect, so the two register 1:1), WebP q72 |
| `envelope-flap.webp` | `letter-open.png` | crop `[66,99,469×232]`, flip vertically, lace holes backed with the flap's own mean paper colour, WebP q72 |
| `card.webp` | `sheet.png` | crop `[13,25,467×749]`, WebP q72 |
| `heart-{420,600,640,738}w.webp` | `heart.png` | crop `[28,43,738×649]`, resize, WebP q48 / alphaQuality 70 |
| `flowers.webp` | `flowers.png` | crop `[104,61,313×623]`, **rotate −52°**, re-crop to the rotated ink's own alpha bounds (604×385), resize to 300w, WebP q55 / alphaQuality 70 |
| `separator.webp` | `separator.png` | crop `[3,0,794×21]`, WebP q88 with LOSSLESS alpha — a 21px hairline shows any alpha error as a fuzzy line, and it is under 1 KiB either way |
| `panel.webp` | `sheet-two.png` | crop `[91,89,584×1412]` — the paper only, the baked right-hand drop shadow deliberately excluded so the derivative's box equals the paper's box — WebP q40 / alphaQuality 70 |

## Fonts

All three families are self-hosted via `next/font/google` (`src/app/layout.tsx`)
— downloaded and subset at build time, served from this app's own origin
(`/_next/static/media/*.woff2`), with zero runtime request to
`fonts.googleapis.com` or any other third party.

| Family | Source | License | Verified via |
|---|---|---|---|
| Cormorant Garamond | Google Fonts (`fonts.google.com/specimen/Cormorant+Garamond`) | SIL Open Font License, Version 1.1 | `OFL.txt` bundled with the family in the [google/fonts](https://github.com/google/fonts) repository (`ofl/cormorantgaramond/OFL.txt`), copyright "the Cormorant Project Authors" |
| Cormorant SC | Google Fonts (`fonts.google.com/specimen/Cormorant+SC`) | SIL Open Font License, Version 1.1 | `ofl/cormorantsc/OFL.txt` in the same repository, same copyright holder (small-caps variant of the same Cormorant family) |
| Pinyon Script | Google Fonts (`fonts.google.com/specimen/Pinyon+Script`) | SIL Open Font License, Version 1.1 | `ofl/pinyonscript/OFL.txt` in the [google/fonts](https://github.com/google/fonts) repository, copyright "Nicole Fally" |

**Great Vibes was REMOVED** during the visual restyle pass and is no longer
loaded, subset, or shipped. It was replaced by Pinyon Script for the couple's
names: Great Vibes is a slanted, loopy, near-monoline hand, while the target is
an upright, high-contrast formal calligraphic script with ornate swash capitals.
Petit Formal Script and Italianno were also evaluated (screenshotted at 44px and
64px) and rejected — see `src/app/layout.tsx` for the reasoning. All three
candidates are SIL OFL 1.1, so the licensing outcome would have been the same
either way.

SIL OFL 1.1 permits embedding, self-hosting, subsetting, and use in a
commercial product; it only restricts selling the font file in isolation and
requires derivative works to be renamed — neither applies here.

## Self-authored visual assets (SVG / CSS) — what is STILL self-authored

Every item below was written by hand for this project. None were copied,
traced, or derived from any third-party file — there is no external source
URL because there is no external source.

| Asset | File | Description |
|---|---|---|
| Monogram | `src/components/decor/Monogram.tsx` | Initials as SVG `<text>`, driven by `couple.monogram`. Two variants: `medallion` (double-ring badge, used by `src/app/icon.tsx`) and `plain` (letters only, printed on the envelope's front face below the rose). **The one drawn element kept on the envelope**, because `letter.png` carries no monogram and the reference prints one on the envelope's face |
| Play / pause icon | `src/components/ui/PlayPauseIcon.tsx` | Hand-drawn SVG paths, shared by `HeroSongButton` and `StickyMusicToggle` |
| Cream veil over the backdrop | `src/app/globals.css` (`.page-veil`) | ONE flat `--color-surface` layer at `opacity: 0.10`. Pure CSS, no image. The second, document-height scrim (`.page-veil-lower` at 0.72, alpha-masked) was DELETED once every content section gained its own opaque ground — see the CSS comment for the measurements that justify 0 |
| Alternating section grounds | `src/app/globals.css` (`--color-surface-dark`) | Flat cream / dark-olive `background-color` on each section, alternating as the reference does. Pure CSS, no image. Cream on the olive measures 7.28:1 |
| Envelope / card contact shadows | `src/components/decor/Envelope.tsx` | CSS `drop-shadow()` filters on the raster layers, so each shadow follows its image's own alpha rather than a bounding box |

### Self-authored graphics that were DELETED when the supplied images landed

These were real, working, hand-authored assets. They are recorded here because
this document previously listed them as the project's visuals, and because the
reasoning for removing each one is worth keeping.

| Removed asset | Was in | Replaced by | Why |
|---|---|---|---|
| Large-scale watercolour floral (2 asymmetric petal paths + 1 leaf path composed into 11 blooms × 3 jittered rings, 12 leaves, 3 haze ellipses on a 1000×1500 canvas, one bounded `feGaussianBlur`) | `src/components/decor/WatercolorBackground.tsx` | `background-main.png` | Six screenshot-reviewed iterations never reached real pigment granulation, and the two mounted instances cost **149 KB of inline SVG markup in the HTML document** (measured: 198,337 → 49,195 bytes of HTML after removal) |
| Paper ground gradient | `src/app/globals.css` (`.watercolor`) | `background-main.png` | The supplied image is the paper |
| Cold-pressed paper mottle (320×320 `feTurbulence` tile) | `src/app/globals.css` (`.watercolor-mottle`) | `background-main.png` | Redundant: the supplied image has real cold-pressed tooth |
| Fine grain overlay (220×220 `feTurbulence` tile, `mix-blend-mode: multiply` over the whole page) | `src/components/decor/GrainOverlay.tsx` | *nothing* | Redundant for the same reason, and actively harmful: a grayscale multiply over an image that already has grain only desaturates its pigment |
| White-rose rosette (3 concentric interleaved rings of one hand-drawn petal path) | `src/components/decor/RoseSeal.tsx` | the rose baked into `letter.png` | A photographic rose, and baking it into the front-face layer is also what makes it correctly occlude the closed flap's tip |
| Envelope interior / front face / flap / blurred fold shadow (hand-written SVG paths and gradients) | `src/components/decor/Envelope.tsx` | `envelope-back.webp`, `envelope-front.webp`, `envelope-flap.webp` | Real paper tooth, real lace trim, and a real cast shadow from the paper's own edge instead of a faked chevron |
| Card inset hairline frame (two `aria-hidden` `<span>`s with `--color-rule` borders) | `src/components/decor/Envelope.tsx` | the embossed frame baked into `sheet.png` | Shipping both would put two rules a few pixels apart |
| Hairline rule / divider (one line plus a rotated centre-diamond `<rect>`, both `--color-rule`) | `src/components/decor/Rule.tsx` | `separator.webp` | The couple supplied that exact ornament. Measured, its opaque pixels are pure rgb(0,0,0) where ours was pale gold at 2.05:1 on cream — the reference's divider clearly reads as a line drawn on paper and the gold one barely read at all |
| Botanical sprigs (`eucalyptus`, `olive`, `rosebud`) — three hand-drawn stem + leaf/petal path sets | `src/components/decor/Sprig.tsx` | *nothing* (`flowers.webp` covers the one place a sprig is wanted) | Its only consumer was a generic between-sections divider in `page.tsx`. The reference does not divide every section — it brackets the family block, opens the dress code and closes the gifts — so the sections place `Separator` themselves and nothing generic was left to draw |

## Favicon

| Asset | File | Source | License | Note |
|---|---|---|---|---|
| App icon | `src/app/icon.tsx` | Self-authored (generated at build time via `next/og`'s `ImageResponse`, reusing the same monogram treatment as `decor/Monogram.tsx`) | N/A (no external asset) | Replaces the previous unmodified `create-next-app` scaffold favicon (25.9 KB) — that default icon was flagged as unnecessary dead weight during a Lighthouse performance pass (perf corrective work unit) and swapped for a small, on-brand, dynamically generated icon reading the couple's initials from `invitationConfig` |

## Audio

| Asset | File | Source | License |
|---|---|---|---|
| Placeholder song | `public/audio/song.mp3` | **Synthesized locally, not downloaded from anywhere.** Generated by a Node.js script (`scratchpad/gen-placeholder-audio.mjs`, not part of this repo) that produces raw PCM samples for a single 440 Hz sine tone, faded in/out over 4 seconds at low amplitude, then encodes them to MP3 with `lamejs` (a pure-JavaScript MP3 encoder) at 22050 Hz mono / 64 kbps. Total size ~32 KB. | Public domain / no license needed — original synthesized work with no third-party input |

**This is an intentional, obviously-placeholder track** (a single soft tone,
not a song) — see `src/config/invitation.ts`'s `audio` block, which is
already documented as launch-blocking placeholder content. The couple MUST
replace `public/audio/song.mp3` with their own properly licensed track
before launch; the player (`src/lib/audio-player-store.ts`) does not assume
any particular file duration or content, and degrades gracefully
(`status: "error"`, `errorLabel` shown) if the file is ever missing or fails
to decode.

## Removed scaffold assets

`create-next-app` originally generated five unused demo SVGs in `public/`
(`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`). None were
ever referenced by any component (confirmed via a full source search) —
they were deleted during this work unit rather than documented as "used"
assets they never were.

## Verification checklist

- [x] Every file under `public/` has a matching entry above: `public/audio/song.mp3`, the eight source PNGs in `public/images/`, and the fourteen WebP derivatives in `public/images/opt/`. All eight sources are now REFERENCED — none is committed-but-unused any more.
- [x] Every self-authored SVG/CSS graphic component has a matching entry above, and every one that was deleted is recorded with the reason.
- [x] All three font families are self-hosted via `next/font`, confirmed by network inspection showing zero third-party requests (re-confirmed after the content-section restyle: 24 requests, 0 off-origin, 6 self-hosted woff2).
- [x] No source PNG is referenced by the app. Every consumer points at `public/images/opt/`, and the sources are read only by `scripts/optimize-images.mjs`.
- [x] Every DECORATIVE raster is `aria-hidden="true"` with an empty `alt` and never a description — the five envelope/background layers plus the doily, the sprig and the divider. The paper panel is a CSS `border-image`, so it is not in the accessibility tree at all. Every heading and every line of copy stays HTML.
- [ ] **OPEN: provenance and licensing of the eight user-supplied PNGs.** Blocking for launch and for keeping this repository public with those files committed. `grep -ri "mejorinvitacion"` returning no matches is *not* evidence about them — a grep over source text cannot establish where a binary came from.
- [ ] **OPEN: the placeholder audio track** must still be replaced by the couple with a properly licensed one (unchanged from before).
- [ ] **OPEN: five photographs the reference layout has and this project does not.** Nothing is faked for them. Each is an OPTIONAL `PhotoConfig` field in `src/config/invitation.ts`, currently `NO_PHOTO_YET`, and its frame renders ONLY once a `src` is present — so the layout is complete and correct without them and gains the photograph the moment one lands. No grey boxes, no "image here" placeholders and no stock substitutes were shipped. To add one: put the file under `public/images/`, add a job to `scripts/optimize-images.mjs` if it needs derivatives, then fill in the matching slot.

  | Config slot | What the reference shows there | Frame that appears |
  |---|---|---|
  | `venues.ceremony.photo` | Oval, desaturated view of the church | Oval 5:3, grayscale, inside the venue paper panel |
  | `venues.reception.photo` | Oval, desaturated view of the second venue | same |
  | `eventDetails.photo` | Full-width portrait of the couple, between the venue panel and the itinerary panel | Full width, 4:5 on a phone / 3:2 from `sm` up |
  | `dressCode.photo` | Full-width portrait of the couple, after the dress-code block | same |
  | `gifts.photo` | Full-width portrait of the couple, after the bank details | same |

  `alt` is REQUIRED on each and the validator rejects a blank one: these are content, not decoration.
- [x] **Three reference elements were deliberately NOT faked and NOT stubbed**: the four line-art itinerary icons, the dress-and-suit line illustration, and the gift-box line illustration. They are omitted entirely rather than substituted, and the layout reads as finished without them — the itinerary is a row of time-over-label columns, and the dress code and gifts blocks are heading plus copy. They get no optional slot because a missing icon in a five-column row would read as a defect, whereas a missing photograph simply is not there.
