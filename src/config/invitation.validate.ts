import type {
  CoupleConfig,
  EventDateDisplay,
  InvitationConfig,
} from "@/config/invitation.types";

export interface ConfigError {
  path: string;
  message: string;
}

const nonEmpty = (value: string): boolean => value.trim().length > 0;

const MONOGRAM_RE = /^[A-ZÁÉÍÓÚÑ]{2,3}$/;
const ISO_INSTANT_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
const ACCOUNT_NUMBER_RE = /^[\d-]{8,}$/;
const CCI_RE = /^[\d-]{10,}$/;
const AUDIO_EXTENSION_RE = /\.(mp3|m4a|ogg)$/;
const ITINERARY_ICONS = new Set([
  "ceremony",
  "cocktail",
  "dinner",
  "toast",
  "dance",
  "photos",
]);

/**
 * Width budget for a hero-card first name, in "narrow character" units.
 *
 * `.envelope-name` sizes the script from the raw character COUNT
 * (`135cqi / max(--name-length, 5)`) while the rendered width depends on WHICH
 * characters those are. Measured with a `Range` over the live rendered text
 * node at 320 / 390 / 1440 (scratchpad/name-cap.mjs), a capital in Pinyon
 * Script renders about twice as wide as a lowercase letter — the swash entry
 * strokes are what cost the space. So a capital counts as two units.
 *
 * Calibrated against real measurements rather than picked, and RE-MEASURED
 * against the raster card, whose content box is 74% of the card's width where
 * the drawn card's was 87% (scratchpad/a-namefit2.mjs, at 320 / 390 / 1440 —
 * the figures are identical at all three):
 *   FIT  Ana 4u (63%), Cielo 6u (64%), Piero 6u (69%), Guadalupe 10u (74%),
 *        Inmaculada 11u (82%), Maximiliano 12u (77%), Buenaventura 13u (77%)
 *   OVER MARIAJOSEFAX 24u (126%), MMMMMMMMMMMM 24u (170%),
 *        Wwwwwwwwwwww 13u (107%)  <- 13u, so the budget MISSES this one
 * A budget of 14 separates the realistic cases with margin at every breakpoint.
 *
 * This is deliberately a HEURISTIC for realistic names, not a renderer, and the
 * re-measurement proved it cannot be turned into one by tuning: `JOSE` (4
 * capitals) renders at 78% and `MMMM` (4 capitals) at 136%, so no linear
 * weight-and-budget pair can classify both. Doing it properly means shipping
 * per-glyph advance widths into a config validator. `MAX_ALL_CAPS_LENGTH` below
 * closes the one part of the gap that IS separable.
 */
const MAX_SCRIPT_WIDTH_UNITS = 14;

/**
 * Longest all-caps first name that still fits the hero card.
 *
 * The unit budget above is LINEAR, and measurement shows no linear model can
 * do this job: re-measured with a `Range` over the live text node at
 * 320 / 390 / 1440 (scratchpad/a-namefit2.mjs), `JOSE` renders at 78% of the
 * card's content box and `MMMM` at 136% — same length, same capital count,
 * opposite outcome. Raising the uppercase weight to 3 rejects `MaríaÁngeles`
 * (79%, an ordinary name); raising it to 4 rejects `AnaMaríaLuz` (92%) and
 * still admits `MMMM`. Both were tried and rejected.
 *
 * The separable case is the one the budget was written for — a real name typed
 * in ALL CAPS. Every measured all-caps name of five letters or more overflows
 * (`MARIA` 145%, `CARMEN` 134%, `MARIAJO` 134%, `CIELO` 111%, `JOSEP` 101%)
 * while `JOSE` at four fits, and no mixed-case name in the measured set is
 * touched by the rule at all. So this catches those with zero false positives,
 * and the remaining gap — 4-or-fewer-character strings built from the widest
 * glyph in the face (`MMMM`, `WWWW`) — is left open on purpose. Those are not
 * names, and closing them properly still needs per-glyph advance widths.
 */
const MAX_ALL_CAPS_LENGTH = 4;

/**
 * True when `name` contains at least one cased letter and no lowercase one —
 * i.e. it was typed in caps. `toLocaleLowerCase` is not needed; plain
 * `toLowerCase` already handles Á/É/Í/Ó/Ú/Ñ, and comparing against the original
 * avoids assuming ASCII.
 */
function isAllCaps(name: string): boolean {
  let hasCased = false;
  for (const char of name) {
    const lower = char.toLowerCase();
    if (lower !== char) {
      hasCased = true;
    } else if (char.toUpperCase() !== char) {
      // A cased character that is already lowercase.
      return false;
    }
  }
  return hasCased;
}

