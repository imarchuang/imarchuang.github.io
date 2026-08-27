import { mkdtemp, mkdir, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

const fixtureRoot = path.resolve("tests/fixtures/docs");
const realDocsRoot = path.resolve("../docs");
const tempPaths: string[] = [];
const execFileAsync = promisify(execFile);

async function makeTempDir(prefix: string) {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));
  tempPaths.push(dir);
  return dir;
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(absolutePath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(absolutePath);
    }
  }

  return files;
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
    const { EXCLUDED, normalizeLegacyLinks, parseGitDateHistory, routeFor } =
      await loadMigrationModule();

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

    const dates = parseGitDateHistory(
      [
        "\x1e2026-08-27T08:30:00+08:00",
        "",
        "M\tdocs/guides/intro.md",
        "A\tdocs/guides/other.md",
        "\x1e2024-03-02T10:00:00+08:00",
        "",
        "R100\tdocs/guides/original.md\tdocs/guides/intro.md",
        "\x1e2023-01-12T09:00:00+08:00",
        "",
        "A\tdocs/guides/original.md",
      ].join("\n"),
      "docs",
    );
    expect(Object.fromEntries(dates)).toEqual({
      "guides/intro.md": {
        createdDate: "2023-01-12",
        updatedDate: "2026-08-27",
      },
      "guides/other.md": {
        createdDate: "2026-08-27",
        updatedDate: "2026-08-27",
      },
    });
  });

  test("rejects shallow repositories instead of emitting inaccurate creation dates", async () => {
    const { migrateContent } = await loadMigrationModule();
    const workspaceDir = await makeTempDir("note-dates-shallow-");
    const originDir = path.join(workspaceDir, "origin");
    const shallowDir = path.join(workspaceDir, "shallow");
    await execFileAsync("git", ["init", originDir]);
    await mkdir(path.join(originDir, "docs"), { recursive: true });
    await writeFile(path.join(originDir, "docs", "README.md"), "# History\n", "utf8");
    await execFileAsync("git", ["-C", originDir, "add", "docs/README.md"]);
    await execFileAsync(
      "git",
      [
        "-C",
        originDir,
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@example.com",
        "commit",
        "-m",
        "add history",
      ],
      {
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: "2024-01-02T10:00:00Z",
          GIT_COMMITTER_DATE: "2024-01-02T10:00:00Z",
        },
      },
    );
    await writeFile(
      path.join(originDir, "docs", "README.md"),
      "# History\n\nUpdated.\n",
      "utf8",
    );
    await execFileAsync("git", ["-C", originDir, "add", "docs/README.md"]);
    await execFileAsync(
      "git",
      [
        "-C",
        originDir,
        "-c",
        "user.name=Fixture",
        "-c",
        "user.email=fixture@example.com",
        "commit",
        "-m",
        "update history",
      ],
      {
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: "2025-02-03T10:00:00Z",
          GIT_COMMITTER_DATE: "2025-02-03T10:00:00Z",
        },
      },
    );
    await execFileAsync("git", [
      "clone",
      "--depth=1",
      `file://${originDir}`,
      shallowDir,
    ]);

    await expect(
      migrateContent({
        sourceDir: path.join(shallowDir, "docs"),
        notesDir: path.join(workspaceDir, "output", "notes"),
        navigationFile: path.join(workspaceDir, "output", "navigation.json"),
        knownIssuesFile: path.join(workspaceDir, "output", "content-known-issues.json"),
      }),
    ).rejects.toThrow(/shallow Git clone/u);
  });

  test("migrates fixture docs, rewrites links with source context, and collapses duplicate sidebar aliases", async () => {
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

    expect(result.migratedCount).toBe(6);
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
          {
            title: "Advanced",
            href: "/guides/advanced/",
            children: [
              {
                title: "FAQ",
                href: "/guides/faq/",
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
    expect(homeNote).toMatch(/createdDate: "\d{4}-\d{2}-\d{2}"/u);
    expect(homeNote).toMatch(/updatedDate: "\d{4}-\d{2}-\d{2}"/u);
    expect(homeNote).not.toContain("# Fixture Home");

    expect(guideIndex).toContain('title: "Guides Home"');
    expect(gettingStarted).toContain("[deep dive](/guides/nested/child/#details)");
    expect(gettingStarted).toContain(
      "[overview](/guides/advanced/#%E4%B8%AD%E6%96%87%20%E6%A0%87%E9%A2%98)",
    );
    expect(gettingStarted).toContain("[home](/)");
    expect(gettingStarted).toContain("[sketch](/draw/)");
    expect(gettingStarted).toContain("[drop](/drops/demo/)");
    expect(gettingStarted).toContain("[missing](/guides/missing/)");

    await expect(readFile(path.join(notesDir, "_sidebar.md"), "utf8")).rejects.toThrow();
    await expect(readFile(path.join(notesDir, "draw", "skip.md"), "utf8")).rejects.toThrow();
    await expect(readFile(path.join(notesDir, "drops", "demo.md"), "utf8")).rejects.toThrow();
    await expect(
      readFile(path.join(notesDir, "superpowers", "spec.md"), "utf8"),
    ).rejects.toThrow();

    const navigationJson = JSON.parse(await readFile(navigationFile, "utf8"));
    expect(navigationJson).toEqual(result.navigation);
    expect(JSON.stringify(result.navigation)).not.toContain("Advanced Alias");

    const issues = JSON.parse(await readFile(knownIssuesFile, "utf8"));
    expect(issues).toEqual([
      {
        kind: "broken-reference",
        sourceRoute: "/guides/getting-started/",
        validationContext: null,
        rawReference: "/guides/missing/",
        resolvedTarget: "/guides/missing/",
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

  test("rejects traversing and symlink-escaped local image references", async () => {
    const { migrateContent } = await loadMigrationModule();
    const repo = await makeTempDir("task-2-image-safety-");
    const sourceDir = path.join(repo, "docs");
    const outsideDir = path.join(repo, "outside");
    const workspaceDir = path.join(repo, "output");

    await mkdir(path.join(sourceDir, "guides"), { recursive: true });
    await mkdir(outsideDir, { recursive: true });
    await writeFile(path.join(outsideDir, "secret.png"), "secret");
    await symlink(outsideDir, path.join(sourceDir, "guides", "escaped"));
    await writeFile(
      path.join(sourceDir, "guides", "images.md"),
      "# Unsafe\n\n![](../../../outside.png)\n\n![](./escaped/secret.png)\n",
    );

    await expect(
      migrateContent({
        sourceDir,
        notesDir: path.join(workspaceDir, "notes"),
        navigationFile: path.join(workspaceDir, "navigation.json"),
        knownIssuesFile: path.join(workspaceDir, "content-known-issues.json"),
        assetManifestFile: path.join(workspaceDir, "local-assets.json"),
      }),
    ).rejects.toThrow(/image reference .*outside docs|symlink/i);
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
      migratedCount: 6,
      excludedCount: 6,
    });

    const guide = await readFile(path.join(notesDir, "guides", "getting-started.md"), "utf8");
    expect(guide).toContain("[deep dive](/guides/nested/child/#details)");
    expect(guide).toContain(
      "[overview](/guides/advanced/#%E4%B8%AD%E6%96%87%20%E6%A0%87%E9%A2%98)",
    );
  });

  test("preserves tracked relative images and records truly missing image debt", async () => {
    const { migrateContent } = await loadMigrationModule();
    const sourceDir = await makeTempDir("task-4-images-source-");
    const workspaceDir = await makeTempDir("task-4-images-output-");
    const notesDir = path.join(workspaceDir, "notes");
    const navigationFile = path.join(workspaceDir, "navigation.json");
    const knownIssuesFile = path.join(workspaceDir, "content-known-issues.json");
    const assetManifestFile = path.join(workspaceDir, "local-assets.json");

    await mkdir(path.join(sourceDir, "guides", "pictures"), { recursive: true });
    await writeFile(path.join(sourceDir, "guides", "pictures", "diagram.png"), "tracked");
    await writeFile(
      path.join(sourceDir, "guides", "images.md"),
      [
        "# 图片回退",
        "",
        "![架构图](./pictures/diagram.png)",
        "",
        "![架构图](./missing-diagram.png)",
        "",
        "![](./diagram-without-alt.png)",
        "",
      ].join("\n"),
      "utf8",
    );

    await migrateContent({
      sourceDir,
      notesDir,
      navigationFile,
      knownIssuesFile,
      assetManifestFile,
    });

    const generated = await readFile(path.join(notesDir, "guides", "images.md"), "utf8");
    expect(generated).toContain("![架构图](/guides/pictures/diagram.png)");
    expect(generated).toContain("[架构图](/guides/missing-diagram.png)");
    expect(generated).toContain(
      "[./diagram-without-alt.png](/guides/diagram-without-alt.png)",
    );
    expect(generated).not.toContain("Image:");
    expect(generated).not.toContain("Image asset");
    await expect(
      readFile(assetManifestFile, "utf8").then((value) => JSON.parse(value)),
    ).resolves.toEqual([
      {
        source: "guides/pictures/diagram.png",
        publicPath: "/guides/pictures/diagram.png",
      },
    ]);
    await expect(
      readFile(knownIssuesFile, "utf8").then((value) => JSON.parse(value)),
    ).resolves.toEqual([
      {
        kind: "broken-reference",
        sourceRoute: "/guides/images/",
        validationContext: null,
        rawReference: "/guides/diagram-without-alt.png",
        resolvedTarget: "/guides/diagram-without-alt.png",
      },
      {
        kind: "broken-reference",
        sourceRoute: "/guides/images/",
        validationContext: null,
        rawReference: "/guides/missing-diagram.png",
        resolvedTarget: "/guides/missing-diagram.png",
      },
    ]);
  });

  test("accounts for all real docs markdown and clears valid relative id links from known issues", async () => {
    const { classifySourceFiles, migrateContent } = await loadMigrationModule();
    const workspaceDir = await makeTempDir("task-2-real-");
    const notesDir = path.join(workspaceDir, "notes");
    const navigationFile = path.join(workspaceDir, "navigation.json");
    const knownIssuesFile = path.join(workspaceDir, "content-known-issues.json");
    const sourceFiles = (await listMarkdownFiles(realDocsRoot))
      .map((absolutePath) => path.posix.normalize(path.relative(realDocsRoot, absolutePath)))
      .sort((left, right) => left.localeCompare(right));
    const expectedCounts = classifySourceFiles(sourceFiles);

    const result = await migrateContent({
      sourceDir: realDocsRoot,
      notesDir,
      navigationFile,
      knownIssuesFile,
    });

    expect(result.accountedCount).toBe(174);
    expect(result.supportExcludedCount).toBe(10);
    expect(result.generatedDirSkippedCount).toBe(expectedCounts.skippedGeneratedDir.length);

    const sectionTitles = result.navigation.map((section: { title: string }) => section.title);
    expect(sectionTitles).toEqual(
      expect.arrayContaining(["Algo", "System Pattern", "Product Pattern", "Python", "System Design"]),
    );

    const algoSection = result.navigation.find(
      (section: { href: string; items: unknown[] }) => section.href === "/coding/",
    );
    expect(algoSection?.items.length).toBeGreaterThan(0);
    expect(algoSection?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "二叉树",
          href: "/coding/tree/",
        }),
      ]),
    );

    const issues = JSON.parse(await readFile(knownIssuesFile, "utf8"));
    expect(issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "coding/bfs/shortest.md",
          target: "./coding/bfs/levels?id=二叉树的最小深度",
        }),
      ]),
    );

    const stickySession = await readFile(
      path.join(notesDir, "products", "federated", "sticky_session_k8s.md"),
      "utf8",
    );
    expect(stickySession).toContain(
      "![websocket stick session](/images/lock_sticky_session.png)",
    );
    expect(stickySession).toContain('language: "en"');
    expect(stickySession).not.toContain("Image:");
    await expect(
      readFile(path.join(notesDir, "coding", "tree", "index.md"), "utf8"),
    ).resolves.toContain('language: "zh-CN"');
  });
});
