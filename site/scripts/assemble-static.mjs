import {
  cp,
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STATIC_DIRS = ["drops", "images", "_media", "downloads"];
const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionRepoRoot = path.resolve(siteRoot, "..");

function isWithinRoot(rootPath, candidatePath) {
  const relativePath = path.relative(rootPath, candidatePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function outsideRootError(label, candidatePath, rootPath) {
  return new Error(
    `${label} resolves outside the repository root: ${candidatePath} (root: ${rootPath})`,
  );
}

async function pathExists(candidatePath) {
  try {
    await lstat(candidatePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function resolveRepoRoot(repoRoot) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const canonicalRepoRoot = await realpath(resolvedRepoRoot);

  return canonicalRepoRoot;
}

async function nearestExistingAncestor(candidatePath) {
  let currentPath = path.resolve(candidatePath);

  while (true) {
    if (await pathExists(currentPath)) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      return currentPath;
    }

    currentPath = parentPath;
  }
}

async function resolveExistingPathWithinRepo(repoRoot, candidatePath, label) {
  const resolvedPath = path.resolve(candidatePath);
  const ancestorPath = await nearestExistingAncestor(resolvedPath);
  const canonicalAncestor = await realpath(ancestorPath);
  const canonicalResolvedPath = path.resolve(
    canonicalAncestor,
    path.relative(ancestorPath, resolvedPath),
  );
  const canonicalPath = await realpath(resolvedPath);

  if (!isWithinRoot(repoRoot, canonicalResolvedPath)) {
    throw outsideRootError(label, canonicalResolvedPath, repoRoot);
  }

  if (!isWithinRoot(repoRoot, canonicalPath)) {
    throw outsideRootError(label, canonicalPath, repoRoot);
  }

  return canonicalPath;
}

async function resolvePlannedPathWithinRepo(repoRoot, candidatePath, label) {
  const resolvedPath = path.resolve(candidatePath);
  const ancestorPath = await nearestExistingAncestor(resolvedPath);
  const canonicalAncestor = await realpath(ancestorPath);
  const canonicalResolvedPath = path.resolve(
    canonicalAncestor,
    path.relative(ancestorPath, resolvedPath),
  );

  if (!isWithinRoot(repoRoot, canonicalAncestor)) {
    throw outsideRootError(label, canonicalAncestor, repoRoot);
  }

  if (!isWithinRoot(repoRoot, canonicalResolvedPath)) {
    throw outsideRootError(label, canonicalResolvedPath, repoRoot);
  }

  return canonicalResolvedPath;
}

async function validateDirectory(pathToCheck, label) {
  const details = await stat(pathToCheck);

  if (!details.isDirectory()) {
    throw new Error(`${label} must be a directory: ${pathToCheck}`);
  }
}

async function validateFile(pathToCheck, label) {
  const details = await stat(pathToCheck);

  if (!details.isFile()) {
    throw new Error(`${label} must be a file: ${pathToCheck}`);
  }
}

async function validateCopyTree(repoRoot, sourcePath, label, visitedPaths = new Set()) {
  const sourceDetails = await lstat(sourcePath);

  if (sourceDetails.isSymbolicLink()) {
    const canonicalTarget = await realpath(sourcePath);
    if (!isWithinRoot(repoRoot, canonicalTarget)) {
      throw outsideRootError(`${label} symlink target`, canonicalTarget, repoRoot);
    }

    if (visitedPaths.has(canonicalTarget)) {
      return;
    }
    visitedPaths.add(canonicalTarget);

    const targetDetails = await stat(canonicalTarget);
    if (targetDetails.isDirectory()) {
      const entries = await readdir(canonicalTarget, { withFileTypes: true });
      for (const entry of entries) {
        await validateCopyTree(
          repoRoot,
          path.join(canonicalTarget, entry.name),
          label,
          visitedPaths,
        );
      }
    }
    return;
  }

  const canonicalSource = await realpath(sourcePath);
  if (!isWithinRoot(repoRoot, canonicalSource)) {
    throw outsideRootError(label, canonicalSource, repoRoot);
  }

  if (visitedPaths.has(canonicalSource)) {
    return;
  }
  visitedPaths.add(canonicalSource);

  if (sourceDetails.isDirectory()) {
    const entries = await readdir(sourcePath, { withFileTypes: true });
    for (const entry of entries) {
      await validateCopyTree(repoRoot, path.join(sourcePath, entry.name), label, visitedPaths);
    }
  }
}

async function assembleStaticWithRepoRoot({
  docsDir,
  distDir,
  repoRoot,
  localAssetsFile,
}) {
  const canonicalRepoRoot = await resolveRepoRoot(repoRoot);
  const canonicalDocsDir = await resolveExistingPathWithinRepo(
    canonicalRepoRoot,
    docsDir,
    "docsDir",
  );
  await validateDirectory(canonicalDocsDir, "docsDir");

  const resolvedDistDir = await resolvePlannedPathWithinRepo(
    canonicalRepoRoot,
    distDir,
    "distDir",
  );
  await mkdir(resolvedDistDir, { recursive: true });

  const copied = [];
  const skipped = [];

  for (const directoryName of STATIC_DIRS) {
    const sourcePath = path.join(canonicalDocsDir, directoryName);
    const destinationPath = await resolvePlannedPathWithinRepo(
      canonicalRepoRoot,
      path.join(resolvedDistDir, directoryName),
      `${directoryName} destination`,
    );

    if (await pathExists(destinationPath)) {
      await rm(destinationPath, { recursive: true, force: true });
    }

    if (!(await pathExists(sourcePath))) {
      skipped.push(directoryName);
      continue;
    }

    const canonicalSourcePath = await resolveExistingPathWithinRepo(
      canonicalRepoRoot,
      sourcePath,
      `${directoryName} source`,
    );
    await validateDirectory(canonicalSourcePath, `${directoryName} source`);
    await validateCopyTree(canonicalRepoRoot, sourcePath, `${directoryName} source`);

    await cp(canonicalSourcePath, destinationPath, {
      recursive: true,
      dereference: true,
      force: true,
      preserveTimestamps: true,
    });
    copied.push(directoryName);
  }

  let localAssetCount = 0;
  if (localAssetsFile && (await pathExists(localAssetsFile))) {
    const canonicalManifest = await resolveExistingPathWithinRepo(
      canonicalRepoRoot,
      localAssetsFile,
      "local asset manifest",
    );
    await validateFile(canonicalManifest, "local asset manifest");
    const localAssets = JSON.parse(await readFile(canonicalManifest, "utf8"));

    for (const asset of localAssets) {
      if (
        typeof asset?.source !== "string" ||
        typeof asset?.publicPath !== "string" ||
        !asset.publicPath.startsWith("/")
      ) {
        throw new Error("Local asset manifest contains an invalid entry");
      }
      const sourcePath = await resolveExistingPathWithinRepo(
        canonicalRepoRoot,
        path.join(canonicalDocsDir, asset.source),
        `local asset source ${asset.source}`,
      );
      if (!isWithinRoot(canonicalDocsDir, sourcePath)) {
        throw outsideRootError("local asset source", sourcePath, canonicalDocsDir);
      }
      await validateFile(sourcePath, `local asset source ${asset.source}`);

      const destinationPath = await resolvePlannedPathWithinRepo(
        canonicalRepoRoot,
        path.join(resolvedDistDir, asset.publicPath.replace(/^\/+/u, "")),
        `local asset destination ${asset.publicPath}`,
      );
      if (!isWithinRoot(resolvedDistDir, destinationPath)) {
        throw outsideRootError("local asset destination", destinationPath, resolvedDistDir);
      }
      await mkdir(path.dirname(destinationPath), { recursive: true });
      await cp(sourcePath, destinationPath, {
        dereference: true,
        force: true,
        preserveTimestamps: true,
      });
      localAssetCount += 1;
    }
  }

  const noJekyllSource = path.join(canonicalDocsDir, ".nojekyll");
  const noJekyllDestination = await resolvePlannedPathWithinRepo(
    canonicalRepoRoot,
    path.join(resolvedDistDir, ".nojekyll"),
    ".nojekyll destination",
  );

  if (await pathExists(noJekyllSource)) {
    const canonicalNoJekyllSource = await resolveExistingPathWithinRepo(
      canonicalRepoRoot,
      noJekyllSource,
      ".nojekyll source",
    );
    await validateFile(canonicalNoJekyllSource, ".nojekyll source");
    await cp(canonicalNoJekyllSource, noJekyllDestination, {
      dereference: true,
      force: true,
    });
  } else {
    await writeFile(noJekyllDestination, "");
  }

  return {
    copied,
    skipped,
    localAssetCount,
    distDir: resolvedDistDir,
  };
}

export async function assembleStatic({ docsDir, distDir }) {
  return assembleStaticWithRepoRoot({
    repoRoot: productionRepoRoot,
    docsDir,
    distDir,
    localAssetsFile: path.resolve(siteRoot, "src/generated/local-assets.json"),
  });
}

export const __testOnly = {
  assembleStaticWithRepoRoot,
};

export async function runCli(overrides = {}) {
  const result = await assembleStatic({
    docsDir: overrides.docsDir ?? path.resolve(siteRoot, "../docs"),
    distDir: overrides.distDir ?? path.resolve(siteRoot, "dist"),
  });

  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runCli();
}
