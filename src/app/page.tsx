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
 * Each section is wrapped in `RevealOnScroll` (design §10, work unit 8b) —
 * a `'use client'` boundary that passes the server-rendered section through
 * untouched (see component doc), so no section content ships as client JS.
 */
export default function Home() {
  return (
    <main>
      <RevealOnScroll>
        <HeroSection />
      </RevealOnScroll>
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