/** Width of `name` in narrow-character units: uppercase counts double. */
function scriptWidthUnits(name: string): number {
  let units = 0;
  for (const char of name) {
    // `toLowerCase() !== char` detects a cased uppercase letter without
    // assuming ASCII, so Á/É/Í/Ó/Ú/Ñ count as uppercase too. Digits, spaces
    // and punctuation are unaffected by casing and fall through to the narrow
    // weight, which is correct for them in this face.
    units += char.toLowerCase() !== char ? 2 : 1;
  }
  return units;
}

/**
 * Normalizes a phone number to a bare digit string for length validation
 * only (mirrors the behavior of `lib/whatsapp.ts`'s `normalizePhone`,
 * duplicated deliberately here so this validator stays dependency-free
 * per design §11 — it must never import from `lib/`).
 * Returns `null` instead of throwing when the result is out of E.164 bounds.
 */
function normalizePhoneDigits(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length < 8 || digits.length > 15) {
    return null;
  }
  return digits;
}

/**
 * Pure, dependency-free structural + semantic validation for
 * `InvitationConfig`. Returns every violation found (empty array === valid)
 * rather than throwing on the first one, so a single test run reports the
 * full picture. Never imported by application code (design §11) — enforced
 * only by `invitation.config.test.ts` and the `satisfies` check at build.
 */
