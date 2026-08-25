import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

function stripNonDocumentBodies(html) {
  return html
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/giu, "<script$1></script>")
    .replace(/<(style|template|pre|code)\b([^>]*)>[\s\S]*?<\/\1>/giu, "<$1$2></$1>");
}

function parseAttributeReferences(html) {
  const references = [];
  const sanitized = stripNonDocumentBodies(html);
  const tagPattern = /<([a-z][\w:-]*)([\s\S]*?)>/giu;
  const attributePattern =
    /\b([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/giu;
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

    const parsedAttributes = new Map();
    for (const attributeMatch of attributes.matchAll(attributePattern)) {
      const attribute = attributeMatch[1].toLowerCase();
      const rawValue = attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? "";
      parsedAttributes.set(attribute, rawValue);
    }

    for (const [attribute, rawValue] of parsedAttributes.entries()) {
      if (!validAttributes.has(attribute)) {
        continue;
      }
      const validationContext = parsedAttributes.get("data-validation-context") ?? null;

      if (attribute === "srcset") {
        for (const entry of rawValue.split(",")) {
          const candidate = entry.trim().split(/\s+/u)[0];
          if (candidate) {
            references.push({ tagName, attribute, rawValue: candidate, validationContext });
          }
        }
        continue;
      }

      references.push({ tagName, attribute, rawValue, validationContext });
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

function parseReference(reference) {
  const hashIndex = reference.indexOf("#");
  const beforeHash = hashIndex === -1 ? reference : reference.slice(0, hashIndex);
  const rawFragment = hashIndex === -1 ? null : reference.slice(hashIndex + 1);
  const [pathname] = beforeHash.split("?", 1);
  let decodedPathname;
  let decodedFragment = null;
  try {
    decodedPathname = decodeURIComponent(pathname.trim());
    decodedFragment = rawFragment === null ? null : decodeURIComponent(rawFragment);
  } catch {
    return {
      pathname: pathname.trim(),
      fragment: rawFragment,
      malformed: true,
    };
  }
  return {
    pathname: decodedPathname,
    fragment: decodedFragment?.replace(/^#+/u, "") ?? null,
    malformed: false,
  };
}

function decodeHtmlAttribute(value) {
  return value
    .replace(/&quot;/gu, '"')
    .replace(/&#39;|&apos;/gu, "'")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">");
}

function collectFragmentTargets(html) {
  const targets = new Set();
  const sanitized = stripNonDocumentBodies(html);
  const pattern = /\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/giu;
  for (const match of sanitized.matchAll(pattern)) {
    const target = decodeHtmlAttribute(match[1] ?? match[2] ?? match[3] ?? "");
    if (target) {
      targets.add(target);
    }
  }
  return targets;
}

function compatibleFragment(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
}

function fragmentExists(targets, fragment) {
  if (targets.has(fragment)) {
    return true;
  }
  const normalized = compatibleFragment(fragment);
  return normalized.length > 0 && [...targets].some((target) => compatibleFragment(target) === normalized);
}

function parseLegacyHashReference(reference) {
  if (!reference.startsWith("/#/")) {
    return null;
  }
  const raw = reference.slice(3);
  const [routePart, query = ""] = raw.split("?");
  try {
    const decodedRoute = decodeURIComponent(routePart)
      .replace(/\.md$/iu, "")
      .replace(/\/index$/iu, "")
      .replace(/^\/+|\/+$/gu, "");
    const rawAnchor = new URLSearchParams(query).get("id");
    const anchor = rawAnchor
      ? decodeURIComponent(rawAnchor).replace(/^#+/u, "")
      : null;
    return {
      route: routeToUrl(decodedRoute),
      anchor,
    };
  } catch {
    return { route: null, anchor: null };
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

function buildAllowlist(knownIssues) {
  return knownIssues.map((issue) => ({
    kind: issue.kind,
    sourceRoute: issue.sourceRoute,
    validationContext: issue.validationContext ?? null,
    rawReference: issue.rawReference,
    resolvedTarget: issue.resolvedTarget,
  }));
}

function isAllowlistedFailure(failure, allowlist) {
  return allowlist.some(
    (entry) =>
      failure.kind === entry.kind &&
      failure.sourceRoute === entry.sourceRoute &&
      (failure.validationContext ?? null) === entry.validationContext &&
      failure.rawReference === entry.rawReference &&
      failure.resolvedTarget === entry.resolvedTarget,
  );
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
    case "broken-fragment":
      return `Broken local fragment "${failure.rawReference.slice(failure.rawReference.indexOf("#"))}" in "${failure.sourceRoute}" (${failure.sourceFile}): destination "${failure.resolvedTarget}" has no compatible id or name.`;
    case "escaped-reference":
      return `${failure.referenceType} escapes dist in "${failure.sourceRoute}" (${failure.sourceFile}): "${failure.rawReference}".`;
    default:
      return failure.message;
  }
}

async function loadKnownIssues(knownIssuesFile, includeFragmentAllowlist = true) {
  const issues = [];
  if (await pathExists(knownIssuesFile)) {
    issues.push(...JSON.parse(await readFile(knownIssuesFile, "utf8")));
  }
  const fragmentIssuesFile = path.join(
    path.dirname(knownIssuesFile),
    "content-known-fragments.json",
  );
  if (includeFragmentAllowlist && (await pathExists(fragmentIssuesFile))) {
    issues.push(...JSON.parse(await readFile(fragmentIssuesFile, "utf8")));
  }
  return issues;
}

export async function collectValidationReport({
  distDir,
  knownIssuesFile,
  includeFragmentAllowlist = true,
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
  const fragmentTargetsByRoute = new Map();
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
    const html = await readFile(path.join(resolvedDistDir, relativePath), "utf8");
    fragmentTargetsByRoute.set(route, collectFragmentTargets(html));
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
      const legacyHash = parseLegacyHashReference(reference.rawValue);
      if (legacyHash) {
        checkedReferences += 1;
        const legacyRouteExists = legacyHash.route && routeOwners.has(legacyHash.route);
        const legacyAnchorExists =
          !legacyHash.anchor ||
          (legacyHash.route &&
            fragmentExists(
              fragmentTargetsByRoute.get(legacyHash.route) ?? new Set(),
              legacyHash.anchor,
            ));
        if (legacyRouteExists && legacyAnchorExists) {
          continue;
        }
        rawFailures.push({
          kind: legacyRouteExists ? "broken-fragment" : "broken-reference",
          sourceFile,
          sourceRoute,
          rawReference: reference.rawValue,
          resolvedTarget: legacyHash.route
            ? `${legacyHash.route}${legacyHash.anchor ? `#${legacyHash.anchor}` : ""}`
            : reference.rawValue,
          referenceType: "Broken legacy hash link",
          validationContext: reference.validationContext,
        });
        continue;
      }

      const parsedReference = parseReference(reference.rawValue);
      const pathname = parsedReference.pathname;
      if (
        (pathname === "." || pathname === "./") &&
        parsedReference.fragment === null
      ) {
        continue;
      }

      if (looksExternal(reference.rawValue)) {
        continue;
      }

      const isAnchorLink = reference.attribute === "href" && reference.tagName === "a";
      const pathForResolution = pathname || ".";
      const resolved = resolveReferencePath(relativePath, pathForResolution);
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
          validationContext: reference.validationContext,
        });
        continue;
      }

      checkedReferences += 1;
      const resolvedTarget = resolved.sitePath;
      const assetPath = normalizeAssetPath(resolvedTarget);
      const routePath = normalizeTargetRoute(resolvedTarget);
      const existsAsRoute = looksLikeHtmlRoute(pathForResolution) && routeOwners.has(routePath);
      const existsAsFile = fileSet.has(assetPath);

      if (existsAsRoute || existsAsFile) {
        if (
          isAnchorLink &&
          parsedReference.fragment !== null &&
          existsAsRoute &&
          !parsedReference.malformed
        ) {
          const targets = fragmentTargetsByRoute.get(routePath) ?? new Set();
          if (!fragmentExists(targets, parsedReference.fragment)) {
            rawFailures.push({
              kind: "broken-fragment",
              sourceFile,
              sourceRoute,
              rawReference: reference.rawValue,
              resolvedTarget: `${routePath}#${parsedReference.fragment}`,
              referenceType,
              validationContext: reference.validationContext,
            });
          }
        } else if (isAnchorLink && parsedReference.malformed) {
          rawFailures.push({
            kind: "broken-fragment",
            sourceFile,
            sourceRoute,
            rawReference: reference.rawValue,
            resolvedTarget: `${routePath}#${parsedReference.fragment ?? ""}`,
            referenceType,
            validationContext: reference.validationContext,
          });
        }
        continue;
      }

      rawFailures.push({
        kind: "broken-reference",
        sourceFile,
        sourceRoute,
        rawReference: reference.rawValue,
        resolvedTarget: looksLikeHtmlRoute(pathForResolution) ? routePath : assetPath,
        referenceType,
        validationContext: reference.validationContext,
      });
    }
  }

  const allowlist = buildAllowlist(
    await loadKnownIssues(resolvedKnownIssuesFile, includeFragmentAllowlist),
  );
  const failures = [];
  const allowlistedFailures = [];
  const failureFingerprints = [];

  for (const failure of rawFailures) {
    const formatted = formatFailure(failure);
    if (isAllowlistedFailure(failure, allowlist)) {
      allowlistedFailures.push(formatted);
      continue;
    }
    failures.push(formatted);
    if (failure.kind === "broken-reference" || failure.kind === "broken-fragment") {
      failureFingerprints.push({
        kind: failure.kind,
        sourceRoute: failure.sourceRoute,
        validationContext: failure.validationContext ?? null,
        rawReference: failure.rawReference,
        resolvedTarget: failure.resolvedTarget,
      });
    }
  }

  failures.sort((left, right) => left.localeCompare(right));
  allowlistedFailures.sort((left, right) => left.localeCompare(right));
  failureFingerprints.sort(
    (left, right) =>
      left.kind.localeCompare(right.kind) ||
      left.sourceRoute.localeCompare(right.sourceRoute) ||
      String(left.validationContext).localeCompare(String(right.validationContext)) ||
      left.rawReference.localeCompare(right.rawReference) ||
      left.resolvedTarget.localeCompare(right.resolvedTarget),
  );

  return {
    checkedFiles: relativeFiles.length,
    checkedPages: htmlFiles.length,
    checkedReferences,
    failureCount: failures.length,
    allowlistedFailureCount: allowlistedFailures.length,
    failures,
    failureFingerprints,
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

export async function updateKnownFragmentIssues(options = {}) {
  const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const knownIssuesFile = path.resolve(
    options.knownIssuesFile ?? path.join(siteRoot, "content-known-issues.json"),
  );
  const report = await collectValidationReport({
    ...options,
    knownIssuesFile,
    includeFragmentAllowlist: false,
  });
  const fragments = report.failureFingerprints.filter(
    (failure) => failure.kind === "broken-fragment",
  );
  const outputPath = path.join(path.dirname(knownIssuesFile), "content-known-fragments.json");
  await writeFile(outputPath, `${JSON.stringify(fragments, null, 2)}\n`, "utf8");
  return { outputPath, count: fragments.length };
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
    if (process.argv.includes("--update-known-fragments")) {
      console.log(JSON.stringify(await updateKnownFragmentIssues(), null, 2));
    } else {
      await runCli();
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
