const configuredBase = typeof import.meta.env === "undefined" ? undefined : import.meta.env.BASE_URL;
const basePath = typeof configuredBase === "string" ? configuredBase.trim() : "/";

/** Vite supplies the deployment directory; no browser globals are needed during SSR. */
export const SITE_BASE_URL = ("/" + basePath.replace(/^\/+|\/+$/g, "") + "/").replace(/\/{2,}/g, "/");

/** Resolve an internal URL once, preserving external URLs, protocols, queries and local anchors. */
export function siteUrl(path = ""): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;

  const suffixIndex = path.search(/[?#]/);
  const pathname = suffixIndex < 0 ? path : path.slice(0, suffixIndex);
  const suffix = suffixIndex < 0 ? "" : path.slice(suffixIndex);
  const relative = pathname.replace(/^(?:\.\/)+/, "").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
  const baseRelative = SITE_BASE_URL.slice(1);
  const baseStem = baseRelative.replace(/\/$/, "");

  if (SITE_BASE_URL !== "/") {
    if (relative === baseStem) return SITE_BASE_URL + suffix;
    if (relative.startsWith(baseRelative)) return "/" + relative + suffix;
  }
  return SITE_BASE_URL + relative + suffix;
}
