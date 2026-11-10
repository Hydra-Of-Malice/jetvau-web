// Reads ?next= from the current URL and returns it only if it is a same-site path.
// Rejects absolute URLs and protocol-relative ones like //evil.com to prevent open redirects.
export function getSafeNextPath(fallback = "/") {
    if (typeof window === "undefined") return fallback;
    const next = new URLSearchParams(window.location.search).get("next");
    if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
        return fallback;
    }
    return next;
}
