import { describe, expect, it } from "vitest";

import {
  actualScreenshots,
  pickRun,
  reportZip,
} from "../../scripts/lib/report.mjs";

const attachment = (name: string, path: string) => ({
  name,
  path,
  contentType: "image/png",
});

describe("reportZip", () => {
  it("decodes the embedded zip", () => {
    const html = `<script>window.playwrightReportBase64 = "data:application/zip;base64,UEsFBg==";</script>`;
    expect(reportZip(html)).toEqual(Buffer.from("UEsFBg==", "base64"));
  });

  it("throws when the page is not a Playwright report", () => {
    expect(() => reportZip("<html></html>")).toThrow(/Playwright HTML report/);
  });
});

describe("actualScreenshots", () => {
  const doc = {
    fileId: "abc",
    tests: [
      {
        projectName: "light",
        duration: 1200, // numbers and other non-objects sit next to attachments
        results: [
          {
            attachments: [
              attachment("home-6-site-footer-expected.png", "data/aa.png"),
              attachment("home-6-site-footer-actual.png", "data/bb.png"),
              attachment("home-6-site-footer-diff.png", "data/cc.png"),
            ],
          },
        ],
      },
      {
        projectName: "iphone",
        results: [
          {
            attachments: [
              attachment("home-3-projects-actual.png", "data/dd.png"),
            ],
          },
        ],
      },
    ],
  };

  it("maps each actual image to its baseline, per project", () => {
    expect(actualScreenshots([doc])).toEqual([
      { project: "iphone", file: "home-3-projects.png", source: "data/dd.png" },
      {
        project: "light",
        file: "home-6-site-footer.png",
        source: "data/bb.png",
      },
    ]);
  });

  it("keeps the last attempt when a test ran twice", () => {
    const retried = {
      tests: [
        {
          projectName: "dark",
          results: [
            { attachments: [attachment("a-actual.png", "data/01.png")] },
            { attachments: [attachment("a-actual.png", "data/02.png")] },
          ],
        },
      ],
    };
    expect(actualScreenshots([retried])).toEqual([
      { project: "dark", file: "a.png", source: "data/02.png" },
    ]);
  });

  it("returns nothing when no screenshot failed", () => {
    const axeOnly = {
      tests: [
        {
          projectName: "light",
          results: [
            {
              attachments: [
                {
                  name: "trace",
                  path: "data/t.zip",
                  contentType: "application/zip",
                },
              ],
            },
          ],
        },
      ],
    };
    expect(actualScreenshots([axeOnly])).toEqual([]);
  });

  it("skips names and paths that could escape the screenshots folder", () => {
    const hostile = {
      tests: [
        {
          projectName: "../light",
          results: [
            { attachments: [attachment("x-actual.png", "data/ab.png")] },
          ],
        },
        {
          projectName: "light",
          results: [
            {
              attachments: [
                attachment("../x-actual.png", "data/ab.png"),
                attachment("y..-actual.png", "data/ab.png"),
                attachment("y-actual.png", "../../etc/ab.png"),
                attachment("z-actual.png", "/tmp/ab.png"),
              ],
            },
          ],
        },
      ],
    };
    expect(actualScreenshots([hostile])).toEqual([]);
  });
});

describe("pickRun", () => {
  const sha = "0c9275e1234567890abcdef1234567890abcdef1";
  const run = (over: object) => ({
    databaseId: 7,
    headSha: sha,
    status: "completed",
    conclusion: "failure",
    ...over,
  });

  it("picks the failed run for this commit", () => {
    expect(pickRun([run({ headSha: "other" }), run({})], sha)).toEqual({
      id: 7,
    });
  });

  it("refuses when CI has not run this commit", () => {
    expect(pickRun([run({ headSha: "other" })], sha)).toEqual({
      error: expect.stringMatching(/No CI run for 0c9275e/),
    });
  });

  it("refuses while the run is in progress", () => {
    expect(pickRun([run({ status: "in_progress" })], sha)).toEqual({
      error: expect.stringMatching(/still in_progress/),
    });
  });

  it("refuses when the run passed", () => {
    expect(pickRun([run({ conclusion: "success" })], sha)).toEqual({
      error: expect.stringMatching(/ended in success/),
    });
  });
});
