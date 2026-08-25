import { describe, expect, test } from "vitest";

import { legacyHashToPath } from "../src/lib/legacy-routes";

describe("legacyHashToPath", () => {
  test("translates legacy docsify hashes into safe site paths", () => {
    expect(legacyHashToPath("#/system/index")).toBe("/system/");
    expect(legacyHashToPath("#/coding/tree/bst?id=search")).toBe(
      "/coding/tree/bst/#search",
    );
    expect(legacyHashToPath("#/README")).toBe("/");
    expect(legacyHashToPath("#/")).toBe("/");
    expect(legacyHashToPath("#/../../escape")).toBeNull();
  });

  test("rejects non-docsify hashes and malformed escapes", () => {
    expect(legacyHashToPath("https://example.com")).toBeNull();
    expect(legacyHashToPath("#system/index")).toBeNull();
    expect(legacyHashToPath("#/%E0%A4%A")).toBeNull();
  });
});
