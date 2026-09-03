const LOOPBACK_HOSTS = new Set(['127.0.0.1', '[::1]', 'localhost']);

export function parseUrl(value: unknown): URL | null {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isLoopbackUrl(url: URL) {
  return url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname);
}

/**
 * Redirect URIs must be valid absolute URLs without fragments. Non-loopback `http` is rejected;
 * custom schemes (native apps) and `https` are accepted.
 */
export function isAcceptableRedirectUri(value: unknown) {
  const url = parseUrl(value);

  if (!url || url.hash) {
    return false;
  }

  if (url.protocol === 'http:') {
    return isLoopbackUrl(url);
  }

  return true;
}

/**
 * Exact string comparison, except that loopback redirect URIs may vary the port
 * (RFC 8252 §7.3), since native clients bind an ephemeral port per authorization.
 */
export function redirectUriMatches(candidate: string, registered: string) {
  if (candidate === registered) {
    return true;
  }

  const left = parseUrl(candidate);
  const right = parseUrl(registered);

  if (!left || !right || !isLoopbackUrl(left) || !isLoopbackUrl(right)) {
    return false;
  }

  return (
    left.hostname === right.hostname &&
    left.pathname === right.pathname &&
    left.search === right.search
  );
}

export function findMatchingRedirectUri(candidate: string, registered: readonly string[]) {
  return registered.find(uri => redirectUriMatches(candidate, uri)) ?? null;
}

export function appendRedirectParams(
  redirectUri: string,
  params: Record<string, string | undefined>,
) {
  const url = new URL(redirectUri);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}
