import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

const tempPaths: string[] = [];

async function makeTempDir(prefix: string) {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));
  tempPaths.push(dir);
  return dir;
}

async function loadAssemblyModule() {
  return import(
    `${pathToFileURL(path.resolve("scripts/assemble-static.mjs")).href}?t=${Date.now()}-${Math.random()}`
  );
}

async function writeFixtureFile(filePath: string, contents: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
}

afterEach(async () => {
  await Promise.all(
    tempPaths.splice(0).map((entry) => rm(entry, { force: true, recursive: true })),
  );
});

describe("assemble-static", () => {
  test("public assembly derives the repository root from the module location", async () => {
    const { assembleStatic } = await loadAssemblyModule();
    const outsideRoot = await makeTempDir("task-5-public-root-");

    await writeFixtureFile(
      path.join(outsideRoot, "docs", "drops", "orbit-sketch", "index.html"),
      "<!doctype html><title>outside</title>\n",
    );

    await expect(
      assembleStatic({
        docsDir: path.join(outsideRoot, "docs"),
        distDir: path.join(outsideRoot, "site", "dist"),
      }),
    ).rejects.toThrow(/outside the repository root/i);
  });

  test("copies declared legacy assets, preserves filenames, and writes .nojekyll", async () => {
    const {
      __testOnly: { assembleStaticWithRepoRoot },
    } = await loadAssemblyModule();
    const repoRoot = await makeTempDir("task-5-repo-");
    const docsDir = path.join(repoRoot, "docs");
    const distDir = path.join(repoRoot, "site", "dist");

    await writeFixtureFile(
      path.join(docsDir, "drops", "orbit-sketch", "index.html"),
      "<!doctype html><title>orbit</title>\n",
    );
    await writeFixtureFile(
      path.join(docsDir, "drops", "slides", "chapter deck 01.pptx"),
      "pptx-binary-placeholder",
    );
    await writeFixtureFile(path.join(docsDir, "images", "cover.jpg"), "cover");
    await writeFixtureFile(path.join(docsDir, "_media", "favicon.ico"), "icon");
    await writeFixtureFile(
      path.join(docsDir, "downloads", "deep", "Product Notes Final.PPTX"),
      "download",
    );

    await assembleStaticWithRepoRoot({ docsDir, distDir, repoRoot });

    await expect(readFile(path.join(distDir, "drops", "orbit-sketch", "index.html"), "utf8"))
      .resolves.toContain("orbit");
    await expect(
      readFile(path.join(distDir, "drops", "slides", "chapter deck 01.pptx"), "utf8"),
    ).resolves.toBe("pptx-binary-placeholder");
    await expect(readFile(path.join(distDir, "images", "cover.jpg"), "utf8")).resolves.toBe(
      "cover",
    );
    await expect(readFile(path.join(distDir, "_media", "favicon.ico"), "utf8")).resolves.toBe(
      "icon",
    );
    await expect(
      readFile(path.join(distDir, "downloads", "deep", "Product Notes Final.PPTX"), "utf8"),
    ).resolves.toBe("download");
    await expect(readFile(path.join(distDir, ".nojekyll"), "utf8")).resolves.toBe("");
  });

  test("skips declared asset directories that are absent", async () => {
    const {
      __testOnly: { assembleStaticWithRepoRoot },
    } = await loadAssemblyModule();
    const repoRoot = await makeTempDir("task-5-missing-assets-");
    const docsDir = path.join(repoRoot, "docs");
    const distDir = path.join(repoRoot, "site", "dist");

    await writeFixtureFile(
      path.join(docsDir, "drops", "orbit-sketch", "index.html"),
      "<!doctype html><title>orbit</title>\n",
    );

    await expect(assembleStaticWithRepoRoot({ docsDir, distDir, repoRoot })).resolves.toMatchObject({
      copied: ["drops"],
      skipped: expect.arrayContaining(["images", "_media", "downloads"]),
    });
    await expect(readFile(path.join(distDir, ".nojekyll"), "utf8")).resolves.toBe("");
  });

  test("removes stale legacy subtree files without touching unrelated dist output", async () => {
    const {
      __testOnly: { assembleStaticWithRepoRoot },
    } = await loadAssemblyModule();
    const repoRoot = await makeTempDir("task-5-repeat-run-");
    const docsDir = path.join(repoRoot, "docs");
    const distDir = path.join(repoRoot, "site", "dist");

    await writeFixtureFile(
      path.join(docsDir, "drops", "orbit-sketch", "index.html"),
      "<!doctype html><title>orbit</title>\n",
    );
    await writeFixtureFile(path.join(docsDir, "images", "cover.jpg"), "cover");

    await assembleStaticWithRepoRoot({ docsDir, distDir, repoRoot });

    await writeFixtureFile(path.join(distDir, "index.html"), "<!doctype html><title>astro</title>\n");
    await writeFixtureFile(path.join(distDir, "drops", "stale.html"), "stale");
    await writeFixtureFile(path.join(distDir, "downloads", "stale.pdf"), "stale-download");

    await assembleStaticWithRepoRoot({ docsDir, distDir, repoRoot });

    await expect(readFile(path.join(distDir, "drops", "orbit-sketch", "index.html"), "utf8"))
      .resolves.toContain("orbit");
    await expect(readFile(path.join(distDir, "index.html"), "utf8")).resolves.toContain("astro");
    await expect(stat(path.join(distDir, "drops", "stale.html"))).rejects.toThrow();
    await expect(stat(path.join(distDir, "downloads"))).rejects.toThrow();
  });

  test("test-only helper rejects source or destination paths outside the repository root", async () => {
    const {
      __testOnly: { assembleStaticWithRepoRoot },
    } = await loadAssemblyModule();
    const repoRoot = await makeTempDir("task-5-repo-root-");
    const outsideRoot = await makeTempDir("task-5-outside-root-");

    await writeFixtureFile(
      path.join(repoRoot, "docs", "drops", "orbit-sketch", "index.html"),
      "<!doctype html><title>orbit</title>\n",
    );
    await writeFixtureFile(
      path.join(outsideRoot, "docs", "drops", "orbit-sketch", "index.html"),
      "<!doctype html><title>outside</title>\n",
    );

    await expect(
      assembleStaticWithRepoRoot({
        docsDir: path.join(outsideRoot, "docs"),
        distDir: path.join(repoRoot, "site", "dist"),
        repoRoot,
      }),
    ).rejects.toThrow(/outside the repository root/i);

    await expect(
      assembleStaticWithRepoRoot({
        docsDir: path.join(repoRoot, "docs"),
        distDir: path.join(outsideRoot, "site", "dist"),
        repoRoot,
      }),
    ).rejects.toThrow(/outside the repository root/i);
  });

  test("test-only helper rejects symlinked asset sources that escape the repository root", async () => {
    const {
      __testOnly: { assembleStaticWithRepoRoot },
    } = await loadAssemblyModule();
    const repoRoot = await makeTempDir("task-5-symlink-repo-");
    const outsideRoot = await makeTempDir("task-5-symlink-outside-");
    const docsDir = path.join(repoRoot, "docs");
    const distDir = path.join(repoRoot, "site", "dist");

    await mkdir(docsDir, { recursive: true });
    await mkdir(path.join(outsideRoot, "drops", "orbit-sketch"), { recursive: true });
    await writeFixtureFile(
      path.join(outsideRoot, "drops", "orbit-sketch", "index.html"),
      "<!doctype html><title>orbit</title>\n",
    );
    await symlink(path.join(outsideRoot, "drops"), path.join(docsDir, "drops"));

    await expect(assembleStaticWithRepoRoot({ docsDir, distDir, repoRoot })).rejects.toThrow(
      /outside the repository root/i,
    );
  });
});
