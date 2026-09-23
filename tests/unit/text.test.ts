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
