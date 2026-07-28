import { describe, expect, it } from "vitest";
import type { RsvpMessageTemplate } from "@/config/invitation.types";
import {
  buildRsvpWhatsAppHref,
  validateRsvpForm,
  type RsvpFormValues,
} from "@/lib/rsvp-form";

const template: RsvpMessageTemplate = {
  greeting: "¡Hola! Confirmo mi asistencia a la boda de {couple}.",
  nameLine: "Nombre: {name}",
  guestsLineSingular: "Asistiré solo(a).",
  guestsLinePlural: "Asistiremos {count} personas en total.",
  noteLine: "Nota: {note}",
};

const coupleLabel = "Ana & Luis";
const phoneNumber = "+51 999 999 999";
const maxGuests = 10;

describe("validateRsvpForm", () => {
  it("1. rejects a blank name", () => {
    const values: RsvpFormValues = { name: "", guestCountRaw: "2", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBe("name-required");
  });

  it("2. rejects a whitespace-only name", () => {
    const values: RsvpFormValues = { name: "   ", guestCountRaw: "2", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBe("name-required");
  });

  it("3. rejects an empty guest-count field", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBe("guest-count-invalid");
  });

  it("4. rejects a non-numeric guest-count field", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "abc", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBe("guest-count-invalid");
  });

  it("5. rejects a guest count below 1", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "0", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBe("guest-count-invalid");
  });

  it("6. rejects a guest count above maxGuests", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "11", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBe("guest-count-invalid");
  });

  it("7. rejects a non-integer guest count", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "2.5", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBe("guest-count-invalid");
  });

  it("8. accepts a valid form with an optional note", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "2", note: "Vamos con niños" };
    expect(validateRsvpForm(values, maxGuests)).toBeNull();
  });

  it("9. accepts a valid form with no note", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "1", note: "" };
    expect(validateRsvpForm(values, maxGuests)).toBeNull();
  });
});

describe("buildRsvpWhatsAppHref", () => {
  it("10. returns null when the name is blank", () => {
    const values: RsvpFormValues = { name: "", guestCountRaw: "2", note: "" };
    expect(
      buildRsvpWhatsAppHref(values, maxGuests, template, coupleLabel, phoneNumber),
    ).toBeNull();
  });

  it("11. returns null when the guest count is invalid", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "0", note: "" };
    expect(
      buildRsvpWhatsAppHref(values, maxGuests, template, coupleLabel, phoneNumber),
    ).toBeNull();
  });

  it("12. builds the exact wa.me URL for a valid form, trimming the name", () => {
    const values: RsvpFormValues = { name: "  Ana Torres  ", guestCountRaw: "1", note: "" };
    const href = buildRsvpWhatsAppHref(
      values,
      maxGuests,
      template,
      coupleLabel,
      phoneNumber,
    );
    expect(href).toMatch(/^https:\/\/wa\.me\/51999999999\?text=.+$/);
    const decoded = decodeURIComponent(href!.split("?text=")[1]);
    expect(decoded).toContain("Nombre: Ana Torres");
    expect(decoded).toContain("Asistiré solo(a).");
  });

  it("13. uses the plural line with the exact guest count for guestCount > 1", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "3", note: "" };
    const href = buildRsvpWhatsAppHref(
      values,
      maxGuests,
      template,
      coupleLabel,
      phoneNumber,
    );
    const decoded = decodeURIComponent(href!.split("?text=")[1]);
    expect(decoded).toContain("Asistiremos 3 personas en total.");
  });

  it("14. omits the note line when the note is blank", () => {
    const values: RsvpFormValues = { name: "Ana", guestCountRaw: "1", note: "   " };
    const href = buildRsvpWhatsAppHref(
      values,
      maxGuests,
      template,
      coupleLabel,
      phoneNumber,
    );
    const decoded = decodeURIComponent(href!.split("?text=")[1]);
    expect(decoded).not.toContain("Nota:");
  });

  it("15. includes the note line, correctly percent-encoded, when present", () => {
    const values: RsvpFormValues = {
      name: "Ana",
      guestCountRaw: "1",
      note: "Vamos con niños & abuela #familia",
    };
    const href = buildRsvpWhatsAppHref(
      values,
      maxGuests,
      template,
      coupleLabel,
      phoneNumber,
    );
    expect(href).toContain("%26");
    expect(href).toContain("%23");
    const decoded = decodeURIComponent(href!.split("?text=")[1]);
    expect(decoded).toContain("Nota: Vamos con niños & abuela #familia");
  });
});
