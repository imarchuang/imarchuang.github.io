import { readFileSync } from "node:fs";

export interface NavigationItem {
  title: string;
  href: string;
  children: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  href: string;
  items: NavigationItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function freezeTree<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) {
      freezeTree(item);
    }

    return Object.freeze(value);
  }

  if (isRecord(value)) {
    for (const nested of Object.values(value)) {
      freezeTree(nested);
    }

    return Object.freeze(value);
  }

  return value;
}

function validateNavigationItem(value: unknown, label: string): NavigationItem {
  if (!isRecord(value)) {
    throw new TypeError(`${label} must be an object`);
  }

  if (typeof value.title !== "string") {
    throw new TypeError(`${label}.title must be a string`);
  }

  if (typeof value.href !== "string") {
    throw new TypeError(`${label}.href must be a string`);
  }

  if (!Array.isArray(value.children)) {
    throw new TypeError(`${label}.children must be an array`);
  }

  return {
    title: value.title,
    href: value.href,
    children: value.children.map((child, index) =>
      validateNavigationItem(child, `${label}.children[${index}]`),
    ),
  };
}

export function validateNavigation(value: unknown): NavigationSection[] {
  if (!Array.isArray(value)) {
    throw new TypeError("navigation must be an array");
  }

  return value.map((section, index) => {
    if (!isRecord(section)) {
      throw new TypeError(`navigation[${index}] must be an object`);
    }

    if (typeof section.title !== "string") {
      throw new TypeError(`navigation[${index}].title must be a string`);
    }

    if (typeof section.href !== "string") {
      throw new TypeError(`navigation[${index}].href must be a string`);
    }

    if (!Array.isArray(section.items)) {
      throw new TypeError(`navigation[${index}].items must be an array`);
    }

    return {
      title: section.title,
      href: section.href,
      items: section.items.map((item, itemIndex) =>
        validateNavigationItem(item, `navigation[${index}].items[${itemIndex}]`),
      ),
    };
  });
}

export function getNavigation(): NavigationSection[] {
  const raw = readFileSync(new URL("../generated/navigation.json", import.meta.url), "utf8");
  return freezeTree(validateNavigation(JSON.parse(raw)));
}
