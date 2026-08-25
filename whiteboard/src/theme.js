const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";
const THEME_PREFERENCE = {
  SYSTEM: "system",
  EXPLICIT: "explicit",
};

export function getSystemTheme(matchMediaImpl = window.matchMedia) {
  if (typeof matchMediaImpl !== "function") {
    return "light";
  }

  return matchMediaImpl(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export function isThemePreference(value) {
  return (
    value === THEME_PREFERENCE.SYSTEM || value === THEME_PREFERENCE.EXPLICIT
  );
}

export { DARK_MEDIA_QUERY, THEME_PREFERENCE };
