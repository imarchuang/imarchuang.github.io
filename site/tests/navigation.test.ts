import { describe, expect, test } from "vitest";
import { freezeNavigation, getNavigation, validateNavigation } from "../src/lib/navigation";

describe("navigation", () => {
  test("freezes validated navigation trees", () => {
    const navigation = freezeNavigation(
      validateNavigation([
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
    );

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

  test("loads generated navigation as an immutable typed tree", () => {
    const navigation = getNavigation();
    expect(navigation.length).toBeGreaterThan(0);
    expect(Object.isFrozen(navigation)).toBe(true);
    expect(Object.isFrozen(navigation[0])).toBe(true);
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
