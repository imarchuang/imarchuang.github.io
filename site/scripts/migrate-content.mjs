import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const EXCLUDED = new Set([
  "_coverpage.md",
  "_navbar.md",
  "_sidebar.md",
  "_my404.md",
]);

const EXCLUDED_TOP_LEVEL_DIRS = new Set(["draw", "drops", "superpowers"]);
const SIDEBAR_NAME = "_sidebar.md";
const ASSET_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".avif",
]);

function toPosix(value) {
  return value.split(path.sep).join(path.posix.sep);
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, "");
}

function routeToUrl(route) {
  return route ? `/${trimSlashes(route)}/` : "/";
}

export function routeFor(relativePath) {
  const withoutExtension = relativePath.replace(/\.md$/i, "");
  return withoutExtension.replace(/(^|\/)(README|index)$/i, "").replace(/\/+/g, "/");
}

export function normalizeLegacyLinks(markdown) {
  return markdown
    .replace(/\s+':ignore'/g, "")
    .replace(/\]\(\/#\/([^)#?]+?)(?:\.md)?\)/g, "](/$1/)")
    .replace(/\]\(([^):#]+?)\.md(#[^)]+)?\)/g, "]($1/$2)");
}

function isMarkdownFile(relativePath) {
  return /\.md$/i.test(relativePath);
}

function isExcludedSource(relativePath) {
  return isGeneratedDirExcluded(relativePath) || isSupportMarkdown(relativePath);
}

function isGeneratedDirExcluded(relativePath) {
  const parts = relativePath.split("/");
  return EXCLUDED_TOP_LEVEL_DIRS.has(parts[0]);
}

function isSupportMarkdown(relativePath) {
  const baseName = path.posix.basename(relativePath);
  return EXCLUDED.has(baseName) || /^_sidebar\..+\.md$/iu.test(baseName);
}

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(absolutePath)));
      continue;
    }

    if (entry.isFile() && /\.md$/i.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function buildLegacyPath(relativePath) {
  return `#/${relativePath.replace(/\.md$/i, "")}`;
}

function outputPathFor(relativePath) {
  const normalized = toPosix(relativePath);
  if (/(^|\/)(README|index)\.md$/i.test(normalized)) {
    const route = trimSlashes(routeFor(normalized));
    return route ? `${route}/index.md` : "index.md";
  }

  return normalized;
}

function parseSimpleFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return null;
  }

  const data = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");

    if (/^-?\d+$/u.test(value)) {
      data[key] = Number(value);
      continue;
    }

    data[key] = value;
  }

  return {
    data,
    body: markdown.slice(match[0].length),
  };
}

