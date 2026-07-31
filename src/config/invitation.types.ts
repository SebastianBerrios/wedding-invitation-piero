/**
 * Full type contract for the single source of truth that drives every
 * server-rendered section of the invitation. See design §2
 * (sdd/wedding-invitation-page/design, obs #275) for rationale.
 */

export interface CoupleConfig {
  brideFirstName: string;
  brideFullName: string;
  groomFirstName: string;
  groomFullName: string;
  /** Two uppercase initials for the envelope seal, e.g. "PM". */
  monogram: string;
}

/**
 * Literal display strings. NEVER derived from Intl — cannot drift with
 * locale/timezone (design D2).
 */
export interface EventDateDisplay {
  day: string;
  month: string;
  year: string;
  weekday: string;
  time: string;
}

export interface EventConfig {
  /** Absolute instant with an explicit offset, e.g. "2026-12-26T11:00:00-05:00". */
  isoInstant: string;
  /** Human-facing zone label only; never used for math. */
  timeZoneLabel: string;
  display: EventDateDisplay;
}

export interface HeroConfig {
  /** e.g. "NUESTRA BODA" */
  eyebrow: string;
  /** e.g. "&" */
  ampersand: string;
  songPrompt: string;
  scrollHint: string;
}

export interface LetterUnitLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface LetterConfig {
  /**
   * The Letter section's own `h2` heading, e.g. "Nuestra Historia" —
   * distinct from `countdownHeading`, which labels only the countdown
   * sub-block nested inside this section (design apply-progress fix,
   * corrective work unit).
   */
  heading: string;
  paragraphs: readonly string[];
  /** e.g. "Faltan" — labels the countdown sub-block only, not the section. */
  countdownHeading: string;
  /**
   * Replaces `countdownHeading` once the countdown reaches `isPast`, e.g.
   * "¡Hoy!" — MUST read coherently alongside `countdownReachedLabel` (never
   * "Faltan" ["time remaining"] paired with an arrival message).
   */
  countdownReachedHeading: string;
  /** e.g. "¡Ya llegó el gran día!" */
  countdownReachedLabel: string;
  unitLabels: LetterUnitLabels;
}

export interface FamilyGroup {
  title: string;
  names: readonly string[];
}

export interface FamilyConfig {
  blessingLine: string;
  groups: readonly FamilyGroup[];
}

/**
 * A CONTENT photograph the couple supplies, e.g. a venue exterior or a portrait
 * of the two of them.
 *
 * Optional everywhere it appears, and that is the point: the reference layout
 * includes photographs this project does not have, so every frame that could
 * hold one renders ONLY when a value is present. The layout is complete and
 * correct without them and gains the photograph the moment a `src` lands here —
 * no grey boxes, no "image here" placeholders, no stock substitutes.
 *
 * `alt` is REQUIRED and validated non-empty because these are content, not
 * decoration. Decorative assets (the doily, the sprig, the divider, the paper
 * panels) are `aria-hidden` with an empty `alt` and never come through here.
 */
export interface PhotoConfig {
  /** Root-relative path under `public/`, e.g. "/images/opt/venue-church.webp". */
  src: string;
  /** Real description — never a filename, never "photo". */
  alt: string;
}

export type VenueKind = "ceremony" | "civil" | "reception";

export interface VenueConfig {
  kind: VenueKind;
  /** Section card eyebrow, e.g. "CEREMONIA RELIGIOSA". */
  label: string;
  name: string;
  address: string;
  /** Absolute https URL opened in a new tab; no embedded map SDK. */
  mapUrl: string;
  mapLinkLabel: string;
  time?: string;
  /**
   * Optional oval photograph of the venue, shown inside the paper panel
   * between the label and the venue name (the reference has one per venue).
   */
  photo?: PhotoConfig;
}

export type ItineraryIcon =
  | "ceremony"
  | "cocktail"
  | "dinner"
  | "toast"
  | "dance"
  | "photos";

