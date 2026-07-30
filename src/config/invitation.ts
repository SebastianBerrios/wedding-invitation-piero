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
    title: "Cielo & Piero — Nuestra boda",
    description:
      "Acompáñanos a celebrar el amor de Cielo y Piero el 10 de octubre de 2026.",
    locale: "es_PE",
    siteName: "Cielo & Piero",
  },
  couple: {
    brideFirstName: "Cielo",
    brideFullName: "Cielo Sologuren Rosales",
    groomFirstName: "Piero",
    groomFullName: "Piero Berríos Gómez",
    monogram: "PC",
  },
  event: {
    isoInstant: "2026-10-10T13:30:00-05:00",
    timeZoneLabel: "America/Lima",
    display: {
      day: "10",
      month: "OCTUBRE",
      year: "2026",
      weekday: "SÁBADO",
      time: "1:30 pm",
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
    paragraphs: [
      "Con el corazón lleno de alegría, queremos que seas parte del día más importante de nuestras vidas.",
      "Tu presencia hará que esta celebración sea aún más especial. Te esperamos para brindar juntos por este nuevo comienzo.",
    ],
    countdownHeading: "Faltan",
    countdownReachedHeading: "¡Hoy!",
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
        names: ["Andrés Sologuren", "Erika Rosales"],
      },
      {
        title: "Padres del Novio",
        names: ["Humberto Berríos", "Gabriela Gómez"],
      },
      {
        title: "Padrinos",
        names: ["Salvador Cerpa", "Marilú Berríos"],
      },
    ],
  },
  venues: {
    ceremony: {
      kind: "ceremony",
      label: "MATRIMONIO RELIGIOSO",
      name: "Parroquia Nuestra Señora de la Paz",
      address: "Buganvillas B-27",
      mapUrl:
        "https://maps.google.com/?q=Parroquia+Nuestra+Se%C3%B1ora+de+la+Paz+Buganvillas+B-27",
      mapLinkLabel: "Ver ubicación",
      time: "1:30 pm",
    },
    // The second venue is the CIVIL ceremony, not a reception. The object key
    // stays `reception` because it is the structural second-venue slot the
    // Event Details section renders; `kind` and `label` carry the real meaning.
    reception: {
      kind: "civil",
      label: "MATRIMONIO CIVIL",
      name: "Majestic",
      address: "Gregorio Albarracín 402",
      mapUrl:
        "https://maps.google.com/?q=Majestic+Gregorio+Albarrac%C3%ADn+402",
      mapLinkLabel: "Ver ubicación",
      time: "4:00 pm",
    },
  },
  itinerary: {
    heading: "Itinerario",
    rows: [
      {
        time: "1:30 pm",
        label: "Parroquia Nuestra Señora de La Paz",
        icon: "ceremony",
      },
      { time: "4:00 pm", label: "Matrimonio Civil", icon: "ceremony" },
      { time: "6:00 pm", label: "Cóctel y cena", icon: "cocktail" },
      { time: "7:00 pm", label: "¡A bailar! 💃", icon: "dance" },
      { time: "11:00 pm", label: "Fin de la fiesta" },
    ],
  },
  eventDetails: {
    heading: "Ceremonia y Celebración",
  },
  dressCode: {
    eyebrow: "CÓDIGO DE VESTIMENTA",
    scriptWord: "Elegante",
    label: "ELEGANTE",
    note: "Agradecemos evitar los siguientes colores, reservados para la novia y sus damas:",
    avoidColors: ["Blanco", "Marfil"],
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
      "Por favor confirma tu asistencia antes del 10 de septiembre de 2026 para poder organizar todo con cariño.",
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
    nameRequiredHint: "Por favor escribe tu nombre para continuar.",
    guestCountInvalidHint: "Ingresa un número de invitados válido.",
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
