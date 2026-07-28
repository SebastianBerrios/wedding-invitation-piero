import type { InvitationConfig } from "@/config/invitation.types";

/**
 * The single source of truth for all invitation content (design §2/§11).
 *
 * Every value below is an OBVIOUS placeholder — sentinel tokens like
 * `NOMBRE_NOVIA`, `999 999 999`, `BANCO_1` — so nothing fake can ever ship
 * as if it were real content. Replacing every placeholder is tracked as a
 * launch-blocking checklist item (see tasks.md "Blocked-on-User-Input").
 */
export const invitationConfig = {
  meta: {
    title: "NOMBRE_NOVIA & NOMBRE_NOVIO — Nuestra boda",
    description:
      "Acompáñanos a celebrar el amor de NOMBRE_NOVIA y NOMBRE_NOVIO el 26 de diciembre de 2026.",
    locale: "es_PE",
    siteName: "NOMBRE_NOVIA & NOMBRE_NOVIO",
  },
  couple: {
    brideFirstName: "NOMBRE_NOVIA",
    brideFullName: "NOMBRE_NOVIA APELLIDOS",
    groomFirstName: "NOMBRE_NOVIO",
    groomFullName: "NOMBRE_NOVIO APELLIDOS",
    monogram: "NN",
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
    paragraphs: [
      "Con el corazón lleno de alegría, queremos que seas parte del día más importante de nuestras vidas.",
      "Tu presencia hará que esta celebración sea aún más especial. Te esperamos para brindar juntos por este nuevo comienzo.",
    ],
    countdownHeading: "Faltan",
    countdownReachedLabel: "¡Ya llegó el gran día!",
    unitLabels: {
      days: "Días",
      hours: "Horas",
      minutes: "Minutos",
      seconds: "Segundos",
    },
  },
  family: {
    blessingLine: "Con la bendición de Dios y nuestros padres",
    groups: [
      {
        title: "Padres de la Novia",
        names: ["NOMBRE_MADRE_NOVIA", "NOMBRE_PADRE_NOVIA"],
      },
      {
        title: "Padres del Novio",
        names: ["NOMBRE_MADRE_NOVIO", "NOMBRE_PADRE_NOVIO"],
      },
      {
        title: "Padrinos",
        names: ["NOMBRE_PADRINO", "NOMBRE_MADRINA"],
      },
    ],
  },
  venues: {
    ceremony: {
      kind: "ceremony",
      label: "CEREMONIA RELIGIOSA",
      name: "IGLESIA_NOMBRE",
      address: "DIRECCION_IGLESIA, CIUDAD_PLACEHOLDER",
      mapUrl: "https://maps.google.com/?q=IGLESIA_NOMBRE",
      mapLinkLabel: "Ver ubicación",
      time: "11:00 am",
    },
    reception: {
      kind: "reception",
      label: "RECEPCIÓN",
      name: "LOCAL_RECEPCION_NOMBRE",
      address: "DIRECCION_RECEPCION, CIUDAD_PLACEHOLDER",
      mapUrl: "https://maps.google.com/?q=LOCAL_RECEPCION_NOMBRE",
      mapLinkLabel: "Ver ubicación",
      time: "1:30 pm",
    },
  },
  itinerary: {
    heading: "Itinerario",
    rows: [
      { time: "11:00 am", label: "Ceremonia religiosa", icon: "ceremony" },
      { time: "1:30 pm", label: "Cóctel de bienvenida", icon: "cocktail" },
      { time: "4:00 pm", label: "Almuerzo", icon: "dinner" },
      { time: "5:00 pm", label: "Brindis y baile", icon: "dance" },
    ],
  },
  dressCode: {
    eyebrow: "CÓDIGO DE VESTIMENTA",
    scriptWord: "Elegante",
    label: "ELEGANTE",
    note: "Agradecemos evitar los siguientes colores, reservados para la novia y sus damas:",
    avoidColors: ["Blanco", "Marfil", "Beige claro"],
  },
  gifts: {
    eyebrow: "REGALOS",
    scriptWord: "Detalles",
    paragraph:
      "Tu presencia es nuestro mejor regalo. Si deseas tener un detalle con nosotros, dejamos nuestros datos bancarios.",
    accounts: [
      {
        bank: "BANCO_1",
        accountNumber: "000-0000000-0-00",
        cci: "000-000-000000000000-00",
        holder: "NOMBRE_TITULAR",
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
    paragraph:
      "Por favor confirma tu asistencia antes del 01 de diciembre de 2026 para poder organizar todo con cariño.",
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
    displayNumber: "+51 999 999 999",
    number: "+51 999 999 999",
  },
  audio: {
    src: "/audio/song.mp3",
    title: "Nuestra canción",
    playLabel: "Reproducir canción",
    pauseLabel: "Pausar canción",
    errorLabel: "No se pudo reproducir la canción",
  },
} satisfies InvitationConfig;
