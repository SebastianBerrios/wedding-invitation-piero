import { describe, expect, it } from "vitest";
import type { InvitationConfig } from "@/config/invitation.types";
import {
  validateInvitationConfig,
  findPlaceholders,
} from "@/config/invitation.validate";

/**
 * A fully valid, non-placeholder fixture. Each test mutates a single field
 * via structuredClone to break exactly one invariant at a time (design §11).
 */
const validConfig: InvitationConfig = {
  meta: {
    title: "Ana & Luis — Nuestra boda",
    description: "Acompáñanos a celebrar nuestra boda el 26 de diciembre de 2026.",
    locale: "es_PE",
    siteName: "Ana & Luis",
  },
  couple: {
    brideFirstName: "Ana",
    brideFullName: "Ana Torres",
    groomFirstName: "Luis",
    groomFullName: "Luis Ramírez",
    monogram: "AL",
  },
  event: {
    isoInstant: "2026-12-26T11:00:00-05:00",
    timeZoneLabel: "America/Lima",
    display: {
      day: "26",
      month: "DICIEMBRE",
      year: "2026",
      weekday: "SÁBADO",
      time: "11:00 am",
    },
  },
  hero: {
    eyebrow: "NUESTRA BODA",
    ampersand: "&",
    songPrompt: "Reproduce nuestra canción",
    scrollHint: "Desliza para ver la invitación",
  },
  letter: {
    heading: "Nuestra Historia",
    paragraphs: ["Con el corazón lleno de alegría."],
    countdownHeading: "Faltan",
    countdownReachedLabel: "¡Ya llegó el gran día!",
    unitLabels: { days: "Días", hours: "Horas", minutes: "Minutos", seconds: "Segundos" },
  },
  family: {
    blessingLine: "Con la bendición de Dios y nuestros padres",
    groups: [
      { title: "Padres de la Novia", names: ["María Torres", "Carlos Torres"] },
      { title: "Padres del Novio", names: ["Rosa Ramírez", "Jorge Ramírez"] },
    ],
  },
  venues: {
    ceremony: {
      kind: "ceremony",
      label: "CEREMONIA RELIGIOSA",
      name: "Iglesia San José",
      address: "Av. Principal 123, Lima",
      mapUrl: "https://maps.google.com/?q=Iglesia+San+Jose",
      mapLinkLabel: "Ver ubicación",
      time: "11:00 am",
    },
    reception: {
      kind: "reception",
      label: "RECEPCIÓN",
      name: "Jardines del Sol",
      address: "Av. Secundaria 456, Lima",
      mapUrl: "https://maps.google.com/?q=Jardines+del+Sol",
      mapLinkLabel: "Ver ubicación",
      time: "1:30 pm",
    },
  },
  itinerary: {
    heading: "Itinerario",
    rows: [
      { time: "11:00 am", label: "Ceremonia religiosa", icon: "ceremony" },
      { time: "1:30 pm", label: "Cóctel de bienvenida", icon: "cocktail" },
    ],
  },
  eventDetails: {
    heading: "Ceremonia y Recepción",
  },
  dressCode: {
    eyebrow: "CÓDIGO DE VESTIMENTA",
    scriptWord: "Elegante",
    label: "ELEGANTE",
    note: "Agradecemos evitar el color blanco.",
    avoidColors: ["Blanco"],
  },
  gifts: {
    eyebrow: "REGALOS",
    scriptWord: "Detalles",
    paragraph: "Tu presencia es nuestro mejor regalo.",
    accounts: [
      {
        bank: "Banco de Crédito",
        accountNumber: "194-1234567-0-12",
        cci: "002-194-001234567012-34",
        holder: "Ana Torres",
        currency: "PEN",
      },
    ],
    copyLabel: "Copiar número de cuenta",
    copiedLabel: "Copiado",
    copyFailedLabel: "No se pudo copiar",
  },
  rsvp: {
    heading: "Confirma tu asistencia",
    scriptWord: "RSVP",
    paragraph: "Por favor confirma tu asistencia antes del 01 de diciembre de 2026.",
    nameLabel: "Nombre completo",
    namePlaceholder: "Escribe tu nombre",
    guestCountLabel: "Número de invitados",
    noteLabel: "Nota (opcional)",
    notePlaceholder: "Alguna alergia o comentario",
    submitLabel: "Confirmar por WhatsApp",
    maxGuests: 10,
    messageTemplate: {
      greeting: "¡Hola! Confirmo mi asistencia a la boda de {couple}.",
      nameLine: "Nombre: {name}",
      guestsLineSingular: "Asistiré solo(a).",
      guestsLinePlural: "Asistiremos {count} personas en total.",
      noteLine: "Nota: {note}",
    },
  },
  whatsapp: {
    displayNumber: "+51 987 654 321",
    number: "+51 987 654 321",
  },
  audio: {
    src: "/audio/song.mp3",
    title: "Nuestra canción",
    playLabel: "Reproducir canción",
    pauseLabel: "Pausar canción",
    errorLabel: "No se pudo reproducir la canción",
  },
};

