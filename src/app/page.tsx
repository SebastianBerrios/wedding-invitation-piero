import { HeroSection } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { DateSection } from "@/components/sections/DateSection";
import { FamilySection } from "@/components/sections/FamilySection";
import { EventDetailsSection } from "@/components/sections/EventDetailsSection";
import { DressCodeGiftsSection } from "@/components/sections/DressCodeGiftsSection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Sprig } from "@/components/decor/Sprig";

// No cookies(), headers(), searchParams, connection(), or uncached fetch is
// touched anywhere in this tree, and no `revalidate` is declared — this
// lock makes that intent explicit and reviewable (design §13). If `next
// build` ever prints `ƒ` instead of `○` for this route, something dynamic
// leaked in and the build should be treated as broken.
export const dynamic = "force-static";

/**
 * A single centered botanical divider between sections (design §9/§10,
 * work unit 8b) — purely decorative, not a `<section>`, so it does not
 * count toward spec `invitation-sections`' fixed seven-section order.
 */
function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex justify-center py-2">
      <Sprig variant="rosebud" className="h-8 w-5 rotate-180 opacity-50" />
    </div>
  );
}

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
      <RevealOnScroll>
        <LetterSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <DateSection />
      </RevealOnScroll>
      <SectionDivider />
      <RevealOnScroll>
        <FamilySection />
      </RevealOnScroll>
      <RevealOnScroll>
        <EventDetailsSection />
      </RevealOnScroll>
      <SectionDivider />
      <RevealOnScroll>
        <DressCodeGiftsSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <RsvpSection />
      </RevealOnScroll>
    </main>
  );
}
