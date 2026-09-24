---
title: Files Unifier
kicker: Client project
summary: A desktop tool, sold to a leading law firm, that turns a spreadsheet into merged, ready-to-send PDFs.
tags: [Automation, Python, Desktop app]
outcome: Built and sold to Goldfarb Gross Seligman, now used internally for document workflows.
meta:
  role: Solo, sold to client
  timeline: "2026"
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
  - figure: Daily
    label: use at a top Israeli law firm
  - figure: 300+
    label: merged PDFs created
  - figure: 30 sec
    label: to merge 130 pages
order: 3
cover:
  src: ./cover.png
  alt: "The PDF Batch Merger desktop app: fields for the serial numbers column, the instructions spreadsheet, and the source and output folders, a Run Merge button, and a detailed log panel."
---
