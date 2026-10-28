import { safeRequest } from './safe-http';

export interface SiteCheckResult {
  found: boolean;
  url?: string;
  status?: number;
  reason?: 'unreachable' | 'blocked' | 'not-found' | 'wrong-site';
  detail?: string;
}

const MAX_BYTES = 2_000_000;

/** True when the HTML contains our loader tag pointing at this website id. */
export function htmlHasLoader(html: string, websiteId: string) {
  const tags = html.match(/<script\b[^>]*>/gi) || [];
  let sawLoader = false;

  for (const tag of tags) {
    if (!/\/w\.js(\?|["'\s>])/i.test(tag)) continue;
    sawLoader = true;
    const m = /data-website\s*=\s*["']?([0-9a-f-]{36})/i.exec(tag);
    if (m?.[1]?.toLowerCase() === websiteId.toLowerCase()) return 'ok' as const;
  }

  return sawLoader ? ('wrong-site' as const) : ('none' as const);
}

async function fetchText(start: string) {
  let url = start;

  for (let hop = 0; hop < 4; hop++) {
    // Every hop is pinned to a checked public address (no DNS rebinding, no private targets).
    const res = await safeRequest(url, {
      allowHttp: true,
      timeoutMs: 7000,
      maxBytes: MAX_BYTES,
      headers: { 'user-agent': 'umami-widget-check/1', accept: 'text/html' },
    });
    const location = res.headers.location;

    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, res.url).toString();
      continue;
    }

    return { status: res.status, url: res.url, html: res.body.toString('utf8') };
  }

  throw new Error('Too many redirects');
}

/** Loads the site's homepage and looks for the Umami widgets snippet. */
export async function checkWidgetInstall(
  domain: string,
  websiteId: string,
): Promise<SiteCheckResult> {
  const host = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const candidates = /^https?:\/\//i.test(domain)
    ? [domain]
    : [`https://${host}`, `http://${host}`];
  let lastError = '';

  for (const candidate of candidates) {
    try {
      const { status, url, html } = await fetchText(candidate);
      const verdict = htmlHasLoader(html, websiteId);

      if (verdict === 'ok') return { found: true, url, status };
      if (verdict === 'wrong-site') return { found: false, url, status, reason: 'wrong-site' };
      return { found: false, url, status, reason: 'not-found' };
    } catch (e: any) {
      lastError = e?.message || 'error';
      if (/public|http/.test(lastError)) {
        return { found: false, reason: 'blocked', detail: lastError };
      }
    }
  }

  return { found: false, reason: 'unreachable', detail: lastError };
}