export function validateInvitationConfig(
  config: InvitationConfig,
): ConfigError[] {
  const errors: ConfigError[] = [];

  // 1. couple.*Name non-empty after trim()
  const coupleNameFields: Array<keyof CoupleConfig> = [
    "brideFirstName",
    "brideFullName",
    "groomFirstName",
    "groomFullName",
  ];
  for (const field of coupleNameFields) {
    if (!nonEmpty(config.couple[field])) {
      errors.push({ path: `couple.${field}`, message: "must be non-empty" });
    }
  }

  // 1b. couple.{bride,groom}FirstName length cap.
  // `.envelope-name` in globals.css sizes the hero script as
  // `135cqi / max(var(--name-length), 5)` with `white-space: nowrap`, where
  // `--name-length` is the longer first name (set by `HeroSection` from this
  // config). Because the coefficient is divided by the length, a Title-Case
  // name lands at 62-92% of the card's content box at ANY length — so this cap
  // is no longer tied to one hand-tuned coefficient the way it used to be.
  // What it still guards is the FLOOR: past roughly 12 characters the divided
  // size drops below the `clamp()` minimum (1.25rem) at a 320px viewport, and
  // from there a longer name overflows the card. `nowrap` means it would
  // overflow INSIDE the card without crossing the viewport edge, where
  // `audit.mjs` (horizontal-overflow only) cannot see it — hence a data-layer
  // guard rather than a visual one. Verified by measuring synthetic 12- and
  // 14-character names with a `Range` over the rendered text node.
  const MAX_FIRST_NAME_LENGTH = 12;
  for (const field of ["brideFirstName", "groomFirstName"] as const) {
    const name = config.couple[field].trim();
    if (name.length > MAX_FIRST_NAME_LENGTH) {
      errors.push({
        path: `couple.${field}`,
        message: `must be ${MAX_FIRST_NAME_LENGTH} characters or fewer to fit the hero card at its current type scale`,
      });
    } else if (scriptWidthUnits(name) > MAX_SCRIPT_WIDTH_UNITS) {
      errors.push({
        path: `couple.${field}`,
        message:
          "renders too wide for the hero card — uppercase letters are about twice the width of lowercase in the script face, so use fewer characters or Title Case",
      });
    } else if (isAllCaps(name) && name.length > MAX_ALL_CAPS_LENGTH) {
      errors.push({
        path: `couple.${field}`,
        message:
          "renders too wide for the hero card — an all-caps name of five letters or more overflows the card in the script face, so use Title Case",
      });
    }
  }

  // 2. couple.monogram: 2-3 uppercase letters (Spanish accents allowed)
  if (!MONOGRAM_RE.test(config.couple.monogram)) {
    errors.push({
      path: "couple.monogram",
      message: "must be 2-3 uppercase letters",
    });
  }

  // 3. event.isoInstant: explicit offset/Z required and must parse
  if (
    !ISO_INSTANT_RE.test(config.event.isoInstant) ||
    !Number.isFinite(Date.parse(config.event.isoInstant))
  ) {
    errors.push({
      path: "event.isoInstant",
      message: "must be an ISO-8601 instant with an explicit offset or Z",
    });
  }

  // 4. event.display.* all non-empty
  const displayFields: Array<keyof EventDateDisplay> = [
    "day",
    "month",
    "year",
    "weekday",
    "time",
  ];
  for (const field of displayFields) {
    if (!nonEmpty(config.event.display[field])) {
      errors.push({
        path: `event.display.${field}`,
        message: "must be non-empty",
      });
    }
  }

  // 5. whatsapp.number normalizes to 8-15 digits
  if (normalizePhoneDigits(config.whatsapp.number) === null) {
    errors.push({
      path: "whatsapp.number",
      message: "must normalize to 8-15 digits",
    });
  }

  // 6. family.groups: at least one group, each with a title and names
  if (config.family.groups.length < 1) {
    errors.push({
      path: "family.groups",
      message: "must have at least one group",
    });
  }
  config.family.groups.forEach((group, groupIndex) => {
    if (!nonEmpty(group.title)) {
      errors.push({
        path: `family.groups[${groupIndex}].title`,
        message: "must be non-empty",
      });
    }
    if (group.names.length < 1) {
      errors.push({
        path: `family.groups[${groupIndex}].names`,
        message: "must have at least one name",
      });
    }
    group.names.forEach((name, nameIndex) => {
      if (!nonEmpty(name)) {
        errors.push({
          path: `family.groups[${groupIndex}].names[${nameIndex}]`,
          message: "must be non-empty",
        });
      }
    });
  });

  // 7. venues.{ceremony,reception}
  (["ceremony", "reception"] as const).forEach((kind) => {
    const venue = config.venues[kind];
    if (!nonEmpty(venue.name)) {
      errors.push({ path: `venues.${kind}.name`, message: "must be non-empty" });
    }
    if (!nonEmpty(venue.address)) {
      errors.push({
        path: `venues.${kind}.address`,
        message: "must be non-empty",
      });
    }
    if (!nonEmpty(venue.mapLinkLabel)) {
      errors.push({
        path: `venues.${kind}.mapLinkLabel`,
        message: "must be non-empty",
      });
    }
    let parsed: URL | null = null;
    try {
      parsed = new URL(venue.mapUrl);
    } catch {
      parsed = null;
    }
    if (!parsed || parsed.protocol !== "https:") {
      errors.push({
        path: `venues.${kind}.mapUrl`,
        message: "must be a valid https URL",
      });
    }
  });

  // 8. itinerary.rows: variable length, at least one row, valid icons
  if (config.itinerary.rows.length < 1) {
    errors.push({
      path: "itinerary.rows",
      message: "must have at least one row",
    });
  }
  config.itinerary.rows.forEach((row, index) => {
    if (!nonEmpty(row.time)) {
      errors.push({
        path: `itinerary.rows[${index}].time`,
        message: "must be non-empty",
      });
    }
    if (!nonEmpty(row.label)) {
      errors.push({
        path: `itinerary.rows[${index}].label`,
        message: "must be non-empty",
      });
    }
    if (row.icon !== undefined && !ITINERARY_ICONS.has(row.icon)) {
      errors.push({
        path: `itinerary.rows[${index}].icon`,
        message: "must be a known itinerary icon",
      });
    }
  });

  // 9. gifts.accounts: at least one, well-formed account/CCI numbers
  if (config.gifts.accounts.length < 1) {
    errors.push({
      path: "gifts.accounts",
      message: "must have at least one account",
    });
  }
  config.gifts.accounts.forEach((account, index) => {
    if (!nonEmpty(account.bank)) {
      errors.push({
        path: `gifts.accounts[${index}].bank`,
        message: "must be non-empty",
      });
    }
    if (!ACCOUNT_NUMBER_RE.test(account.accountNumber)) {
      errors.push({
        path: `gifts.accounts[${index}].accountNumber`,
        message: "must be digits/dashes, at least 8 characters",
      });
    }
    if (account.cci !== undefined && !CCI_RE.test(account.cci)) {
      errors.push({
        path: `gifts.accounts[${index}].cci`,
        message: "must be digits/dashes, at least 10 characters",
      });
    }
  });

  // 10. dressCode: label required; avoidColors may be empty but not blank
  if (!nonEmpty(config.dressCode.label)) {
    errors.push({ path: "dressCode.label", message: "must be non-empty" });
  }
  config.dressCode.avoidColors.forEach((color, index) => {
    if (!nonEmpty(color)) {
      errors.push({
        path: `dressCode.avoidColors[${index}]`,
        message: "must be non-empty",
      });
    }
  });

  // 11. rsvp.maxGuests: integer between 1 and 20
  if (
    !Number.isInteger(config.rsvp.maxGuests) ||
    config.rsvp.maxGuests < 1 ||
    config.rsvp.maxGuests > 20
  ) {
    errors.push({
      path: "rsvp.maxGuests",
      message: "must be an integer between 1 and 20",
    });
  }

  // 12. rsvp.messageTemplate: each line carries its required placeholder token
  const template = config.rsvp.messageTemplate;
  if (!template.greeting.includes("{couple}")) {
    errors.push({
      path: "rsvp.messageTemplate.greeting",
      message: "must contain the {couple} placeholder token",
    });
  }
  if (!template.nameLine.includes("{name}")) {
    errors.push({
      path: "rsvp.messageTemplate.nameLine",
      message: "must contain the {name} placeholder token",
    });
  }
  if (!template.guestsLinePlural.includes("{count}")) {
    errors.push({
      path: "rsvp.messageTemplate.guestsLinePlural",
      message: "must contain the {count} placeholder token",
    });
  }
  if (!template.noteLine.includes("{note}")) {
    errors.push({
      path: "rsvp.messageTemplate.noteLine",
      message: "must contain the {note} placeholder token",
    });
  }

  // 13. audio.src: root-relative path with an allowed extension
  if (
    !config.audio.src.startsWith("/") ||
    !AUDIO_EXTENSION_RE.test(config.audio.src)
  ) {
    errors.push({
      path: "audio.src",
      message: "must start with / and end with .mp3, .m4a, or .ogg",
    });
  }

  // 15. letter.heading non-empty (the Letter section's own h2, distinct
  // from countdownHeading which labels only the countdown sub-block)
  if (!nonEmpty(config.letter.heading)) {
    errors.push({ path: "letter.heading", message: "must be non-empty" });
  }

  // 19. letter.countdownReachedHeading non-empty (replaces countdownHeading
  // once the countdown reaches isPast; must stay coherent with
  // countdownReachedLabel — see invitation.types.ts)
  if (!nonEmpty(config.letter.countdownReachedHeading)) {
    errors.push({
      path: "letter.countdownReachedHeading",
      message: "must be non-empty",
    });
  }

  // 16. eventDetails.heading non-empty (the Event Details section's own h2,
  // distinct from itinerary.heading which labels only the itinerary sub-block)
  if (!nonEmpty(config.eventDetails.heading)) {
    errors.push({
      path: "eventDetails.heading",
      message: "must be non-empty",
    });
  }

  // 17. rsvp.nameRequiredHint non-empty (shown by the RsvpForm client
  // island when the guest submits with an empty name)
  if (!nonEmpty(config.rsvp.nameRequiredHint)) {
    errors.push({
      path: "rsvp.nameRequiredHint",
      message: "must be non-empty",
    });
  }

  // 18. rsvp.guestCountInvalidHint non-empty (shown when the guest-count
  // field is empty/non-numeric/out of range)
  if (!nonEmpty(config.rsvp.guestCountInvalidHint)) {
    errors.push({
      path: "rsvp.guestCountInvalidHint",
      message: "must be non-empty",
    });
  }

  // 14. meta.title / meta.description
  if (!nonEmpty(config.meta.title)) {
    errors.push({ path: "meta.title", message: "must be non-empty" });
  }
  if (!nonEmpty(config.meta.description)) {
    errors.push({ path: "meta.description", message: "must be non-empty" });
  } else if (config.meta.description.length > 160) {
    errors.push({
      path: "meta.description",
      message: "must be 160 characters or fewer",
    });
  }

  return errors;
}

const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /NOMBRE_/,
  /999 999 999/,
  /999999999/,
  /BANCO_/,
  /^NN$/,
  /000-/,
  // Sentinels that shipped in the original placeholder config but were not
  // covered here, so `PRELAUNCH=1` could pass with fake venue data still in
  // place. Any leftover ALL-CAPS token joined by underscores is a sentinel.
  /APELLIDOS/,
  /DIRECCION_/,
  /CIUDAD_/,
  /_PLACEHOLDER/,
  /IGLESIA_/,
  /LOCAL_/,
];

/**
 * Recursively scans every string leaf of the config for known placeholder
 * sentinels. Legal before launch — enforcement lives in
 * `invitation.prelaunch.test.ts`, gated by `PRELAUNCH=1`. Never imported by
 * application code.
 */
export function findPlaceholders(config: InvitationConfig): ConfigError[] {
  const errors: ConfigError[] = [];

  const walk = (value: unknown, path: string): void => {
    if (typeof value === "string") {
      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(value)) {
          errors.push({
            path,
            message: `looks like a placeholder value: "${value}"`,
          });
          break;
        }
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (value !== null && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        walk(nested, path ? `${path}.${key}` : key);
      }
    }
  };

  walk(config, "");
  return errors;
}
