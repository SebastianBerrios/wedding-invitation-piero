import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Separator } from "@/components/decor/Separator";
import { OptionalPhoto } from "@/components/ui/OptionalPhoto";
import { CopyAccountButton } from "@/components/interactive/CopyAccountButton";
import { joinWithConjunction } from "@/lib/list-format";

/**
 * Section 6 of 7 — cream ground. Dress code and Gifts are two blocks in the
 * reference but one section here, because the seven-section order is fixed by
 * spec (`invitation-sections` — "Dress code+Gifts"). Each block gets the
 * reference's two-line heading treatment; only the LEVEL differs (`h2` for the
 * section, `h3` for the sub-block), which is what keeps the 1x h1 + 7x h2 outline
 * intact.
 *
 * ## What changed
 *
 * The dress-code avoid-colours were a row of gold-bordered pill chips. The
 * reference writes them as a sentence, so they are now joined by
 * `joinWithConjunction` using `dressCode.avoidColorsConjunction` from config —
 * the array is variable-length, so the join is real logic and is unit-tested.
 *
 * The bank accounts were bordered cards with the bank name, holder, number, CCI
 * and currency stacked inside. The reference prints them as plain centred text:
 * bank name in small caps, number beneath. So the border is gone and the
 * secondary fields (holder, CCI, currency) are quieter, but they are all still
 * rendered — dropping data the couple entered to match a mock would be a
 * regression, and a guest making a transfer needs the CCI.
 *
 * `CopyAccountButton` stays. The reference has no copy affordance, but the spec
 * capability `gift-account-copy` requires one, and the account number is still
 * visible plain text either way ("Account Number Always Visible as Plain Text").
 */
export function DressCodeGiftsSection() {
  const { dressCode, gifts } = invitationConfig;
  const avoidColorsLine = joinWithConjunction(
    dressCode.avoidColors,
    dressCode.avoidColorsConjunction,
  );

  return (
    <section
      id="dress-code-gifts"
      aria-labelledby="dress-code-gifts-heading"
      className="bg-surface"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-gutter py-section text-center lg:max-w-3xl lg:gap-12">
        <Separator />

        <SectionHeading
          id="dress-code-gifts-heading"
          eyebrow={dressCode.eyebrow}
          heading={dressCode.scriptWord}
        />

        <div className="flex max-w-prose flex-col items-center gap-3">
          <p className="font-caps text-base uppercase tracking-caps text-ink">
            {dressCode.label}
          </p>
          <p className="font-serif leading-relaxed text-body lg:text-lg">
            {dressCode.note}
          </p>
          {avoidColorsLine ? (
            <p className="font-serif leading-relaxed text-body lg:text-lg">
              {avoidColorsLine}
            </p>
          ) : null}
        </div>

        <OptionalPhoto photo={dressCode.photo} variant="interlude" />

        {/*
          The reference draws a rule between these two blocks as well as above the
          first and below the last, which is what stops one long cream section
          reading as a single list. Three rules, exactly as in the reference.
        */}
        <Separator />

        <SectionHeading
          as="h3"
          eyebrow={gifts.eyebrow}
          heading={gifts.scriptWord}
        />

        <p className="max-w-prose font-serif leading-relaxed text-body lg:text-lg">
          {gifts.paragraph}
        </p>

        <div className="flex w-full flex-col items-center gap-8">
          {gifts.accounts.map((account) => (
            <div
              key={`${account.bank}-${account.accountNumber}`}
              className="flex flex-col items-center gap-1"
            >
              <p className="font-caps text-base uppercase tracking-caps text-ink">
                {account.bank}
              </p>
              <p className="font-serif text-lg tabular-nums text-ink">
                {account.accountNumber}
              </p>
              {account.cci ? (
                <p className="font-serif text-sm tabular-nums text-body">
                  CCI: {account.cci}
                </p>
              ) : null}
              {account.holder ? (
                <p className="font-serif text-sm text-body">{account.holder}</p>
              ) : null}
              {account.currency ? (
                <p className="font-serif text-sm text-body">
                  {account.currency}
                </p>
              ) : null}

              <CopyAccountButton accountNumber={account.accountNumber} />
            </div>
          ))}
        </div>

        <OptionalPhoto photo={gifts.photo} variant="interlude" />

        <Separator />
      </div>
    </section>
  );
}
