import { site } from "../config/site.ts";

/** Builds a page title in the form "Page | Site", or the site title for the home page. */
export function pageTitle(page?: string): string {
  return page ? `${page} | ${site.name}` : site.title;
}
