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
