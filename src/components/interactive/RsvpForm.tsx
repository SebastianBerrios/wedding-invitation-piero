"use client";

import { useId, useState } from "react";
import { invitationConfig } from "@/config/invitation";
import {
  buildRsvpWhatsAppHref,
  validateRsvpForm,
  type RsvpFormValues,
} from "@/lib/rsvp-form";

/**
 * Client island (design §7, work unit 6b). Controlled inputs; the `wa.me`
 * href is derived during render (`rerender-derived-state-no-effect`) via the
 * pure `lib/rsvp-form.ts` helpers, which themselves reuse `lib/whatsapp.ts` —
 * no message/URL logic is reimplemented here.
 *
 * A real `<a href>` is rendered (not `window.open`) per design §7: in-app
 * webviews (WhatsApp/Instagram) handle anchor navigation to `wa.me` far more
 * reliably than a programmatic popup, and the link stays inspectable.
 */
export function RsvpForm() {
  const { rsvp, whatsapp, couple } = invitationConfig;
  const nameId = useId();
  const guestCountId = useId();
  const noteId = useId();
  const errorId = useId();

  const [name, setName] = useState("");
  const [guestCountRaw, setGuestCountRaw] = useState("1");
  const [note, setNote] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const values: RsvpFormValues = { name, guestCountRaw, note };
  const coupleLabel = `${couple.brideFirstName} & ${couple.groomFirstName}`;
  const error = validateRsvpForm(values, rsvp.maxGuests);
  const href = buildRsvpWhatsAppHref(
    values,
    rsvp.maxGuests,
    rsvp.messageTemplate,
    coupleLabel,
    whatsapp.number,
  );

  const errorMessage =
    error === "name-required"
      ? rsvp.nameRequiredHint
      : error === "guest-count-invalid"
        ? rsvp.guestCountInvalidHint
        : null;

  // Only associate/announce the error once the guest has actually tried to
  // submit — an empty required field is not yet "invalid" before that.
  const showError = attemptedSubmit && errorMessage !== null;
  const nameInvalid = showError && error === "name-required";
  const guestCountInvalid = showError && error === "guest-count-invalid";

  const handleSubmitClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href) {
      event.preventDefault();
      setAttemptedSubmit(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 text-left">
      <label htmlFor={nameId} className="flex flex-col gap-1">
        <span className="font-caps text-sm uppercase tracking-caps text-ink">
          {rsvp.nameLabel}
        </span>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={rsvp.namePlaceholder}
          aria-invalid={nameInvalid ? "true" : undefined}
          aria-describedby={nameInvalid ? errorId : undefined}
          className="min-h-11 rounded-card border border-body bg-transparent px-3 py-2 font-serif text-body placeholder:text-body/60"
        />
      </label>

      <label htmlFor={guestCountId} className="flex flex-col gap-1">
        <span className="font-caps text-sm uppercase tracking-caps text-ink">
          {rsvp.guestCountLabel}
        </span>
        <input
          id={guestCountId}
          type="number"
          min={1}
          max={rsvp.maxGuests}
          value={guestCountRaw}
          onChange={(event) => setGuestCountRaw(event.target.value)}
          aria-invalid={guestCountInvalid ? "true" : undefined}
          aria-describedby={guestCountInvalid ? errorId : undefined}
          className="min-h-11 rounded-card border border-body bg-transparent px-3 py-2 font-serif text-body"
        />
      </label>

      <label htmlFor={noteId} className="flex flex-col gap-1">
        <span className="font-caps text-sm uppercase tracking-caps text-ink">
          {rsvp.noteLabel}
        </span>
        <textarea
          id={noteId}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={rsvp.notePlaceholder}
          rows={3}
          className="min-h-11 rounded-card border border-body bg-transparent px-3 py-2 font-serif text-body placeholder:text-body/60"
        />
      </label>

      <a
        href={href ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={href ? undefined : "true"}
        onClick={handleSubmitClick}
        className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-body px-6 py-2.5 font-caps uppercase tracking-eyebrow text-body"
      >
        {rsvp.submitLabel}
      </a>

      {showError ? (
        <p id={errorId} role="alert" className="font-serif text-sm text-body">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
