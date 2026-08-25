import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, test } from "vitest";

const execFileAsync = promisify(execFile);

describe("scaffold scripts", () => {
  test("runs the content migration script", async () => {
    const result = await execFileAsync("node", ["scripts/migrate-content.mjs"], {
      cwd: process.cwd(),
    });

    expect(result.stderr).toBe("");
  });

  test("runs the static assembly script after build output exists", async () => {
    await mkdir("dist", { recursive: true });

    const result = await execFileAsync("node", ["scripts/assemble-static.mjs"], {
      cwd: process.cwd(),
    });

    expect(result.stderr).toBe("");
  });
});
