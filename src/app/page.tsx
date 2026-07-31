import { HeroSection } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { DateSection } from "@/components/sections/DateSection";
import { FamilySection } from "@/components/sections/FamilySection";
import { EventDetailsSection } from "@/components/sections/EventDetailsSection";
import { DressCodeGiftsSection } from "@/components/sections/DressCodeGiftsSection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

// No cookies(), headers(), searchParams, connection(), or uncached fetch is
// touched anywhere in this tree, and no `revalidate` is declared — this
// lock makes that intent explicit and reviewable (design §13). If `next
// build` ever prints `ƒ` instead of `○` for this route, something dynamic
// leaked in and the build should be treated as broken.
export const dynamic = "force-static";

/*
 * `SectionDivider` (a rotated botanical `Sprig`) used to sit between sections
 * here. It was DELETED with `Sprig.tsx` and `Rule.tsx` in the real-assets batch B
 * pass: the reference's divider is a hairline with a centre diamond, the couple
 * supplied that exact ornament as `separator.png`, and it does not appear between
 * every section — it brackets the family block, opens the dress code and closes
 * the gifts. So the sections place `Separator` themselves (see `Separator.tsx`)
 * and there is nothing generic left to put between them.
 *
 * Removing it also means the sections are now DIRECTLY adjacent, which matters:
 * each one paints its own opaque cream or olive ground, and a transparent
 * divider between two of them would have shown a stripe of the floral backdrop
 * between two flat panels.
 */

/**
 * Composes the seven invitation sections in the fixed order required by
 * spec `invitation-sections` ("Fixed Section Order"): Hero, Letter+
 * Countdown, Date, Family, Event details, Dress code+Gifts, RSVP.
 *
 * Every section BELOW the fold is wrapped in `RevealOnScroll` (design §10,
 * work unit 8b) — a `'use client'` boundary that passes the server-rendered
 * section through untouched (see component doc), so no section content
 * ships as client JS.
 *
 * `HeroSection` is deliberately NOT wrapped (perf corrective work unit,
 * Defect 7). Design §9 is explicit that the hero "stays a server component"
 * with "no JS, no IntersectionObserver" — its own envelope-opening keyframe
 * animation IS its reveal effect. Wrapping it in `RevealOnScroll` anyway
 * (the pre-existing bug this fixes) forced the very first, above-the-fold,
 * guaranteed-LCP content behind `opacity:0` until React hydrated, an
 * IntersectionObserver mounted and fired, and a 700ms CSS transition
 * finished — none of which the hero needs, since it's in the initial
 * viewport by definition. Measured impact: this is what was inflating LCP
 * to ~4.2s (and in some runs made LCP undetectable entirely — content
 * sitting at `opacity: 0` is excluded from LCP candidacy by spec) despite
 * the page's actual HTML/CSS/font payload finishing in well under a
 * second. Removing the wrapper here is a correctness fix, not a visual
 * change: the hero's own CSS animation already reveals it identically.
 */
export default function Home() {
  return (
    <main>
      <HeroSection />
      {/*
        One opaque cream ground for everything below the hero.
        This is NOT redundant with each section's own `bg-surface` /
        `bg-surface-dark`, and it fixes a real defect that batch B introduced.

        `RevealOnScroll` reveals by animating `opacity` from 0 on a wrapper AROUND
        the section, so until a section is revealed its whole box is transparent.
        That was harmless while the sections had no ground of their own, and became
        a regression the moment they got one: measured on the real page, the
        un-revealed Letter section showed the floral backdrop straight through
        itself and its olive body copy faded in ON TOP of the painting at ~1.3:1 —
        exactly the contrast failure the section backgrounds exist to prevent, just
        confined to the 700ms transition.

        Fixing it here rather than by threading each section's colour into
        `RevealOnScroll` keeps the colour declared in exactly one place (the
        section) and needs no new API: the transition now cross-fades from cream to
        the section's own ground, and the painting is confined to the hero, which
        is where the reference puts it too.
      */}
      <div className="bg-surface">
        <RevealOnScroll>
          <LetterSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <DateSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <FamilySection />
        </RevealOnScroll>
        <RevealOnScroll>
          <EventDetailsSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <DressCodeGiftsSection />
        </RevealOnScroll>
        <RevealOnScroll>
          <RsvpSection />
        </RevealOnScroll>
      </div>
    </main>
  );
}