function extractTitleAndBody(markdown) {
  const frontmatter = parseSimpleFrontmatter(markdown);

  if (frontmatter) {
    return {
      frontmatter: frontmatter.data,
      body: frontmatter.body,
      title:
        typeof frontmatter.data.title === "string" && frontmatter.data.title.trim()
          ? frontmatter.data.title.trim()
          : null,
    };
  }

  const headingMatch = markdown.match(/^\s*#\s+(.+?)\s*$/m);
  const title = headingMatch?.[1]?.trim() ?? null;

  if (!headingMatch || title === null) {
    return {
      frontmatter: {},
      body: markdown,
      title: null,
    };
  }

  const before = markdown.slice(0, headingMatch.index);
  const after = markdown.slice(headingMatch.index + headingMatch[0].length);
  const body = `${before}${after}`.replace(/^\s+/, "");

  return {
    frontmatter: {},
    body,
    title,
  };
}

function buildFrontmatterBlock(frontmatter) {
  const lines = ["---"];

  for (const [key, value] of Object.entries(frontmatter)) {
    if (typeof value === "number") {
      lines.push(`${key}: ${value}`);
      continue;
    }

    lines.push(`${key}: ${JSON.stringify(value ?? "")}`);
  }

  lines.push("---", "");
  return `${lines.join("\n")}`;
}

function createReferenceCandidates(reference) {
  const normalized = trimSlashes(reference.replace(/\.md$/i, ""));
  const candidates = new Set();

  if (normalized.length === 0) {
    candidates.add("");
    candidates.add("README");
    candidates.add("index");
    return [...candidates];
  }

  candidates.add(normalized);
  candidates.add(`${normalized}/index`);
  candidates.add(`${normalized}/README`);

  return [...candidates];
}

function buildRouteReferenceMap(sourceFiles) {
  const references = new Map();

  for (const relativePath of sourceFiles) {
    const route = trimSlashes(routeFor(relativePath));
    const url = routeToUrl(route);

    for (const key of createReferenceCandidates(relativePath)) {
      references.set(key, url);
    }
  }

  return references;
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function parseDocsifyHashHref(href) {
  if (!href.startsWith("/#/")) {
    return null;
  }

  const raw = href.slice(3);
  const [routePart, query = ""] = raw.split("?");
  const decoded = safeDecodeURIComponent(routePart);

  if (decoded === null) {
    return null;
  }

  const normalized = decoded.replace(/\.md$/i, "").replace(/^\/+|\/+$/g, "");
  if (normalized.split("/").some((part) => part === "..")) {
    return null;
  }

  const anchor = new URLSearchParams(query).get("id");
  return {
    reference: normalized,
    anchor: anchor ? `#${encodeURIComponent(anchor)}` : "",
  };
}

function looksExternal(href) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(href);
}

function looksLikeAsset(href) {
  const cleanHref = href.split("#")[0].split("?")[0].toLowerCase();
  return ASSET_EXTENSIONS.has(path.posix.extname(cleanHref));
}

function normalizePathForLookup(value) {
  const normalized = path.posix.normalize(value);

  if (
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    return null;
  }

  return trimSlashes(normalized.replace(/^\.\//, ""));
}

function parseTargetParts(rawTarget) {
  const [pathAndQuery, hash = ""] = rawTarget.split("#");
  const queryIndex = pathAndQuery.indexOf("?");
  const rawPath =
    queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : pathAndQuery.slice(queryIndex + 1);
  const queryParams = new URLSearchParams(query);
  const idAnchor = queryParams.get("id");
  const anchor = hash || (idAnchor ? encodeURIComponent(idAnchor) : "");

  return {
    rawPath,
    anchor,
  };
}

function resolveInternalReference(rawTarget, currentRelativePath, routeReferences) {
  const { rawPath, anchor } = parseTargetParts(rawTarget);

  if (!rawPath || rawPath === ".") {
    const currentRoute = trimSlashes(routeFor(currentRelativePath));
    return {
      url: `${routeToUrl(currentRoute)}${anchor ? `#${anchor}` : ""}`,
    };
  }

  if (rawPath.startsWith("/")) {
    const normalized = normalizePathForLookup(rawPath);
    if (normalized === null) {
      return null;
    }

    for (const candidate of createReferenceCandidates(normalized)) {
      const url = routeReferences.get(candidate);
      if (url) {
        return { url: `${url}${anchor ? `#${anchor}` : ""}` };
      }
    }

    return null;
  }

  const currentDirectory = path.posix.dirname(currentRelativePath);
  const fileRelative = normalizePathForLookup(path.posix.join(currentDirectory, rawPath));
  const rootRelative = normalizePathForLookup(rawPath.replace(/^\.\//, ""));
  const candidates = [];

  if (fileRelative !== null) {
    candidates.push(fileRelative);
  }
  if (rootRelative !== null && rootRelative !== fileRelative) {
    candidates.push(rootRelative);
  }

  for (const candidate of candidates) {
    for (const reference of createReferenceCandidates(candidate)) {
      const url = routeReferences.get(reference);
      if (url) {
        return { url: `${url}${anchor ? `#${anchor}` : ""}` };
      }
    }
  }

  return null;
}

function rewriteMarkdownLinks(markdown, currentRelativePath, routeReferences, issues) {
  const cleaned = markdown.replace(/\s+':ignore'/g, "");

  return cleaned.replace(/(!?\[[^\]]*]\()([^)]+)(\))/g, (match, prefix, href, suffix) => {
    if (prefix.startsWith("![") || looksExternal(href) || href.startsWith("#") || looksLikeAsset(href)) {
      return match;
    }

    if (href.startsWith("/draw/") || href.startsWith("/drops/")) {
      return `${prefix}${href}${suffix}`;
    }

    const docsifyHash = parseDocsifyHashHref(href);
    if (docsifyHash) {
      const resolved = resolveInternalReference(
        docsifyHash.reference,
        currentRelativePath,
        routeReferences,
      );
      if (!resolved) {
        issues.push({
          kind: "stale-link",
          source: currentRelativePath,
          target: href,
        });
        return match;
      }

      return `${prefix}${resolved.url}${docsifyHash.anchor}${suffix}`;
    }

    const hasMarkdownishTarget =
      href.endsWith(".md") ||
      href.includes(".md#") ||
      href.startsWith("./") ||
      href.startsWith("../") ||
      /^[^/][^:]*$/u.test(href);

    if (!hasMarkdownishTarget) {
      return match;
    }

    const resolved = resolveInternalReference(href, currentRelativePath, routeReferences);
    if (!resolved) {
      issues.push({
        kind: "stale-link",
        source: currentRelativePath,
        target: href,
      });
      return match;
    }

    return `${prefix}${resolved.url}${suffix}`;
  });
}

function parseSidebarDepth(line) {
  const indented = line.match(/^(\s*)([-*])\s+/);
  if (indented) {
    return Math.floor(indented[1].length / 2);
  }

  const compact = line.match(/^([*-]{1,6})\s+/);
  if (compact) {
    return compact[1].length - 1;
  }

  return null;
}

function parseSidebarHref(href, routeReferences) {
  const cleaned = href.replace(/\s+':ignore'/g, "");

  if (cleaned.startsWith("/draw/") || cleaned.startsWith("/drops/")) {
    return { href: cleaned, missing: false };
  }

  if (cleaned === "./" || cleaned === "/") {
    return { href: "/", missing: false };
  }

  if (cleaned.startsWith("/#/")) {
    const docsifyHash = parseDocsifyHashHref(cleaned);
    if (!docsifyHash) {
      return { href: cleaned, missing: true };
    }

    const resolved = resolveInternalReference(docsifyHash.reference, "README.md", routeReferences);
    if (!resolved) {
      return { href: cleaned, missing: true };
    }

    return { href: `${resolved.url}${docsifyHash.anchor}`, missing: false };
  }

  const trimmed = cleaned.replace(/\.md$/i, "");
  const normalized = normalizePathForLookup(trimmed.replace(/^\.\//, ""));

  if (normalized === null) {
    return { href: cleaned, missing: true };
  }

  const resolved = resolveInternalReference(normalized, "README.md", routeReferences);
  if (!resolved) {
    return { href: cleaned, missing: true };
  }

  return { href: resolved.url, missing: false };
}

function parseSidebar(sidebarMarkdown, routeReferences, issues, source = "_sidebar.md") {
  const root = [];
  const stack = [{ depth: -1, children: root }];

  for (const rawLine of sidebarMarkdown.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith("<!--")) {
      continue;
    }

    const depth = parseSidebarDepth(line);
    if (depth === null) {
      continue;
    }

    const linkMatch = line.match(/\[([^\]]+)]\(([^)]+)\)/);
    if (!linkMatch) {
      continue;
    }

    const title = linkMatch[1].trim();
    const rawHref = linkMatch[2].trim();
    const parsedHref = parseSidebarHref(rawHref, routeReferences);

    if (parsedHref.missing) {
      issues.push({
        kind: "stale-sidebar-link",
        source,
        target: rawHref,
      });
      continue;
    }

    const item = {
      title,
      href: parsedHref.href,
      children: [],
    };

    while (stack.at(-1).depth >= depth) {
      stack.pop();
    }

    stack.at(-1).children.push(item);
    stack.push({ depth, children: item.children });
  }

  return root;
}

function cloneNavigationItems(items) {
  return items.map((item) => ({
    title: item.title,
    href: item.href,
    children: cloneNavigationItems(item.children),
  }));
}

function findNavigationItemByHref(items, href) {
  for (const item of items) {
    if (item.href === href) {
      return item;
    }

    const nested = findNavigationItemByHref(item.children, href);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function mergeNavigationItems(existingItems, incomingItems) {
  const merged = cloneNavigationItems(existingItems);
  const indexByHref = new Map(merged.map((item, index) => [item.href, index]));

  for (const incoming of incomingItems) {
    const existingAnywhere = findNavigationItemByHref(merged, incoming.href);
    if (existingAnywhere) {
      existingAnywhere.children = mergeNavigationItems(
        existingAnywhere.children,
        incoming.children,
      );
      continue;
    }

    const existingIndex = indexByHref.get(incoming.href);

    if (existingIndex === undefined) {
      merged.push({
        title: incoming.title,
        href: incoming.href,
        children: cloneNavigationItems(incoming.children),
      });
      indexByHref.set(incoming.href, merged.length - 1);
      continue;
    }

    merged[existingIndex] = {
      ...merged[existingIndex],
      children: mergeNavigationItems(
        merged[existingIndex].children,
        incoming.children,
      ),
    };
  }

  return merged;
}

function flattenSectionSidebarItems(items, sectionHref) {
  const flattened = [];

  for (const item of items) {
    if (item.href === "/" || item.href === sectionHref) {
      flattened.push(...flattenSectionSidebarItems(item.children, sectionHref));
      continue;
    }

    flattened.push({
      title: item.title,
      href: item.href,
      children: flattenSectionSidebarItems(item.children, sectionHref),
    });
  }

  return flattened;
}

function collapseDuplicateSubtreeItems(items) {
  const seen = new Map();
  const collapsed = [];

  function appendCollapsed(targetItems, item) {
    const existing = seen.get(item.href);
    if (existing) {
      for (const child of item.children) {
        appendCollapsed(existing.children, child);
      }
      return;
    }

    const normalized = {
      title: item.title,
      href: item.href,
      children: [],
    };

    seen.set(normalized.href, normalized);
    targetItems.push(normalized);

    for (const child of item.children) {
      appendCollapsed(normalized.children, child);
    }
  }

  for (const item of items) {
    appendCollapsed(collapsed, item);
  }

  return collapsed;
}

async function mergeSectionSidebars({
  navigation,
  sourceDir,
  routeReferences,
  issues,
}) {
  const mergedNavigation = navigation.map((section) => ({
    title: section.title,
    href: section.href,
    items: cloneNavigationItems(section.items),
  }));

  const sectionDirs = mergedNavigation
    .map((section) => trimSlashes(section.href))
    .filter((sectionDir) => sectionDir.length > 0);

  for (const sectionDir of sectionDirs) {
    const sidebarPath = path.join(sourceDir, sectionDir, SIDEBAR_NAME);

    try {
      const sidebarStats = await stat(sidebarPath);
      if (!sidebarStats.isFile()) {
        continue;
      }

      const sectionIndex = mergedNavigation.findIndex(
        (section) => section.href === `/${sectionDir}/`,
      );

      if (sectionIndex === -1) {
        continue;
      }

      const parsedItems = parseSidebar(
        await readFile(sidebarPath, "utf8"),
        routeReferences,
        issues,
        `${sectionDir}/${SIDEBAR_NAME}`,
      );
      const flattenedItems = flattenSectionSidebarItems(
        parsedItems,
        mergedNavigation[sectionIndex].href,
      );
      const normalizedItems = collapseDuplicateSubtreeItems(flattenedItems);

      mergedNavigation[sectionIndex] = {
        ...mergedNavigation[sectionIndex],
        items: mergeNavigationItems(
          mergedNavigation[sectionIndex].items,
          normalizedItems,
        ),
      };
    } catch {
      continue;
    }
  }

  return mergedNavigation;
}

function deepSortIssues(issues) {
  return [...issues].sort((left, right) => {
    return (
      left.kind.localeCompare(right.kind) ||
      left.source.localeCompare(right.source) ||
      left.target.localeCompare(right.target)
    );
  });
}

function toNavigationSections(items) {
  return items.map((item) => ({
    title: item.title,
    href: item.href,
    items: item.children,
  }));
}

function ensureUniqueRoutes(relativePaths) {
  const seenRoutes = new Map();

  for (const relativePath of relativePaths) {
    const route = trimSlashes(routeFor(relativePath));
    if (!seenRoutes.has(route)) {
      seenRoutes.set(route, relativePath);
      continue;
    }

    throw new Error(
      `Duplicate generated slug "${route}" from "${seenRoutes.get(route)}" and "${relativePath}"`,
    );
  }
}

async function writeGeneratedNote({
  relativePath,
  absolutePath,
  notesDir,
  routeReferences,
  issues,
}) {
  const rawMarkdown = await readFile(absolutePath, "utf8");
  const extracted = extractTitleAndBody(rawMarkdown);
  const rewrittenBody = rewriteMarkdownLinks(
    extracted.body,
    relativePath,
    routeReferences,
    issues,
  );

  const frontmatter = {
    ...extracted.frontmatter,
    title: extracted.title ?? extracted.frontmatter.title ?? relativePath,
    description:
      typeof extracted.frontmatter.description === "string"
        ? extracted.frontmatter.description
        : "",
    legacyPath: buildLegacyPath(relativePath),
  };

  const output = `${buildFrontmatterBlock(frontmatter)}${rewrittenBody.replace(/^\n+/, "")}`;
  const targetPath = path.join(notesDir, outputPathFor(relativePath));

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, output, "utf8");
}

export async function migrateContent({
  sourceDir,
  notesDir,
  navigationFile,
  knownIssuesFile,
}) {
  const sourceFiles = (await listMarkdownFiles(sourceDir))
    .map((absolutePath) => toPosix(path.relative(sourceDir, absolutePath)))
    .sort((left, right) => left.localeCompare(right));

  const migrated = [];
  const excluded = [];
  const excludedSupport = [];
  const skippedGeneratedDir = [];

  for (const relativePath of sourceFiles) {
    if (!isMarkdownFile(relativePath)) {
      continue;
    }

    if (isGeneratedDirExcluded(relativePath)) {
      excluded.push(relativePath);
      skippedGeneratedDir.push(relativePath);
      continue;
    }

    if (isSupportMarkdown(relativePath)) {
      excluded.push(relativePath);
      excludedSupport.push(relativePath);
      continue;
    }

    migrated.push(relativePath);
  }

  ensureUniqueRoutes(migrated);

  const routeReferences = buildRouteReferenceMap(migrated);
  const issues = [];

  await rm(notesDir, { recursive: true, force: true });
  await mkdir(notesDir, { recursive: true });

  for (const relativePath of migrated) {
    await writeGeneratedNote({
      relativePath,
      absolutePath: path.join(sourceDir, relativePath),
      notesDir,
      routeReferences,
      issues,
    });
  }

  const rootSidebarPath = path.join(sourceDir, SIDEBAR_NAME);
  let navigation = [];

  try {
    const sidebarStats = await stat(rootSidebarPath);
    if (sidebarStats.isFile()) {
      const sidebar = await readFile(rootSidebarPath, "utf8");
      navigation = toNavigationSections(
        parseSidebar(sidebar, routeReferences, issues, SIDEBAR_NAME),
      );
      navigation = await mergeSectionSidebars({
        navigation,
        sourceDir,
        routeReferences,
        issues,
      });
    }
  } catch {
    navigation = [];
  }

  const sortedIssues = deepSortIssues(issues);

  await mkdir(path.dirname(navigationFile), { recursive: true });
  await writeFile(navigationFile, `${JSON.stringify(navigation, null, 2)}\n`, "utf8");
  await writeFile(knownIssuesFile, `${JSON.stringify(sortedIssues, null, 2)}\n`, "utf8");

  return {
    migratedCount: migrated.length,
    excludedCount: excluded.length,
    accountedCount: migrated.length + excludedSupport.length,
    supportExcludedCount: excludedSupport.length,
    generatedDirSkippedCount: skippedGeneratedDir.length,
    navigation,
    issues: sortedIssues,
  };
}

export async function runCli(overrides = {}) {
  const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

  const result = await migrateContent({
    sourceDir: overrides.sourceDir ?? path.resolve(siteRoot, "../docs"),
    notesDir: overrides.notesDir ?? path.resolve(siteRoot, "src/generated/notes"),
    navigationFile:
      overrides.navigationFile ?? path.resolve(siteRoot, "src/generated/navigation.json"),
    knownIssuesFile:
      overrides.knownIssuesFile ?? path.resolve(siteRoot, "content-known-issues.json"),
  });

  console.log(
    JSON.stringify(
      {
        migratedCount: result.migratedCount,
        excludedCount: result.excludedCount,
        accountedCount: result.accountedCount,
        supportExcludedCount: result.supportExcludedCount,
        generatedDirSkippedCount: result.generatedDirSkippedCount,
        issuesCount: result.issues.length,
      },
      null,
      2,
    ),
  );

  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runCli();
}
