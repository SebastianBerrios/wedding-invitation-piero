import { describe, expect, it } from "vitest";
import {
  buildWhatsAppUrl,
  composeRsvpMessage,
  normalizePhone,
} from "@/lib/whatsapp";
import type { RsvpMessageTemplate } from "@/config/invitation.types";

const template: RsvpMessageTemplate = {
  greeting: "¡Hola! Confirmo mi asistencia a la boda de {couple}.",
  nameLine: "Nombre: {name}",
  guestsLineSingular: "Asistiré solo(a).",
  guestsLinePlural: "Asistiremos {count} personas en total.",
  noteLine: "Nota: {note}",
};

describe("normalizePhone", () => {
  it("1. strips a leading + and internal spaces", () => {
    expect(normalizePhone("+51 999 999 999")).toBe("51999999999");
  });

  it("2. drops a leading '00' IDD prefix and strips dashes", () => {
    expect(normalizePhone("0051-999-999-999")).toBe("51999999999");
  });

  it("3. strips parentheses and dots", () => {
    expect(normalizePhone("(51) 999.999.999")).toBe("51999999999");
  });

  it("4. throws for a number shorter than 8 digits and longer than 15 (E.164 bounds)", () => {
    expect(() => normalizePhone("999")).toThrow();
    expect(() => normalizePhone("1".repeat(16))).toThrow();
  });

  it("5. throws for an empty string", () => {
    expect(() => normalizePhone("")).toThrow();
  });
});

describe("composeRsvpMessage", () => {
  it("6. substitutes {couple} in the greeting and {name} in the name line", () => {
    const message = composeRsvpMessage(
      { name: "Ana Torres", guestCount: 1 },
      template,
      "Ana & Luis",
    );
    expect(message).toContain("Ana & Luis");
    expect(message).toContain("Nombre: Ana Torres");
  });

  it("7. uses the singular line for guestCount === 1 and the plural line with {count} otherwise", () => {
    const singular = composeRsvpMessage(
      { name: "Ana", guestCount: 1 },
      template,
      "Ana & Luis",
    );
    expect(singular).toContain("Asistiré solo(a).");

    const plural = composeRsvpMessage(
      { name: "Ana", guestCount: 3 },
      template,
      "Ana & Luis",
    );
    expect(plural).toContain("Asistiremos 3 personas en total.");
  });

  it("8. omits the note line and any trailing blank line when note is absent or blank", () => {
    const noNote = composeRsvpMessage(
      { name: "Ana", guestCount: 1 },
      template,
      "Ana & Luis",
    );
    expect(noNote).not.toContain("Nota:");
    expect(noNote.endsWith("\n")).toBe(false);

    const blankNote = composeRsvpMessage(
      { name: "Ana", guestCount: 1, note: "   " },
      template,
      "Ana & Luis",
    );
    expect(blankNote).not.toContain("Nota:");
  });

  it("9. appends exactly one note line when note is present", () => {
    const message = composeRsvpMessage(
      { name: "Ana", guestCount: 1, note: "Soy vegetariana" },
      template,
      "Ana & Luis",
    );
    const noteOccurrences = message.split("Nota:").length - 1;
    expect(noteOccurrences).toBe(1);
    expect(message).toContain("Nota: Soy vegetariana");
  });
});

describe("buildWhatsAppUrl", () => {
  it("10. percent-encodes accented characters", () => {
    const url = buildWhatsAppUrl("+51 999 999 999", "José Muñoz");
    expect(url).toContain("Jos%C3%A9%20Mu%C3%B1oz");
  });

  it("11. encodes newlines as %0A and never emits %0D", () => {
    const url = buildWhatsAppUrl("+51 999 999 999", "line1\nline2");
    expect(url).toContain("line1%0Aline2");
    expect(url).not.toContain("%0D");
  });

  it("12. encodes '&' as %26 and produces exactly one '?' in the URL", () => {
    const url = buildWhatsAppUrl("+51 999 999 999", "Marta & Juan");
    expect(url).toContain("Marta%20%26%20Juan");
    expect(url.split("?").length - 1).toBe(1);
  });

  it("13. encodes '#' as %23", () => {
    const url = buildWhatsAppUrl("+51 999 999 999", "#boda2026");
    expect(url).toContain("%23boda2026");
  });

  it("14. encodes an emoji as its UTF-8 percent-encoded bytes", () => {
    const url = buildWhatsAppUrl("+51 999 999 999", "\u{1F48D}");
    expect(url).toContain("%F0%9F%92%8D");
  });

  it("15. never encodes a space as '+'", () => {
    const url = buildWhatsAppUrl("+51 999 999 999", "a b");
    expect(url).not.toContain("+");
    expect(url).toContain("a%20b");
  });

  it("16. never double-encodes plain input (no stray %25)", () => {
    const url = buildWhatsAppUrl("+51 999 999 999", "hola mundo");
    expect(url).not.toContain("%25");
  });

  it("17. builds the full expected URL shape", () => {
    expect(buildWhatsAppUrl("+51 999 999 999", "hola")).toBe(
      "https://wa.me/51999999999?text=hola",
    );
  });
});
