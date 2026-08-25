import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

const execFileAsync = promisify(execFile);

async function loadBuildModule() {
  return import(
    `${pathToFileURL(path.resolve("scripts/build-all.mjs")).href}?t=${Date.now()}-${Math.random()}`
  );
}

async function snapshotDirectory(directoryPath: string) {
  const snapshot = new Map<string, string>();

  async function walk(currentPath: string) {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      const relativePath = path.relative(directoryPath, entryPath);
      const contents = await readFile(entryPath);
      const digest = createHash("sha256").update(contents).digest("hex");
      snapshot.set(relativePath, digest);
    }
  }

  await walk(directoryPath);
  return [...snapshot.entries()].sort(([left], [right]) => left.localeCompare(right));
}

describe("build-all", () => {
  test("runs astro, pagefind, static assembly, and whiteboard build in order", async () => {
    const { buildAll } = await loadBuildModule();
    const calls: Array<{
      kind: "command" | "assemble";
      command?: string;
      args?: string[];
      cwd?: string;
      env?: Record<string, string | undefined>;
      options?: Record<string, string>;
    }> = [];

    const siteRoot = "/repo/site";
    const repoRoot = "/repo";

    await buildAll({
      siteRoot,
      repoRoot,
      runCommand: async (command: string, args: string[], options: Record<string, unknown>) => {
        calls.push({
          kind: "command",
          command,
          args,
          cwd: options.cwd as string,
          env: options.env as Record<string, string | undefined>,
        });
      },
      assemble: async (options: Record<string, string>) => {
        calls.push({
          kind: "assemble",
          options,
        });
      },
    });

    expect(calls).toEqual([
      {
        kind: "command",
        command: process.platform === "win32" ? "npm.cmd" : "npm",
        args: ["run", "build:astro"],
        cwd: siteRoot,
        env: undefined,
      },
      {
        kind: "command",
        command: process.platform === "win32" ? "npm.cmd" : "npm",
        args: ["exec", "--", "pagefind", "--site", "dist"],
        cwd: siteRoot,
        env: undefined,
      },
      {
        kind: "assemble",
        options: {
          docsDir: path.join(repoRoot, "docs"),
          distDir: path.join(siteRoot, "dist"),
        },
      },
      {
        kind: "command",
        command: process.platform === "win32" ? "npm.cmd" : "npm",
        args: ["run", "build", "--prefix", "../whiteboard"],
        cwd: siteRoot,
        env: {
          ...process.env,
          WHITEBOARD_OUT_DIR: "../site/dist/draw",
        },
      },
    ]);
  });

  test(
    "builds required artifacts and keeps a second composed build deterministic",
    async () => {
      const cwd = process.cwd();
      const distDir = path.join(cwd, "dist");

      await execFileAsync("node", ["scripts/build-all.mjs"], {
        cwd,
        maxBuffer: 1024 * 1024 * 20,
      });

      await expect(readFile(path.join(distDir, "index.html"), "utf8")).resolves.toContain(
        "<!DOCTYPE html>",
      );
      await expect(readFile(path.join(distDir, "draw", "index.html"), "utf8")).resolves.toContain(
        "<!doctype html>",
      );
      await expect(
        readFile(path.join(distDir, "drops", "orbit-sketch", "index.html"), "utf8"),
      ).resolves.toContain("html");
      await expect(readFile(path.join(distDir, ".nojekyll"), "utf8")).resolves.toBe("");

      const firstSnapshot = await snapshotDirectory(distDir);

      await execFileAsync("node", ["scripts/build-all.mjs"], {
        cwd,
        maxBuffer: 1024 * 1024 * 20,
      });

      await expect(snapshotDirectory(distDir)).resolves.toEqual(firstSnapshot);
    },
    120_000,
  );
});
