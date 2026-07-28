import type { RsvpMessageTemplate } from "@/config/invitation.types";

/**
 * Pure phone normalization, message composition, and `wa.me` URL building
 * (design §7). Never uses `URLSearchParams` (encodes space as `+`, which
 * WhatsApp renders literally) or `encodeURI` (leaves `#`/`&` unencoded) —
 * always `encodeURIComponent` over the whole message, exactly once.
 */

export interface RsvpInput {
  name: string;
  guestCount: number;
  note?: string;
}

const MIN_E164_DIGITS = 8;
const MAX_E164_DIGITS = 15;

/**
 * Strips everything but digits, drops a leading "00" IDD prefix, and
 * enforces E.164 length bounds (8-15 digits). Throws outside those bounds.
 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length < MIN_E164_DIGITS || digits.length > MAX_E164_DIGITS) {
    throw new Error(
      `normalizePhone: "${raw}" must normalize to between ${MIN_E164_DIGITS} and ${MAX_E164_DIGITS} digits`,
    );
  }
  return digits;
}

/**
 * Renders the RSVP message template into plain text. Lines are joined with
 * `\n`; the note line is included only when a non-blank note is given, and
 * no trailing blank line is ever produced.
 */
export function composeRsvpMessage(
  input: RsvpInput,
  template: RsvpMessageTemplate,
  coupleLabel: string,
): string {
  const lines: string[] = [
    template.greeting.replace("{couple}", coupleLabel),
    template.nameLine.replace("{name}", input.name),
    input.guestCount === 1
      ? template.guestsLineSingular
      : template.guestsLinePlural.replace("{count}", String(input.guestCount)),
  ];

  if (input.note !== undefined && input.note.trim().length > 0) {
    lines.push(template.noteLine.replace("{note}", input.note));
  }

  return lines.join("\n");
}

/**
 * Builds a `wa.me` deep link. The whole message is percent-encoded exactly
 * once via `encodeURIComponent`, so `#`, `&`, `\n`, accents, and emoji all
 * survive intact and no character is silently double-encoded.
 */
export function buildWhatsAppUrl(rawPhone: string, message: string): string {
  const digits = normalizePhone(rawPhone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
