const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function getSystemTheme(matchMediaImpl = window.matchMedia) {
  if (typeof matchMediaImpl !== "function") {
    return "light";
  }

  return matchMediaImpl(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export { DARK_MEDIA_QUERY };
