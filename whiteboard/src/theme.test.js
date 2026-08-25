import { describe, expect, it, vi } from "vitest";
import { getSystemTheme, isThemePreference, THEME_PREFERENCE } from "./theme";

describe("getSystemTheme", () => {
  it("returns dark when the OS prefers dark mode", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });

    expect(getSystemTheme(matchMedia)).toBe("dark");
  });

  it("returns light when the OS prefers light mode", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false });

    expect(getSystemTheme(matchMedia)).toBe("light");
  });

  it("validates persisted theme preference markers", () => {
    expect(isThemePreference(THEME_PREFERENCE.SYSTEM)).toBe(true);
    expect(isThemePreference(THEME_PREFERENCE.EXPLICIT)).toBe(true);
    expect(isThemePreference("legacy")).toBe(false);
  });
});
