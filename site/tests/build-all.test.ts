import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, test } from "vitest";

async function loadBuildModule() {
  return import(
    `${pathToFileURL(path.resolve("scripts/build-all.mjs")).href}?t=${Date.now()}-${Math.random()}`
  );
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
          repoRoot,
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
});
