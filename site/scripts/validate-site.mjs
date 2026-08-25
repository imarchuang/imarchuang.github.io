import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { routeFor } from "./migrate-content.mjs";

const REQUIRED_ARTIFACTS = [
  {
    href: "/draw/",
    expectedPath: "draw/index.html",
    reason: "whiteboard build output",
  },
  {
    href: "/drops/",
    expectedPath: "drops",
    reason: "copied explainer artifacts",
  },
];

function toPosix(value) {
  return value.split(path.sep).join(path.posix.sep);
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, "");
}

function routeToUrl(route) {
  return route ? `/${trimSlashes(route)}/` : "/";
}

function looksExternal(reference) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(reference);
}

function stripNonDocumentBlocks(html) {
  return html.replace(/<(script|style|template|pre|code)\b[\s\S]*?<\/\1>/giu, "");
}

function parseAttributeReferences(html) {
  const references = [];
  const sanitized = stripNonDocumentBlocks(html);
  const tagPattern = /<([a-z][\w:-]*)([\s\S]*?)>/giu;
  const attributePattern =
    /\b(href|src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/giu;
  const validAttributesByTag = new Map([
    ["a", new Set(["href"])],
    ["img", new Set(["src", "srcset"])],
    ["source", new Set(["src", "srcset"])],
    ["script", new Set(["src"])],
    ["link", new Set(["href"])],
    ["iframe", new Set(["src"])],
  ]);

  for (const tagMatch of sanitized.matchAll(tagPattern)) {
    const tagName = tagMatch[1].toLowerCase();
    const attributes = tagMatch[2];
    const validAttributes = validAttributesByTag.get(tagName);

    if (!validAttributes) {
      continue;
    }

    for (const attributeMatch of attributes.matchAll(attributePattern)) {
      const attribute = attributeMatch[1].toLowerCase();
      if (!validAttributes.has(attribute)) {
        continue;
      }
      const rawValue = attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? "";

      if (attribute === "srcset") {
        for (const entry of rawValue.split(",")) {
          const candidate = entry.trim().split(/\s+/u)[0];
          if (candidate) {
            references.push({ tagName, attribute, rawValue: candidate });
          }
        }
        continue;
      }

      references.push({ tagName, attribute, rawValue });
    }
  }

  return references;
}

function normalizePageRoute(relativePath) {
  const normalized = toPosix(relativePath);

  if (normalized === "index.html") {
    return "/";
  }

  if (normalized.endsWith("/index.html")) {
    return routeToUrl(normalized.slice(0, -"/index.html".length));
  }

  if (normalized.endsWith(".html")) {
    return routeToUrl(normalized.slice(0, -".html".length));
  }

  return null;
}

function normalizeTargetRoute(sitePath) {
  if (sitePath === "/" || sitePath === "") {
    return "/";
  }

  if (sitePath.endsWith("/index.html")) {
    return routeToUrl(sitePath.slice(1, -"/index.html".length));
  }

  if (sitePath.endsWith(".html")) {
    return routeToUrl(sitePath.slice(1, -".html".length));
  }

  return routeToUrl(sitePath.slice(1));
}

function normalizeAssetPath(sitePath) {
  if (sitePath === "/" || sitePath === "") {
    return "/";
  }

  return `/${trimSlashes(sitePath)}`;
}

function splitReference(reference) {
  const [withoutHash] = reference.split("#", 1);
  const [pathname] = withoutHash.split("?", 1);
  const trimmed = pathname.trim();

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function resolveReferencePath(sourceFileRelativePath, rawPath) {
  const currentDirectory = path.posix.dirname(toPosix(sourceFileRelativePath));
  const currentSegments = currentDirectory === "." ? [] : currentDirectory.split("/");
  const resolvedSegments = rawPath.startsWith("/") ? [] : [...currentSegments];

  for (const rawSegment of rawPath.split("/")) {
    const segment = rawSegment.trim();
    if (!segment || segment === ".") {
      continue;
    }

    if (segment === "..") {
      if (resolvedSegments.length === 0) {
        return { escaped: true, sitePath: null };
      }
      resolvedSegments.pop();
      continue;
    }

    resolvedSegments.push(segment);
  }

  return {
    escaped: false,
    sitePath: resolvedSegments.length === 0 ? "/" : `/${resolvedSegments.join("/")}`,
  };
}

function looksLikeHtmlRoute(pathname) {
  const extension = path.posix.extname(pathname).toLowerCase();
  return pathname.endsWith("/") || extension === "" || extension === ".html" || extension === ".md";
}

function relativeSourceToRoute(source) {
  return routeToUrl(routeFor(toPosix(source)));
}

function candidateForResolvedIssuePath(sitePath) {
  const relativePath = trimSlashes(sitePath);
  const extension = path.posix.extname(relativePath).toLowerCase();

  if (!extension || extension === ".html" || extension === ".md") {
    return routeToUrl(routeFor(relativePath));
  }

  return normalizeAssetPath(sitePath);
}

function issueTargetCandidates(issue) {
  const rawPath = splitReference(issue.target);
  const candidates = new Set();

  if (!rawPath || looksExternal(rawPath) || rawPath.startsWith("#")) {
    return candidates;
  }

  if (issue.kind === "stale-sidebar-link") {
    const sidebarResolved = resolveReferencePath("README.md", rawPath);
    if (!sidebarResolved.escaped && sidebarResolved.sitePath) {
      candidates.add(candidateForResolvedIssuePath(sidebarResolved.sitePath));
    }
    return candidates;
  }

  const sourceRelative = toPosix(issue.source);
  const sourceDirectory = path.posix.dirname(sourceRelative);
  const fileRelative = resolveReferencePath(sourceRelative, rawPath);
  if (!fileRelative.escaped && fileRelative.sitePath) {
    candidates.add(candidateForResolvedIssuePath(fileRelative.sitePath));
  }

  const rootRelative = resolveReferencePath(path.posix.join(sourceDirectory, "index.md"), rawPath);
  if (!rootRelative.escaped && rootRelative.sitePath) {
    candidates.add(candidateForResolvedIssuePath(rootRelative.sitePath));
  }

  return candidates;
}

function buildAllowlist(knownIssues) {
  return knownIssues.map((issue) => {
    if (issue.kind === "stale-sidebar-link") {
      return {
        kind: issue.kind,
        sourcePrefix: routeToUrl(path.posix.dirname(toPosix(issue.source))),
        rawTarget: splitReference(issue.target),
        targetCandidates: issueTargetCandidates(issue),
      };
    }

    return {
      kind: issue.kind,
      sourceRoute: relativeSourceToRoute(issue.source),
      rawTarget: splitReference(issue.target),
      targetCandidates: issueTargetCandidates(issue),
    };
  });
}

function isAllowlistedFailure(failure, allowlist) {
  if (failure.kind !== "broken-reference") {
    return false;
  }

  return allowlist.some((entry) => {
    const rawTargetMatches = entry.rawTarget && splitReference(failure.rawReference) === entry.rawTarget;
    const normalizedTargetMatches = entry.targetCandidates.has(failure.resolvedTarget);

    if (!rawTargetMatches && !normalizedTargetMatches) {
      return false;
    }

    if (entry.kind === "stale-sidebar-link") {
      return failure.sourceRoute.startsWith(entry.sourcePrefix);
    }

    return failure.sourceRoute === entry.sourceRoute;
  });
}

async function pathExists(candidatePath) {
  try {
    await stat(candidatePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function listFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function formatFailure(failure) {
  switch (failure.kind) {
    case "duplicate-route":
      return `Duplicate normalized route "${failure.route}" from "${failure.firstFile}" and "${failure.secondFile}".`;
    case "missing-artifact":
      return `Missing required artifact "${failure.href}": expected "${failure.expectedPath}" (${failure.reason}). Run "npm run build" before validation.`;
    case "broken-reference":
      return `${failure.referenceType} in "${failure.sourceRoute}" (${failure.sourceFile}): "${failure.rawReference}" resolved to "${failure.resolvedTarget}" but no built page or file exists.`;
    case "escaped-reference":
      return `${failure.referenceType} escapes dist in "${failure.sourceRoute}" (${failure.sourceFile}): "${failure.rawReference}".`;
    default:
      return failure.message;
  }
}

async function loadKnownIssues(knownIssuesFile) {
  if (!(await pathExists(knownIssuesFile))) {
    return [];
  }

  return JSON.parse(await readFile(knownIssuesFile, "utf8"));
}

export async function collectValidationReport({
  distDir,
  knownIssuesFile,
} = {}) {
  const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const resolvedDistDir = path.resolve(distDir ?? path.join(siteRoot, "dist"));
  const resolvedKnownIssuesFile = path.resolve(
    knownIssuesFile ?? path.join(siteRoot, "content-known-issues.json"),
  );

  const distStats = await stat(resolvedDistDir);
  if (!distStats.isDirectory()) {
    throw new Error(`distDir must be a directory: ${resolvedDistDir}`);
  }

  const absoluteFiles = await listFiles(resolvedDistDir);
  const relativeFiles = absoluteFiles
    .map((absolutePath) => toPosix(path.relative(resolvedDistDir, absolutePath)))
    .sort((left, right) => left.localeCompare(right));
  const fileSet = new Set(relativeFiles.map((relativePath) => normalizeAssetPath(relativePath)));
  const htmlFiles = relativeFiles.filter((relativePath) => relativePath.endsWith(".html"));
  const routeOwners = new Map();
  const rawFailures = [];
  let checkedReferences = 0;

  for (const relativePath of htmlFiles) {
    const route = normalizePageRoute(relativePath);
    if (!route) {
      continue;
    }

    const previousOwner = routeOwners.get(route);
    if (previousOwner) {
      rawFailures.push({
        kind: "duplicate-route",
        route,
        firstFile: previousOwner,
        secondFile: `dist/${relativePath}`,
      });
      continue;
    }

    routeOwners.set(route, `dist/${relativePath}`);
  }

  for (const artifact of REQUIRED_ARTIFACTS) {
    if (artifact.expectedPath === "drops") {
      const hasDropsFiles = relativeFiles.some((relativePath) => relativePath.startsWith("drops/"));
      if (!hasDropsFiles) {
        rawFailures.push({
          kind: "missing-artifact",
          href: artifact.href,
          expectedPath: `dist/${artifact.expectedPath}`,
          reason: artifact.reason,
        });
      }
      continue;
    }

    if (!fileSet.has(normalizeAssetPath(artifact.expectedPath))) {
      rawFailures.push({
        kind: "missing-artifact",
        href: artifact.href,
        expectedPath: `dist/${artifact.expectedPath}`,
        reason: artifact.reason,
      });
    }
  }

  for (const relativePath of htmlFiles) {
    const sourceFile = `dist/${relativePath}`;
    const sourceRoute = normalizePageRoute(relativePath);
    const html = await readFile(path.join(resolvedDistDir, relativePath), "utf8");

    for (const reference of parseAttributeReferences(html)) {
      const pathname = splitReference(reference.rawValue);
      if (!pathname || pathname === "." || pathname === "./" || pathname === "#") {
        continue;
      }

      if (looksExternal(pathname)) {
        continue;
      }

      const isAnchorLink = reference.attribute === "href" && reference.tagName === "a";
      const resolved = resolveReferencePath(relativePath, pathname);
      const referenceType = isAnchorLink
        ? "Broken internal link"
        : "Missing local asset reference";

      if (resolved.escaped) {
        checkedReferences += 1;
        rawFailures.push({
          kind: "escaped-reference",
          sourceFile,
          sourceRoute,
          rawReference: reference.rawValue,
          referenceType,
        });
        continue;
      }

      if (isAnchorLink && !looksLikeHtmlRoute(pathname)) {
        continue;
      }

      checkedReferences += 1;
      const resolvedTarget = resolved.sitePath;
      const assetPath = normalizeAssetPath(resolvedTarget);
      const routePath = normalizeTargetRoute(resolvedTarget);
      const existsAsRoute = looksLikeHtmlRoute(pathname) && routeOwners.has(routePath);
      const existsAsFile = fileSet.has(assetPath);

      if (existsAsRoute || existsAsFile) {
        continue;
      }

      rawFailures.push({
        kind: "broken-reference",
        sourceFile,
        sourceRoute,
        rawReference: reference.rawValue,
        resolvedTarget: looksLikeHtmlRoute(pathname) ? routePath : assetPath,
        referenceType,
      });
    }
  }

  const allowlist = buildAllowlist(await loadKnownIssues(resolvedKnownIssuesFile));
  const failures = [];
  const allowlistedFailures = [];

  for (const failure of rawFailures) {
    const formatted = formatFailure(failure);
    if (isAllowlistedFailure(failure, allowlist)) {
      allowlistedFailures.push(formatted);
      continue;
    }
    failures.push(formatted);
  }

  failures.sort((left, right) => left.localeCompare(right));
  allowlistedFailures.sort((left, right) => left.localeCompare(right));

  return {
    checkedFiles: relativeFiles.length,
    checkedPages: htmlFiles.length,
    checkedReferences,
    failureCount: failures.length,
    allowlistedFailureCount: allowlistedFailures.length,
    failures,
    allowlistedFailures,
  };
}

export async function validateSite(options = {}) {
  const report = await collectValidationReport(options);

  if (report.failureCount > 0) {
    throw new Error(
      [
        ...report.failures,
        `Site validation failed with ${report.failureCount} issue(s).`,
      ].join("\n"),
    );
  }

  return report;
}

export const __testOnly = {
  collectValidationReport,
};

export async function runCli(overrides = {}) {
  const report = await validateSite(overrides);
  console.log(
    JSON.stringify(
      {
        checkedFiles: report.checkedFiles,
        checkedPages: report.checkedPages,
        checkedReferences: report.checkedReferences,
        allowlistedFailureCount: report.allowlistedFailureCount,
        failureCount: report.failureCount,
      },
      null,
      2,
    ),
  );

  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await runCli();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
