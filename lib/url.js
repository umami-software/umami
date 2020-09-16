export function removeTrailingSlash(url) {
  return url && url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
}

export function removeWWW(url) {
  return url && url.length > 1 && url.startsWith('www.') ? url.slice(4) : url;
}

export function getDomainName(str) {
  try {
    return new URL(str).hostname;
  } catch (e) {
    return str;
  }
}
