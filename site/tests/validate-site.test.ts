import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

const tempPaths: string[] = [];

async function makeTempDir(prefix: string) {
  const directory = await mkdtemp(path.join(tmpdir(), prefix));
  tempPaths.push(directory);
  return directory;
}

async function writeFixtureFile(filePath: string, contents: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
}

async function createBuiltSiteFixture({
  files,
  knownIssues = [],
}: {
  files: Record<string, string>;
  knownIssues?: Array<{ kind: string; source: string; target: string }>;
}) {
  const rootDir = await makeTempDir("task-6-validate-site-");
  const distDir = path.join(rootDir, "dist");
  const knownIssuesFile = path.join(rootDir, "content-known-issues.json");

  const defaultFiles: Record<string, string> = {
    "index.html": "<!doctype html><a href=\"/guides/\">Guides</a>",
    "guides/index.html": "<!doctype html><p>Guides</p>",
    "draw/index.html": "<!doctype html><title>draw</title>",
    "drops/orbit-sketch/index.html": "<!doctype html><title>drop</title>",
  };

  for (const [relativePath, contents] of Object.entries({ ...defaultFiles, ...files })) {
    await writeFixtureFile(path.join(distDir, relativePath), contents);
  }

  await writeFixtureFile(knownIssuesFile, `${JSON.stringify(knownIssues, null, 2)}\n`);

  return { distDir, knownIssuesFile };
}

async function loadValidationModule() {
  return import(
    `${pathToFileURL(path.resolve("scripts/validate-site.mjs")).href}?t=${Date.now()}-${Math.random()}`
  );
}

afterEach(async () => {
  await Promise.all(
    tempPaths.splice(0).map((entry) => rm(entry, { force: true, recursive: true })),
  );
});

describe("validate-site", () => {
  test("reports duplicate normalized HTML routes", async () => {
    const {
      __testOnly: { collectValidationReport },
    } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({
      files: {
        "guides.html": "<!doctype html><p>duplicate</p>",
      },
    });

    const report = await collectValidationReport(fixture);

    expect(report.failures).toEqual(
      expect.arrayContaining([expect.stringMatching(/Duplicate normalized route "\/guides\/"/)]),
    );
  });

  test("reports broken relative links after normalizing query strings and fragments", async () => {
    const {
      __testOnly: { collectValidationReport },
    } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({
      files: {
        "guides/topic/index.html":
          "<!doctype html><a href=\"./missing?from=nav#summary\">Missing</a>",
      },
    });

    const report = await collectValidationReport(fixture);

    expect(report.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Broken internal link in "/guides/topic/"'),
        expect.stringContaining("/guides/topic/missing/"),
      ]),
    );
  });

  test("rejects relative paths that escape outside dist", async () => {
    const {
      __testOnly: { collectValidationReport },
    } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({
      files: {
        "guides/topic/index.html": "<!doctype html><a href=\"../../../secret.txt\">Escape</a>",
      },
    });

    const report = await collectValidationReport(fixture);

    expect(report.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('escapes dist in "/guides/topic/"'),
        expect.stringContaining("../../../secret.txt"),
      ]),
    );
  });

  test("reports missing local image and srcset references", async () => {
    const {
      __testOnly: { collectValidationReport },
    } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({
      files: {
        "guides/topic/index.html": [
          "<!doctype html>",
          '<img src="/images/missing.png" alt="missing" />',
          '<source srcset="/images/existing.png 1x, ./missing-2x.png?cache=1 2x" />',
          "",
        ].join("\n"),
        "images/existing.png": "ok",
      },
    });

    const report = await collectValidationReport(fixture);

    expect(report.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/images/missing.png"),
        expect.stringContaining("/guides/topic/missing-2x.png"),
      ]),
    );
  });

  test("ignores external, fragment-only, and javascript-free non-local URLs", async () => {
    const { validateSite } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({
      files: {
        "guides/topic/index.html": [
          "<!doctype html>",
          '<a href="https://example.com/docs">External</a>',
          '<a href="//cdn.example.com/library.js">CDN</a>',
          '<a href="mailto:test@example.com">Mail</a>',
          '<a href="tel:+61000000000">Phone</a>',
          '<a href="#summary">Fragment</a>',
          '<img src="data:image/png;base64,abc123" alt="Inline" />',
          '<script src="https://cdn.example.com/app.js"></script>',
          "",
        ].join("\n"),
      },
    });

    await expect(validateSite(fixture)).resolves.toMatchObject({
      checkedPages: expect.any(Number),
      failureCount: 0,
    });
  });

  test("allowlists only the exact known issue and still reports new failures", async () => {
    const {
      __testOnly: { collectValidationReport },
    } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({
      knownIssues: [{ kind: "stale-link", source: "guides/topic.md", target: "./missing.md" }],
      files: {
        "guides/topic/index.html": [
          "<!doctype html>",
          '<a href="../missing/">Allowlisted</a>',
          '<a href="./fresh-break/">Fresh break</a>',
          "",
        ].join("\n"),
      },
    });

    const report = await collectValidationReport(fixture);

    expect(report.allowlistedFailures).toHaveLength(1);
    expect(report.failures).toEqual([
      expect.stringContaining("/guides/topic/fresh-break/"),
    ]);
  });

  test("requires draw and drops artifacts with actionable failures", async () => {
    const {
      __testOnly: { collectValidationReport },
    } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({ files: {} });

    await rm(path.join(fixture.distDir, "draw"), { force: true, recursive: true });
    await rm(path.join(fixture.distDir, "drops"), { force: true, recursive: true });

    const report = await collectValidationReport(fixture);

    expect(report.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Missing required artifact "/draw/"'),
        expect.stringContaining('Missing required artifact "/drops/"'),
      ]),
    );
  });

  test("accepts directory indexes and trailing-slash variants for local pages and assets", async () => {
    const { validateSite } = await loadValidationModule();
    const fixture = await createBuiltSiteFixture({
      files: {
        "guides/topic/index.html": [
          "<!doctype html>",
          '<a href="/guides">Section</a>',
          '<a href="../topic">Self</a>',
          '<a href="../topic/index.html#summary">Index</a>',
          '<img src="../images/diagram.png?cache=1" alt="Diagram" />',
          '<source srcset="../images/diagram.png 1x, /images/diagram@2x.png 2x" />',
          "",
        ].join("\n"),
        "guides/images/diagram.png": "diagram",
        "images/diagram@2x.png": "diagram-2x",
      },
    });

    await expect(validateSite(fixture)).resolves.toMatchObject({
      failureCount: 0,
    });
  });
});
