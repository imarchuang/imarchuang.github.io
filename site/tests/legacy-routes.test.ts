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
    expect(legacyHashToPath("#/coding/tree/index?id=%E0%A4%A")).toBeNull();
  });

  test("normalizes Chinese and encoded anchors without double encoding", () => {
    expect(legacyHashToPath("#/coding/dp/subsequence?id=最长递增子序")).toBe(
      "/coding/dp/subsequence/#%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F",
    );
    expect(
      legacyHashToPath(
        "#/coding/dp/subsequence?id=%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F",
      ),
    ).toBe(
      "/coding/dp/subsequence/#%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F",
    );
    expect(legacyHashToPath("#/coding/dp/subsequence?id=#最长递增子序")).toBe(
      "/coding/dp/subsequence/#%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F",
    );
  });
});
