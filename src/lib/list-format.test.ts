import { describe, expect, it } from "vitest";
import { joinWithConjunction } from "@/lib/list-format";

/**
 * The dress-code section renders `dressCode.avoidColors` as one readable
 * sentence rather than as a row of bordered chips (the reference shows a
 * sentence). The array is variable-length by design, so the join is real
 * logic: no separator for one item, only the conjunction for two, and commas
 * plus a final conjunction for three or more.
 *
 * The conjunction word itself is Spanish guest-facing copy, so it arrives as a
 * parameter from `invitationConfig` — this module never hardcodes it.
 */
describe("joinWithConjunction", () => {
  it("returns the single item unchanged, with no conjunction", () => {
    expect(joinWithConjunction(["Blanco"], "y")).toBe("Blanco");
  });

  it("joins exactly two items with the conjunction and no comma", () => {
    expect(joinWithConjunction(["Blanco", "Marfil"], "y")).toBe(
      "Blanco y Marfil",
    );
  });

  it("joins three items with commas and a final conjunction", () => {
    expect(joinWithConjunction(["Blanco", "Marfil", "Verde olivo"], "y")).toBe(
      "Blanco, Marfil y Verde olivo",
    );
  });

  it("joins four items with commas and a final conjunction", () => {
    expect(joinWithConjunction(["Uno", "Dos", "Tres", "Cuatro"], "y")).toBe(
      "Uno, Dos, Tres y Cuatro",
    );
  });

  it("returns an empty string for an empty list", () => {
    // `avoidColors` is allowed to be empty by the validator, and the section
    // must render nothing rather than a stray conjunction.
    expect(joinWithConjunction([], "y")).toBe("");
  });

  it("uses the supplied conjunction verbatim, never a hardcoded one", () => {
    expect(joinWithConjunction(["Blanco", "Marfil", "Beige"], "e")).toBe(
      "Blanco, Marfil e Beige",
    );
  });
});
