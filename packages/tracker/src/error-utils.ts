// Shared by the browser collector and server. Keep this module dependency-free.
export function scrubErrorText(value: string, limit = 2000): string {
  return value
    .slice(0, limit)
    .replace(/https?:\/\/[^\s)]+/g, url => {
      try {
        const location = url.match(/:\d+:\d+$/)?.[0] || '';
        const parsed = new URL(location ? url.slice(0, -location.length) : url);
        return `${parsed.origin}${parsed.pathname}${location}`;
      } catch {
        return '[url]';
      }
    })
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email]')
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, '[token]')
    .replace(
      /\b(password|secret|token|authorization|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
      '$1=[redacted]',
    )
    .slice(0, limit);
}

export function errorPagePath(value: string): string {
  try {
    return scrubErrorText(new URL(value, 'https://localhost').pathname, 500);
  } catch {
    return '/';
  }
}

export function scrubErrorTags(tags: Record<string, string> = {}): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tags)
      .slice(0, 20)
      .filter(([key]) => !/password|secret|token|authorization|cookie|email|api.?key/i.test(key))
      .map(([key, value]) => [scrubErrorText(key, 50), scrubErrorText(String(value), 200)]),
  );
}
