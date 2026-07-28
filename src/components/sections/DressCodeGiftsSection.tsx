import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Section 6 of 7: dress code note + gift/bank-account rows, combined into
 * one section per spec (`invitation-sections` — "Dress code+Gifts").
 * `dressCode.eyebrow`/`scriptWord` drive the section's single `h2` via
 * `SectionHeading`; the Gifts sub-block gets its own `h3` (not counted
 * toward the "one `h2` per section" total).
 *
 * The account number is always rendered as visible plain text (spec
 * `gift-account-copy` — "Account Number Always Visible as Plain Text").
 * The copy button next to it is a static, inert placeholder — Phase 6b
 * swaps it for the real `CopyAccountButton` client island.
 */
export function DressCodeGiftsSection() {
  const { dressCode, gifts } = invitationConfig;

  return (
    <section
      id="dress-code-gifts"
      aria-labelledby="dress-code-gifts-heading"
      className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-gutter py-section text-center lg:max-w-3xl lg:gap-14"
    >
      <SectionHeading
        id="dress-code-gifts-heading"
        eyebrow={dressCode.eyebrow}
        heading={dressCode.scriptWord}
      />

      <div className="flex max-w-prose flex-col items-center gap-3">
        <p className="font-caps text-sm uppercase tracking-caps text-ink">
          {dressCode.label}
        </p>
        <p className="font-serif text-body lg:text-lg">{dressCode.note}</p>
        {dressCode.avoidColors.length > 0 ? (
          <ul className="flex flex-wrap justify-center gap-2">
            {dressCode.avoidColors.map((color) => (
              <li
                key={color}
                className="rounded-full border border-rule/60 px-3 py-1 font-serif text-sm text-body"
              >
                {color}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <h3 className="font-caps text-sm uppercase tracking-caps text-ink">
          {gifts.eyebrow}
        </h3>
        <p className="font-script text-2xl text-ink lg:text-3xl">
          {gifts.scriptWord}
        </p>
        <p className="max-w-prose font-serif text-body lg:text-lg">
          {gifts.paragraph}
        </p>

        <div className="flex w-full flex-col gap-4 lg:max-w-md">
          {gifts.accounts.map((account) => (
            <div
              key={`${account.bank}-${account.accountNumber}`}
              className="flex flex-col items-center gap-2 rounded-card border border-rule/60 p-6 lg:p-8"
            >
              <p className="font-caps text-sm uppercase tracking-caps text-ink">
                {account.bank}
              </p>
              {account.holder ? (
                <p className="font-serif text-body">{account.holder}</p>
              ) : null}
              <p className="font-serif text-lg tabular-nums text-ink">
                {account.accountNumber}
              </p>
              {account.cci ? (
                <p className="font-serif text-sm tabular-nums text-body">
                  CCI: {account.cci}
                </p>
              ) : null}
              {account.currency ? (
                <p className="font-serif text-sm text-body">
                  {account.currency}
                </p>
              ) : null}

              {/*
                Static placeholder for the copy affordance. Phase 6b swaps
                this for the real `CopyAccountButton` client island
                (`navigator.clipboard` + select-and-copy fallback +
                "Copiado" confirmation). Intentionally inert until then.

                Fix (Defect 3): interactive button, raised from
                `text-eyebrow` (13px) to `text-sm` (14px) with an explicit
                `min-h-11` (44px) tap target.
              */}
              <button
                type="button"
                aria-disabled="true"
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-body px-5 py-1.5 font-caps text-sm uppercase tracking-eyebrow text-body"
              >
                {gifts.copyLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
