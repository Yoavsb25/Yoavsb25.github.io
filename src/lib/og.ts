/**
 * Open Graph images, rendered at build (ADR-0015): satori lays out the card as
 * SVG with the site fonts, sharp rasterizes it to PNG.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import satori from "satori";
import sharp from "sharp";

import { ogSize } from "@/lib/seo";
import { emphasisParts } from "@/lib/text";

/** Light-theme values from src/styles/tokens.css (satori cannot read CSS variables). */
const color = {
  ground: "#f5f6f3",
  ink: "#16191d",
  ink2: "#4b535b",
  line: "#dfe4de",
  accent: "#0e7a5a",
  accentInk: "#ffffff",
} as const;

export type OgCard = {
  /** Small label above the title, e.g. "Case study · SysAid · 2025". */
  label: string;
  /** Title; `*word*` is drawn in the accent color. */
  title: string;
  /** Footer line, e.g. "Yoav Sborovsky · AI Engineer · London". */
  footer: string;
  /** Monogram in the corner mark, e.g. "YS". */
  initials: string;
};

interface Node {
  type: string;
  props: { style?: Record<string, unknown>; children?: unknown };
}

const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
): Node => ({ type, props: { style, children } });

/** The card as a satori element tree. Pure, so it can be tested without rendering. */
export function ogElement(card: OgCard): Node {
  const long = card.title.length > 60;
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      background: color.ground,
      color: color.ink,
      fontFamily: "Instrument Sans",
    },
    [
      el("div", { display: "flex", alignItems: "center", gap: 20 }, [
        el(
          "div",
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 999,
            background: color.accent,
            color: color.accentInk,
            fontSize: 26,
            fontWeight: 600,
          },
          card.initials,
        ),
        el(
          "div",
          {
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: color.accent,
          },
          card.label,
        ),
      ]),
      el(
        "div",
        {
          display: "flex",
          flexWrap: "wrap",
          fontFamily: "Source Serif 4",
          fontSize: long ? 64 : 84,
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
        },
        emphasisParts(card.title).map((part) =>
          el(
            "span",
            { color: part.em ? color.accent : color.ink, whiteSpace: "pre" },
            part.text,
          ),
        ),
      ),
      el(
        "div",
        {
          display: "flex",
          paddingTop: 28,
          borderTop: `2px solid ${color.line}`,
          fontSize: 28,
          color: color.ink2,
        },
        card.footer,
      ),
    ],
  );
}

const fontDir = join(process.cwd(), "src/assets/og");
let fonts: Promise<Parameters<typeof satori>[1]["fonts"]> | undefined;

function loadFonts() {
  const font = async (file: string, name: string, weight: 400 | 600) => ({
    name,
    data: await readFile(join(fontDir, file)),
    weight,
    style: "normal" as const,
  });
  fonts ??= Promise.all([
    font("source-serif-4-400.woff", "Source Serif 4", 400),
    font("instrument-sans-400.woff", "Instrument Sans", 400),
    font("instrument-sans-600.woff", "Instrument Sans", 600),
  ]);
  return fonts;
}

/** Renders the card to a 1200×630 PNG. */
export async function renderOg(card: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(ogElement(card), {
    ...ogSize,
    fonts: await loadFonts(),
  });
  return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
}
