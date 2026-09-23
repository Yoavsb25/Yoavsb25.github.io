/**
 * Facts that code depends on (URLs, contact, identity). The only place they live:
 * content files hold prose, this file holds facts (ADR-0005).
 * Change `url` to switch domains.
 */
export const site = {
  url: "https://yoavsb25.github.io",
  /** Path the site is served under: "/" from the user-site repo (ADR-0017); a project page would use "/<repo>" (ADR-0010). */
  base: "/",
  name: "Yoav Sborovsky",
  initials: "YS",
  jobTitle: "AI Engineer",
  title: "Yoav Sborovsky — AI Engineer",
  description:
    "AI engineer who takes products from idea to production: planned, built, tested, and shipped.",
  location: "London",
  email: "Yoavsb25@gmail.com",
  cvPath: "/yoav-sborovsky-cv.pdf",
  socials: {
    github: "https://github.com/Yoavsb25",
    linkedin: "https://www.linkedin.com/in/yoav-sborovsky-5a85b41a1/",
  },
} as const;

/** Primary navigation: in-page sections of the home page. */
export const nav = [
  { label: "How I work", href: "/#how" },
  { label: "Projects", href: "/#projects" },
  { label: "Resume", href: "/#resume" },
] as const;
