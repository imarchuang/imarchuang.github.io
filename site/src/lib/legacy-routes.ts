export function legacyHashToPath(hash: string): string | null {
  if (!hash.startsWith("#/")) {
    return null;
  }

  const raw = hash.slice(2);
  const [routePart, query = ""] = raw.split("?");

  let decoded: string;

  try {
    decoded = decodeURIComponent(routePart).replace(/\.md$/i, "");
  } catch {
    return null;
  }

  if (decoded.split("/").some((part) => part === "..")) {
    return null;
  }

  if (!decoded || /^(README|index)$/i.test(decoded)) {
    return "/";
  }

  const normalized = decoded.replace(/\/index$/i, "").replace(/^\/+|\/+$/g, "");
  const rawAnchor = new URLSearchParams(query).get("id");
  let anchor = "";

  if (rawAnchor) {
    try {
      anchor = decodeURIComponent(rawAnchor).replace(/^#+/u, "");
    } catch {
      return null;
    }
  }

  return `/${normalized}/${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
}
