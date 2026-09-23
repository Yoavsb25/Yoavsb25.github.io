---
title: Files Unifier
kicker: Client project
summary: A desktop tool, sold to a leading law firm, that turns a spreadsheet into merged, ready-to-send PDFs.
tags: [Automation, Python, Desktop app]
outcome: Built and sold to Goldfarb Gross Seligman, now used internally for document workflows.
meta:
  role: Solo, sold to client
  # TODO(confirm): timeline.
  stack: [Python, GitHub Actions]
  links:
    - label: GitHub
      href: https://github.com/Yoavsb25/files-unifier
problem: Staff were assembling large batches of documents by hand, a slow and repetitive task where mistakes were costly.
built:
  - "A desktop app: choose a spreadsheet, get merged PDFs."
  - Built-in logging and licensing so the firm can run it safely.
  - Automated tests and a one-file installer.
approach: I designed it as a simple pipeline of small steps, each tested on its own, so it stays reliable as the firm's needs change.
results:
  - figure: Sold
    label: to a leading law firm
  - figure: "1"
    label: step from spreadsheet to merged PDFs
  - figure: "1"
    label: file installer, no setup needed
order: 3
---
