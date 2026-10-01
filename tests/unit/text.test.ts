import { describe, expect, it } from "vitest";

import { emphasisParts, plainText, sentences, splitFirst } from "@/lib/text";

describe("emphasisParts", () => {
  it("splits out *emphasized* words", () => {
    expect(emphasisParts("Then I *ship* them.")).toEqual([
      { text: "Then I ", em: false },
      { text: "ship", em: true },
      { text: " them.", em: false },
    ]);
  });

  it("returns plain text as one part", () => {
    expect(emphasisParts("No emphasis")).toEqual([
      { text: "No emphasis", em: false },
    ]);
  });

  it("leaves a lone or empty marker alone", () => {
    expect(plainText("5 * 3 and **")).toBe("5 * 3 and **");
  });
});

describe("emphasisParts edge cases", () => {
  it("emphasizes a single character", () => {
    expect(emphasisParts("Plan *a* now")).toEqual([
      { text: "Plan ", em: false },
      { text: "a", em: true },
      { text: " now", em: false },
    ]);
  });

  it("returns no empty parts when emphasis is the whole text", () => {
    expect(emphasisParts("*ship*")).toEqual([{ text: "ship", em: true }]);
  });
});

describe("plainText", () => {
  it("drops emphasis markers", () => {
    expect(plainText("Need an AI engineer who *ships*?")).toBe(
      "Need an AI engineer who ships?",
    );
  });
});

describe("sentences", () => {
  it("splits after sentence punctuation", () => {
    expect(sentences("I plan AI systems. Then I *ship* them.")).toEqual([
      "I plan AI systems.",
      "Then I *ship* them.",
    ]);
  });

  it("keeps a single sentence whole", () => {
    expect(sentences("Need an AI engineer who *ships*?")).toEqual([
      "Need an AI engineer who *ships*?",
    ]);
  });
});

describe("sentences edge cases", () => {
  it("treats any run of whitespace as one break", () => {
    expect(sentences("One.  Two.\n\nThree.")).toEqual([
      "One.",
      "Two.",
      "Three.",
    ]);
  });

  it("returns nothing for empty text", () => {
    expect(sentences("")).toEqual([]);
  });
});

describe("splitFirst", () => {
  it("splits at the first separator only", () => {
    expect(splitFirst("Automation Engineer · at SysAid · London")).toEqual([
      "Automation Engineer",
      "at SysAid · London",
    ]);
  });

  it("returns the whole text when there is no separator", () => {
    expect(splitFirst("Engineer")).toEqual(["Engineer", ""]);
  });
});
