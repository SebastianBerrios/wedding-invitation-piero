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

export type VenueKind = "ceremony" | "reception";

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
}

export interface DressCodeConfig {
  eyebrow: string;
  scriptWord: string;
  label: string;
  note: string;
  avoidColors: readonly string[];
}

export interface BankAccount {
  bank: string;
  accountNumber: string;
  cci?: string;
  holder?: string;
  currency?: string;
}

export interface GiftsConfig {
  eyebrow: string;
  scriptWord: string;
  paragraph: string;
  accounts: readonly BankAccount[];
  copyLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
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
