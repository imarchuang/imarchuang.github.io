import { describe, expect, it, vi } from "vitest";
import { getSystemTheme } from "./theme";

describe("getSystemTheme", () => {
  it("returns dark when the OS prefers dark mode", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });

    expect(getSystemTheme(matchMedia)).toBe("dark");
  });

  it("returns light when the OS prefers light mode", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false });

    expect(getSystemTheme(matchMedia)).toBe("light");
  });
});
