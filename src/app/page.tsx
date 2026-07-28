import { HeroSection } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { DateSection } from "@/components/sections/DateSection";
import { FamilySection } from "@/components/sections/FamilySection";
import { EventDetailsSection } from "@/components/sections/EventDetailsSection";
import { DressCodeGiftsSection } from "@/components/sections/DressCodeGiftsSection";
import { RsvpSection } from "@/components/sections/RsvpSection";

// No cookies(), headers(), searchParams, connection(), or uncached fetch is
// touched anywhere in this tree, and no `revalidate` is declared — this
// lock makes that intent explicit and reviewable (design §13). If `next
// build` ever prints `ƒ` instead of `○` for this route, something dynamic
// leaked in and the build should be treated as broken.
export const dynamic = "force-static";

/**
 * Composes the seven invitation sections in the fixed order required by
 * spec `invitation-sections` ("Fixed Section Order"): Hero, Letter+
 * Countdown, Date, Family, Event details, Dress code+Gifts, RSVP.
 */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <LetterSection />
      <DateSection />
      <FamilySection />
      <EventDetailsSection />
      <DressCodeGiftsSection />
      <RsvpSection />
    </main>
  );
}
