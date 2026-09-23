/** Small text helpers shared by pages, SEO, and Open Graph images. */

/** `*word*` as in Markdown: the emphasized text cannot start or end with a space. */
const EMPHASIS = /(\*[^*\s](?:[^*]*[^*\s])?\*)/;

/** Splits "Then I *ship* them." into plain and emphasized parts. */
export function emphasisParts(text: string): { text: string; em: boolean }[] {
  return text
    .split(EMPHASIS)
    .filter(Boolean)
    .map((part) =>
      EMPHASIS.test(part)
        ? { text: part.slice(1, -1), em: true }
        : { text: part, em: false },
    );
}

/** Removes emphasis markers: "Then I *ship* them." → "Then I ship them.". */
export function plainText(text: string): string {
  return emphasisParts(text)
    .map((p) => p.text)
    .join("");
}

/** Splits text into sentences, e.g. a headline into its display lines. */
export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/** Splits at the first separator: "Engineer · at SysAid · London" → ["Engineer", "at SysAid · London"]. */
export function splitFirst(text: string, separator = " · "): [string, string] {
  const i = text.indexOf(separator);
  return i === -1
    ? [text, ""]
    : [text.slice(0, i), text.slice(i + separator.length)];
}