function clone(): InvitationConfig {
  return structuredClone(validConfig);
}

describe("validateInvitationConfig", () => {
  it("returns no errors for a fully valid config", () => {
    expect(validateInvitationConfig(validConfig)).toEqual([]);
  });

  it("1. rejects a blank couple name after trim", () => {
    const config = clone();
    config.couple.brideFirstName = "   ";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "couple.brideFirstName")).toBe(true);
  });

  it("2. rejects a monogram that is not 2-3 uppercase letters", () => {
    const config = clone();
    config.couple.monogram = "al";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "couple.monogram")).toBe(true);
  });

  it("2b. accepts a monogram with Spanish accented uppercase letters", () => {
    const config = clone();
    config.couple.monogram = "ÑÁ";
    expect(validateInvitationConfig(config)).toEqual([]);
  });

  it("3. rejects an offset-less ISO instant (the timezone-bug guard)", () => {
    const config = clone();
    config.event.isoInstant = "2026-12-26T11:00:00";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "event.isoInstant")).toBe(true);
  });

  it("3b. rejects an unparseable ISO instant", () => {
    const config = clone();
    config.event.isoInstant = "not-a-date";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "event.isoInstant")).toBe(true);
  });

  it("4. rejects a blank event display field", () => {
    const config = clone();
    config.event.display.weekday = "";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "event.display.weekday")).toBe(true);
  });

  it("5. rejects a malformed WhatsApp number (too short)", () => {
    const config = clone();
    config.whatsapp.number = "999";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "whatsapp.number")).toBe(true);
  });

  it("5b. rejects a WhatsApp number exceeding E.164 length", () => {
    const config = clone();
    config.whatsapp.number = "1".repeat(16);
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "whatsapp.number")).toBe(true);
  });

  it("6. rejects an empty family groups array", () => {
    const config = clone();
    config.family = { ...config.family, groups: [] };
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "family.groups")).toBe(true);
  });

  it("6b. rejects a family group with a blank name", () => {
    const config = clone();
    config.family.groups[0].names[0] = "  ";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "family.groups[0].names[0]")).toBe(true);
  });

  it("7. rejects a venue with a non-https mapUrl", () => {
    const config = clone();
    config.venues.ceremony.mapUrl = "http://maps.google.com/?q=x";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "venues.ceremony.mapUrl")).toBe(true);
  });

  it("7b. rejects a venue with an unparseable mapUrl", () => {
    const config = clone();
    config.venues.reception.mapUrl = "not a url";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "venues.reception.mapUrl")).toBe(true);
  });

  it("8. rejects an empty itinerary rows array", () => {
    const config = clone();
    config.itinerary = { ...config.itinerary, rows: [] };
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "itinerary.rows")).toBe(true);
  });

  it("8b. rejects an itinerary row with an unknown icon", () => {
    const config = clone();
    // @ts-expect-error - intentionally invalid icon to test the validator
    config.itinerary.rows[0].icon = "fireworks";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "itinerary.rows[0].icon")).toBe(true);
  });

  it("9. rejects an empty gifts accounts array", () => {
    const config = clone();
    config.gifts = { ...config.gifts, accounts: [] };
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "gifts.accounts")).toBe(true);
  });

  it("9b. rejects a malformed account number", () => {
    const config = clone();
    config.gifts.accounts[0].accountNumber = "abc";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "gifts.accounts[0].accountNumber")).toBe(true);
  });

  it("9c. rejects a malformed CCI when present", () => {
    const config = clone();
    config.gifts.accounts[0].cci = "123";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "gifts.accounts[0].cci")).toBe(true);
  });

  it("10. rejects a blank dress code label", () => {
    const config = clone();
    config.dressCode.label = "";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "dressCode.label")).toBe(true);
  });

  it("10b. rejects a blank entry in avoidColors, but allows an empty array", () => {
    const config = clone();
    config.dressCode.avoidColors = [""];
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "dressCode.avoidColors[0]")).toBe(true);

    const emptyList = clone();
    emptyList.dressCode.avoidColors = [];
    expect(validateInvitationConfig(emptyList)).toEqual([]);
  });

  it("11. rejects a maxGuests outside 1-20 or non-integer", () => {
    const tooLow = clone();
    tooLow.rsvp.maxGuests = 0;
    expect(validateInvitationConfig(tooLow).some((e) => e.path === "rsvp.maxGuests")).toBe(true);

    const tooHigh = clone();
    tooHigh.rsvp.maxGuests = 21;
    expect(validateInvitationConfig(tooHigh).some((e) => e.path === "rsvp.maxGuests")).toBe(true);

    const notInteger = clone();
    notInteger.rsvp.maxGuests = 3.5;
    expect(validateInvitationConfig(notInteger).some((e) => e.path === "rsvp.maxGuests")).toBe(true);
  });

  it("12. rejects a message template missing its required placeholder token", () => {
    const config = clone();
    config.rsvp.messageTemplate.greeting = "¡Hola! Confirmo mi asistencia.";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "rsvp.messageTemplate.greeting")).toBe(true);
  });

  it("12b. rejects guestsLinePlural missing {count}", () => {
    const config = clone();
    config.rsvp.messageTemplate.guestsLinePlural = "Asistiremos todos.";
    const errors = validateInvitationConfig(config);
    expect(
      errors.some((e) => e.path === "rsvp.messageTemplate.guestsLinePlural"),
    ).toBe(true);
  });

  it("13. rejects an audio src with a disallowed extension", () => {
    const config = clone();
    config.audio.src = "/audio/song.wav";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "audio.src")).toBe(true);
  });

  it("13b. rejects an audio src that is not root-relative", () => {
    const config = clone();
    config.audio.src = "audio/song.mp3";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "audio.src")).toBe(true);
  });

  it("15. rejects a blank letter heading", () => {
    const config = clone();
    config.letter.heading = "   ";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "letter.heading")).toBe(true);
  });

  it("16. rejects a blank eventDetails heading", () => {
    const config = clone();
    config.eventDetails.heading = "";
    const errors = validateInvitationConfig(config);
    expect(errors.some((e) => e.path === "eventDetails.heading")).toBe(true);
  });

  it("14. rejects a blank meta title and an overlong meta description", () => {
    const blankTitle = clone();
    blankTitle.meta.title = "";
    expect(validateInvitationConfig(blankTitle).some((e) => e.path === "meta.title")).toBe(true);

    const longDescription = clone();
    longDescription.meta.description = "a".repeat(161);
    expect(
      validateInvitationConfig(longDescription).some((e) => e.path === "meta.description"),
    ).toBe(true);
  });
});

describe("findPlaceholders", () => {
  it("flags known placeholder sentinels anywhere in the config", () => {
    const config = clone();
    config.couple.brideFirstName = "NOMBRE_NOVIA";
    config.whatsapp.number = "+51 999 999 999";
    config.gifts.accounts[0].bank = "BANCO_1";

    const errors = findPlaceholders(config);
    const paths = errors.map((e) => e.path);
    expect(paths).toContain("couple.brideFirstName");
    expect(paths).toContain("whatsapp.number");
    expect(paths).toContain("gifts.accounts[0].bank");
  });

  it("returns no errors for a config with no placeholder sentinels", () => {
    expect(findPlaceholders(validConfig)).toEqual([]);
  });
});
