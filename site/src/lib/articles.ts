import type { CollectionEntry } from "astro:content";

import type { NavigationItem, NavigationSection } from "./navigation";

export interface ArticleListItem {
  href: string;
  title: string;
}

export interface ArticleRoute {
  entryId: string;
  href: string;
  slug: string;
  previous: ArticleListItem | null;
  next: ArticleListItem | null;
}

export const RESERVED_ARTICLE_ROUTES = new Set(["/", "/about/"]);

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function normalizeHref(value: string): string {
  const trimmed = trimSlashes(value);
  return trimmed ? `/${trimmed}/` : "/";
}

function slugFromHref(href: string): string {
  return trimSlashes(href);
}

export function legacyPathToHref(legacyPath: string): string {
  const normalized = legacyPath.replace(/^#\/?/, "").replace(/\.md$/iu, "");
  const parts = trimSlashes(normalized)
    .split("/")
    .filter(Boolean)
    .filter((part, index, source) => !(index === source.length - 1 && /^(?:index|README)$/iu.test(part)));

  return normalizeHref(parts.join("/"));
}

function flattenItems(
  items: NavigationItem[],
  ordered: string[],
  navigationTitles: Map<string, string>,
) {
  for (const item of items) {
    const href = normalizeHref(item.href);
    ordered.push(href);
    navigationTitles.set(href, item.title);
    flattenItems(item.children, ordered, navigationTitles);
  }
}

function orderedNavigationHrefs(
  navigation: NavigationSection[],
  navigationTitles: Map<string, string>,
): string[] {
  const ordered: string[] = [];

  for (const section of navigation) {
    const href = normalizeHref(section.href);
    ordered.push(href);
    navigationTitles.set(href, section.title);
    flattenItems(section.items, ordered, navigationTitles);
  }

  return ordered;
}

export function buildArticleRoutes(
  entries: CollectionEntry<"notes">[],
  navigation: NavigationSection[],
  reservedRoutes: ReadonlySet<string> = RESERVED_ARTICLE_ROUTES,
): ArticleRoute[] {
  const entriesByHref = new Map<string, CollectionEntry<"notes">>();
  const navigationTitles = new Map<string, string>();

  for (const entry of entries) {
    const href = legacyPathToHref(entry.data.legacyPath);
    const existing = entriesByHref.get(href);
    if (existing) {
      throw new Error(
        `Duplicate article route "${href}" from "${existing.id}" and "${entry.id}"`,
      );
    }
    entriesByHref.set(href, entry);
  }

  const orderedHrefs: string[] = [];
  const seen = new Set<string>();

  for (const href of orderedNavigationHrefs(navigation, navigationTitles)) {
    if (reservedRoutes.has(href) || seen.has(href) || !entriesByHref.has(href)) {
      continue;
    }

    seen.add(href);
    orderedHrefs.push(href);
  }

  for (const href of [...entriesByHref.keys()].sort((left, right) => left.localeCompare(right))) {
    if (reservedRoutes.has(href) || seen.has(href)) {
      continue;
    }

    seen.add(href);
    orderedHrefs.push(href);
  }

  return orderedHrefs.map((href, index) => {
    const entry = entriesByHref.get(href);
    if (!entry) {
      throw new Error(`Missing article entry for "${href}"`);
    }

    const previousHref = orderedHrefs[index - 1] ?? null;
    const nextHref = orderedHrefs[index + 1] ?? null;

    return {
      entryId: entry.id,
      href,
      slug: slugFromHref(href),
      previous: previousHref
        ? {
            href: previousHref,
            title:
              navigationTitles.get(previousHref) ??
              entriesByHref.get(previousHref)?.data.title ??
              previousHref,
          }
        : null,
      next: nextHref
        ? {
            href: nextHref,
            title:
              navigationTitles.get(nextHref) ??
              entriesByHref.get(nextHref)?.data.title ??
              nextHref,
          }
        : null,
    };
  });
}
