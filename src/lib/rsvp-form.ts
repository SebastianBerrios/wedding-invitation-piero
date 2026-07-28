import type { RsvpMessageTemplate } from "@/config/invitation.types";
import { buildWhatsAppUrl, composeRsvpMessage } from "@/lib/whatsapp";

/**
 * Pure helpers assembling the RSVP form's raw field state into a `wa.me`
 * href (client-side validation + message composition, design §7). Reuses
 * `composeRsvpMessage`/`buildWhatsAppUrl` from `lib/whatsapp.ts` rather than
 * reimplementing message/URL logic in the component.
 */
export interface RsvpFormValues {
  name: string;
  /** Raw `<input type="number">` value, kept as a string so an empty or
   * non-numeric field is representable without coercing to `0`/`NaN`
   * silently before validation runs. */
  guestCountRaw: string;
  note: string;
}

export type RsvpValidationError = "name-required" | "guest-count-invalid" | null;

function parseGuestCount(raw: string): number {
  return Number(raw.trim());
}

/**
 * Validates the required fields (name, guest count). `note` is always
 * optional (spec `whatsapp-rsvp` — "Client-Side Required-Field Validation").
 */
export function validateRsvpForm(
  values: RsvpFormValues,
  maxGuests: number,
): RsvpValidationError {
  if (values.name.trim().length === 0) {
    return "name-required";
  }

  const guestCount = parseGuestCount(values.guestCountRaw);
  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > maxGuests
  ) {
    return "guest-count-invalid";
  }

  return null;
}

/**
 * Builds the `wa.me` href for a valid form, or `null` when required fields
 * are missing/invalid — the caller (`RsvpForm`) never opens a link in that
 * case. Derived during render, not inside an effect
 * (`rerender-derived-state-no-effect`).
 */
export function buildRsvpWhatsAppHref(
  values: RsvpFormValues,
  maxGuests: number,
  template: RsvpMessageTemplate,
  coupleLabel: string,
  phoneNumber: string,
): string | null {
  if (validateRsvpForm(values, maxGuests) !== null) {
    return null;
  }

  const guestCount = parseGuestCount(values.guestCountRaw);
  const trimmedNote = values.note.trim();
  const message = composeRsvpMessage(
    {
      name: values.name.trim(),
      guestCount,
      note: trimmedNote.length > 0 ? values.note : undefined,
    },
    template,
    coupleLabel,
  );

  return buildWhatsAppUrl(phoneNumber, message);
}
