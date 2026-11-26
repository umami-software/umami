export function getQueryString(params: object = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !Number.isNaN(value)) {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
}

export function buildPath(path: string, params: object = {}): string {
  const queryString = getQueryString(params);
  return queryString ? `${path}?${queryString}` : path;
}

export function safeDecodeURI(s: string | undefined | null): string | undefined | null {
  if (s === undefined || s === null) {
    return s;
  }

  try {
    return decodeURI(s);
  } catch {
    return s;
  }
}

export function safeDecodeURIComponent(s: string | undefined | null): string | undefined | null {
  if (s === undefined || s === null) {
    return s;
  }

  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Schemes that run script or open content local to the visitor, never a page a link should open.
const BLOCKED_LINK_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];

/**
 * The destination rule for short links. Cloud links are public, so a bare IP address, which
 * hides who runs the destination, is refused there; a self-hosted link may point at an
 * internal host.
 */
export function isValidLinkUrl(url: string, cloudMode = false) {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  // The parser lowercases the scheme and strips tabs and newlines, so "JavaScript:" and
  // "java\tscript:" both arrive here as "javascript:".
  if (BLOCKED_LINK_SCHEMES.includes(parsed.protocol)) {
    return false;
  }

  // In "https://bank.com@evil.example" the visitor sees bank.com but lands on evil.example.
  if (parsed.username || parsed.password) {
    return false;
  }

  // The parser normalizes hex, octal and integer IPv4 forms to dotted decimal, and keeps IPv6
  // in brackets.
  if (
    cloudMode &&
    (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname) || parsed.hostname.startsWith('['))
  ) {
    return false;
  }

  return true;
}

/** The events page and its sub-pages (activity, properties). */
export function isEventsPagePath(pathname: string) {
  return /\/events(\/(activity|properties))?\/?$/.test(pathname);
}
