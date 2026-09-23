import { site } from "@/config/site";

/**
 * Prefixes a root-relative path with the deploy base (ADR-0010), so "/#contact"
 * becomes "/portfolio/#contact" on a project page. Fragments, relative paths, and
 * external URLs are returned unchanged.
 */
export function withBase(path: string, base: string = site.base): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return base.replace(/\/$/, "") + path;
}
