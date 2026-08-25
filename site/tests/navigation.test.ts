import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";
import { getNavigation, validateNavigation } from "../src/lib/navigation";

const generatedNavigationPath = path.resolve("src/generated/navigation.json");
let navigationBackup: string | null = null;

afterEach(async () => {
  if (navigationBackup === null) {
    await rm(generatedNavigationPath, { force: true });
    return;
  }

  await writeFile(generatedNavigationPath, navigationBackup, "utf8");
  navigationBackup = null;
});

describe("navigation", () => {
  test("loads generated navigation as an immutable typed tree", async () => {
    navigationBackup = await readFile(generatedNavigationPath, "utf8").catch(() => null);
    await writeFile(
      generatedNavigationPath,
      JSON.stringify([
        {
          title: "Guides",
          href: "/guides/",
          items: [
            {
              title: "Getting Started",
              href: "/guides/getting-started/",
              children: [],
            },
          ],
        },
      ]),
      "utf8",
    );

    const navigation = getNavigation();

    expect(navigation).toEqual([
      {
        title: "Guides",
        href: "/guides/",
        items: [
          {
            title: "Getting Started",
            href: "/guides/getting-started/",
            children: [],
          },
        ],
      },
    ]);
    expect(Object.isFrozen(navigation)).toBe(true);
    expect(Object.isFrozen(navigation[0])).toBe(true);
    expect(Object.isFrozen(navigation[0].items)).toBe(true);
    expect(Object.isFrozen(navigation[0].items[0])).toBe(true);
    expect(Object.isFrozen(navigation[0].items[0].children)).toBe(true);
  });

  test("rejects malformed generated navigation data", async () => {
    expect(() =>
      validateNavigation([
        {
          title: "Broken",
          href: "/broken/",
          items: [{ title: "Child", href: "/broken/child/" }],
        },
      ]),
    ).toThrow(/children/i);
  });
});
