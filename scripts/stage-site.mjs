/**
 * Copies dist/ to _site/<base>/ so static checks (Lighthouse CI, lychee) see the
 * same URL layout as GitHub Pages, where the site lives under its base path (ADR-0010).
 */
import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";

import { site } from "../src/config/site.ts";

const out = "_site";
rmSync(out, { recursive: true, force: true });
cpSync("dist", join(out, site.base), { recursive: true });
console.log(`Staged dist/ at ${out}${site.base}/`);
