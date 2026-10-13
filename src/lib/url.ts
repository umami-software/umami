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

export function hasMultipleHostnames(rows: { hostname?: string | null }[] = []) {
  let first: string | undefined;

  for (const { hostname } of rows) {
    if (!hostname) continue;
    if (first === undefined) first = hostname;
    else if (hostname !== first) return true;
  }

  return false;
}

export function formatUrlLabel(urlPath: string, hostname?: string | null, showHostname = false) {
  return showHostname && hostname ? `${hostname}${urlPath}` : urlPath;
}