export interface ItineraryRow {
  time: string;
  label: string;
  icon?: ItineraryIcon;
}

export interface ItineraryConfig {
  /** Labels only the itinerary timeline sub-block, e.g. "Itinerario". */
  heading: string;
  /** Variable-length by design — never a fixed tuple. */
  rows: readonly ItineraryRow[];
}

/**
 * The Event Details section's own `h2` heading, describing the venue cards
 * block (the itinerary timeline nested beneath it keeps its own
 * `itinerary.heading` as an `h3`).
 */
export interface EventDetailsConfig {
  heading: string;
  /**
   * Optional full-width photograph of the couple, shown between the venue
   * panel and the itinerary panel (the reference has one there).
   */
  photo?: PhotoConfig;
}

export interface DressCodeConfig {
  /** First line of the two-line heading, in serif small caps, e.g. "CÓDIGO DE". */
  eyebrow: string;
  /** Second line of the same heading, in the script face, e.g. "Vestimenta". */
  scriptWord: string;
  label: string;
  note: string;
  avoidColors: readonly string[];
  /**
   * The word that joins the last two entries of `avoidColors` into one
   * sentence, e.g. "y" (or "e" before an i-/hi- sound). Guest-facing Spanish
   * copy, so it lives here rather than in `lib/list-format.ts`.
   */
  avoidColorsConjunction: string;
  /** Optional full-width photograph of the couple, shown after this block. */
  photo?: PhotoConfig;
}

export interface BankAccount {
  bank: string;
  accountNumber: string;
  cci?: string;
  holder?: string;
  currency?: string;
}

export interface GiftsConfig {
  /** First line of the two-line heading, in serif small caps, e.g. "SUGERENCIA DE". */
  eyebrow: string;
  /** Second line of the same heading, in the script face, e.g. "Regalos". */
  scriptWord: string;
  paragraph: string;
  accounts: readonly BankAccount[];
  copyLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
  /** Optional full-width photograph of the couple, shown after this block. */
  photo?: PhotoConfig;
}

export interface RsvpMessageTemplate {
  /** e.g. "¡Hola! Confirmo mi asistencia a la boda de {couple}." */
  greeting: string;
  /** e.g. "Nombre: {name}" */
  nameLine: string;
  /** e.g. "Asistiré solo(a)." */
  guestsLineSingular: string;
  /** e.g. "Asistiremos {count} personas en total." */
  guestsLinePlural: string;
  /** e.g. "Nota: {note}" */
  noteLine: string;
}

export interface RsvpConfig {
  heading: string;
  scriptWord: string;
  paragraph: string;
  nameLabel: string;
  namePlaceholder: string;
  guestCountLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  submitLabel: string;
  maxGuests: number;
  messageTemplate: RsvpMessageTemplate;
  /** Shown when the guest tries to submit with an empty name. */
  nameRequiredHint: string;
  /** Shown when the guest count field is empty/non-numeric/out of range. */
  guestCountInvalidHint: string;
}

export interface WhatsAppConfig {
  /** Human-readable, e.g. "+51 999 999 999". */
  displayNumber: string;
  /** Raw source for normalization; digits/spaces/+/- tolerated. */
  number: string;
}

export interface AudioConfig {
  src: string;
  title: string;
  playLabel: string;
  pauseLabel: string;
  errorLabel: string;
}

export interface MetaConfig {
  title: string;
  description: string;
  locale: string;
  siteName: string;
}

export interface InvitationConfig {
  meta: MetaConfig;
  couple: CoupleConfig;
  event: EventConfig;
  hero: HeroConfig;
  letter: LetterConfig;
  family: FamilyConfig;
  venues: {
    ceremony: VenueConfig;
    reception: VenueConfig;
  };
  itinerary: ItineraryConfig;
  eventDetails: EventDetailsConfig;
  dressCode: DressCodeConfig;
  gifts: GiftsConfig;
  rsvp: RsvpConfig;
  whatsapp: WhatsAppConfig;
  audio: AudioConfig;
}
