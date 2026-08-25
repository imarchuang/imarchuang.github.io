import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

const fixtureRoot = path.resolve("tests/fixtures/docs");
const tempPaths: string[] = [];

async function makeTempDir(prefix: string) {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));
  tempPaths.push(dir);
  return dir;
}

async function loadMigrationModule() {
  return import(
    `${pathToFileURL(path.resolve("scripts/migrate-content.mjs")).href}?t=${Date.now()}-${Math.random()}`
  );
}

afterEach(async () => {
  await Promise.all(
    tempPaths.splice(0).map((entry) => rm(entry, { force: true, recursive: true })),
  );
});

describe("migrate-content", () => {
  test("exports deterministic helper behavior", async () => {
    const { EXCLUDED, normalizeLegacyLinks, routeFor } = await loadMigrationModule();

    expect([...EXCLUDED]).toEqual([
      "_coverpage.md",
      "_navbar.md",
      "_sidebar.md",
      "_my404.md",
    ]);

    expect(routeFor("README.md")).toBe("");
    expect(routeFor("guides/index.md")).toBe("guides");
    expect(routeFor("guides/nested/page.md")).toBe("guides/nested/page");

    expect(
      normalizeLegacyLinks(
        [
          "[Docsify](/#/guides/getting-started.md)",
          "[Relative](./nested/page.md#details)",
          "[Draw](/draw/ ':ignore')",
          "[Drop](/drops/demo/ ':ignore')",
        ].join("\n"),
      ),
    ).toContain("[Docsify](/guides/getting-started/)");
    expect(
      normalizeLegacyLinks("[Relative](./nested/page.md#details)"),
    ).toContain("[Relative](./nested/page/#details)");
    expect(normalizeLegacyLinks("[Draw](/draw/ ':ignore')")).toContain("[Draw](/draw/)");
    expect(normalizeLegacyLinks("[Drop](/drops/demo/ ':ignore')")).toContain(
      "[Drop](/drops/demo/)",
    );
  });

  test("migrates fixture docs, rewrites links with source context, and records stale links", async () => {
    const { migrateContent } = await loadMigrationModule();
    const sourceDir = path.join(fixtureRoot, "basic");
    const workspaceDir = await makeTempDir("task-2-basic-");
    const notesDir = path.join(workspaceDir, "notes");
    const navigationFile = path.join(workspaceDir, "navigation.json");
    const knownIssuesFile = path.join(workspaceDir, "content-known-issues.json");

    const result = await migrateContent({
      sourceDir,
      notesDir,
      navigationFile,
      knownIssuesFile,
    });

    expect(result.migratedCount).toBe(4);
    expect(result.excludedCount).toBe(6);
    expect(result.navigation).toEqual([
      {
        title: "Home",
        href: "/",
        items: [],
      },
      {
        title: "Guides",
        href: "/guides/",
        items: [
          {
            title: "Getting Started",
            href: "/guides/getting-started/",
            children: [
              {
                title: "Deep Dive",
                href: "/guides/nested/child/",
                children: [],
              },
            ],
          },
        ],
      },
      {
        title: "Sketch",
        href: "/draw/",
        items: [],
      },
    ]);

    const homeNote = await readFile(path.join(notesDir, "index.md"), "utf8");
    const guideIndex = await readFile(path.join(notesDir, "guides", "index.md"), "utf8");
    const gettingStarted = await readFile(
      path.join(notesDir, "guides", "getting-started.md"),
      "utf8",
    );

    expect(homeNote).toContain('title: "Fixture Home"');
    expect(homeNote).toContain('legacyPath: "#/README"');
    expect(homeNote).not.toContain("# Fixture Home");

    expect(guideIndex).toContain('title: "Guides Home"');
    expect(gettingStarted).toContain("[deep dive](/guides/nested/child/#details)");
    expect(gettingStarted).toContain("[home](/)");
    expect(gettingStarted).toContain("[sketch](/draw/)");
    expect(gettingStarted).toContain("[drop](/drops/demo/)");
    expect(gettingStarted).toContain("[missing](./missing.md)");

    await expect(readFile(path.join(notesDir, "_sidebar.md"), "utf8")).rejects.toThrow();
    await expect(readFile(path.join(notesDir, "draw", "skip.md"), "utf8")).rejects.toThrow();
    await expect(readFile(path.join(notesDir, "drops", "demo.md"), "utf8")).rejects.toThrow();
    await expect(
      readFile(path.join(notesDir, "superpowers", "spec.md"), "utf8"),
    ).rejects.toThrow();

    const navigationJson = JSON.parse(await readFile(navigationFile, "utf8"));
    expect(navigationJson).toEqual(result.navigation);

    const issues = JSON.parse(await readFile(knownIssuesFile, "utf8"));
    expect(issues).toEqual([
      {
        kind: "stale-link",
        source: "guides/getting-started.md",
        target: "./missing.md",
      },
      {
        kind: "stale-sidebar-link",
        source: "_sidebar.md",
        target: "./missing",
      },
    ]);
  });

  test("fails with a path-specific error when two files map to the same generated slug", async () => {
    const { migrateContent } = await loadMigrationModule();
    const sourceDir = path.join(fixtureRoot, "duplicates");
    const workspaceDir = await makeTempDir("task-2-duplicates-");

    await expect(
      migrateContent({
        sourceDir,
        notesDir: path.join(workspaceDir, "notes"),
        navigationFile: path.join(workspaceDir, "navigation.json"),
        knownIssuesFile: path.join(workspaceDir, "content-known-issues.json"),
      }),
    ).rejects.toThrow(
      /Duplicate generated slug "guides\/intro" from "guides\/intro\.md" and "guides\/intro\/index\.md"/,
    );
  });

  test("supports CLI execution with explicit paths", async () => {
    const { runCli } = await loadMigrationModule();
    const sourceDir = path.join(fixtureRoot, "basic");
    const workspaceDir = await makeTempDir("task-2-cli-");
    const notesDir = path.join(workspaceDir, "notes");
    const navigationFile = path.join(workspaceDir, "navigation.json");
    const knownIssuesFile = path.join(workspaceDir, "content-known-issues.json");

    await expect(
      runCli({
        sourceDir,
        notesDir,
        navigationFile,
        knownIssuesFile,
      }),
    ).resolves.toMatchObject({
      migratedCount: 4,
      excludedCount: 6,
    });

    const guide = await readFile(path.join(notesDir, "guides", "getting-started.md"), "utf8");
    expect(guide).toContain("[deep dive](/guides/nested/child/#details)");
  });
});
