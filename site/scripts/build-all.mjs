import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { assembleStatic } from "./assemble-static.mjs";

const execFileAsync = promisify(execFile);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

export async function runCommand(command, args, options = {}) {
  try {
    const result = await execFileAsync(command, args, {
      cwd: options.cwd,
      env: options.env,
      maxBuffer: 1024 * 1024 * 10,
    });

    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
  } catch (error) {
    if (error.stdout) {
      process.stdout.write(error.stdout);
    }
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }

    throw new Error(
      `Command failed: ${command} ${args.join(" ")}\n${error.stderr || error.message}`,
    );
  }
}

export async function buildAll({
  siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  repoRoot = path.resolve(siteRoot, ".."),
  runCommand: commandRunner = runCommand,
  assemble = assembleStatic,
} = {}) {
  await commandRunner(npmCommand, ["run", "build:astro"], { cwd: siteRoot });
  await commandRunner(npmCommand, ["exec", "--", "pagefind", "--site", "dist"], {
    cwd: siteRoot,
  });
  await assemble({
    repoRoot,
    docsDir: path.join(repoRoot, "docs"),
    distDir: path.join(siteRoot, "dist"),
  });
  await commandRunner(npmCommand, ["run", "build", "--prefix", "../whiteboard"], {
    cwd: siteRoot,
    env: {
      ...process.env,
      WHITEBOARD_OUT_DIR: "../site/dist/draw",
    },
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildAll();
}
