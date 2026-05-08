import { lookup as dnsLookup } from 'node:dns';
import ipaddr from 'ipaddr.js';
import { Agent, fetch as undiciFetch } from 'undici';

export interface OgMetadata {
  title?: string | null;
  description?: string | null;
  image?: string | null;
}

const FETCH_TIMEOUT_MS = 5000;
const MAX_HOPS = 3;
const MAX_BODY_BYTES = 1024 * 1024;
const HEAD_SLICE_FALLBACK_BYTES = 64 * 1024;

export function isPublicAddress(ip: string): boolean {
  let addr: ipaddr.IPv4 | ipaddr.IPv6;
  try {
    addr = ipaddr.parse(ip);
  } catch {
    return false;
  }
  // Unwrap IPv4-mapped IPv6 (::ffff:x.x.x.x) so the embedded IPv4 is checked.
  if (addr.kind() === 'ipv6' && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
    addr = (addr as ipaddr.IPv6).toIPv4Address();
  }
  // Default-deny: any range besides global unicast (incl. NAT64/6to4/teredo
  // transition prefixes that wrap private IPv4) is rejected.
  return addr.range() === 'unicast';
}

export const safeLookup = (hostname: string, options: any, callback: any) => {
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err);
    const safe = addresses.filter(a => isPublicAddress(a.address));
    if (safe.length === 0) {
      return callback(new Error('SSRF: hostname resolves to private/reserved address'));
    }
    // undici's `all: true` expects an array; otherwise (err, address, family).
    if (options?.all) {
      return callback(null, safe);
    }
    callback(null, safe[0].address, safe[0].family);
  });
};

const ssrfAgent = new Agent({ connect: { lookup: safeLookup as any } });

function isIpLiteralPrivate(hostname: string): boolean {
  const stripped = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;
  if (!ipaddr.isValid(stripped)) return false;
  return !isPublicAddress(stripped);
}

export function validateUrl(url: string): URL | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (isIpLiteralPrivate(u.hostname)) return null;
  return u;
}

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

// Reject surrogates and out-of-range code points so fromCodePoint never throws.
function safeFromCodePoint(code: number, fallback: string): string {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
    return fallback;
  }
  try {
    return String.fromCodePoint(code);
  } catch {
    return fallback;
  }
}

function decodeEntities(s: string): string {
  return s.replaceAll(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body) => {
    const lower = body.toLowerCase();
    if (lower.startsWith('#x')) {
      const code = Number.parseInt(lower.slice(2), 16);
      return safeFromCodePoint(code, match);
    }
    if (lower.startsWith('#')) {
      const code = Number.parseInt(lower.slice(1), 10);
      return safeFromCodePoint(code, match);
    }
    return ENTITY_MAP[lower] ?? match;
  });
}

function extractCharset(contentType: string | null): string {
  if (!contentType) return 'utf-8';
  const m = /charset\s*=\s*([^;]+)/i.exec(contentType);
  return m?.[1].trim().toLowerCase() ?? 'utf-8';
}

function isHtmlContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return /^text\/html\b/i.test(contentType.trim());
}

const META_PATTERNS = [
  /<meta\s+[^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?\s+content\s*=\s*["']([^"']*)["'][^>]*>/gi,
  /<meta\s+[^>]*?content\s*=\s*["']([^"']*)["'][^>]*?\s+(?:property|name)\s*=\s*["']([^"']+)["'][^>]*>/gi,
];

const TITLE_PATTERN = /<title[^>]*>([^<]*)<\/title>/i;
const APPLE_TOUCH_ICON_PATTERN =
  /<link\s+[^>]*?rel\s*=\s*["']apple-touch-icon[^"']*["'][^>]*?\s+href\s*=\s*["']([^"']+)["'][^>]*>|<link\s+[^>]*?href\s*=\s*["']([^"']+)["'][^>]*?\s+rel\s*=\s*["']apple-touch-icon[^"']*["'][^>]*>/i;

function parseMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const re of META_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null = re.exec(html);
    while (m !== null) {
      const key = re === META_PATTERNS[0] ? m[1] : m[2];
      const value = re === META_PATTERNS[0] ? m[2] : m[1];
      const lowerKey = key.toLowerCase();
      if (!(lowerKey in meta) && value) {
        meta[lowerKey] = decodeEntities(value);
      }
      m = re.exec(html);
    }
  }
  return meta;
}

function parseTitle(html: string): string | undefined {
  const m = TITLE_PATTERN.exec(html);
  return m ? decodeEntities(m[1]).trim() : undefined;
}

function parseAppleTouchIcon(html: string): string | undefined {
  const m = APPLE_TOUCH_ICON_PATTERN.exec(html);
  return m ? (m[1] ?? m[2]) : undefined;
}

function pickFromMeta(meta: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = meta[k];
    if (v) return v;
  }
  return undefined;
}

function truncate(s: string | undefined, max: number): string | undefined {
  if (!s) return s;
  return s.length > max ? s.slice(0, max) : s;
}

async function readBodyWithCap(response: import('undici').Response): Promise<Uint8Array | null> {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) {
          await reader.cancel().catch(() => {});
          return null;
        }
        chunks.push(value);
      }
    }
  } catch {
    // Stream/abort/decompression error — caller treats null as empty metadata.
    await reader.cancel().catch(() => {});
    return null;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function decodeBody(bytes: Uint8Array, charset: string): string {
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

export async function fetchOgMetadata(rawUrl: string): Promise<OgMetadata> {
  const initial = validateUrl(rawUrl);
  if (!initial) return {};

  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  let currentUrl: URL = initial;
  let response: import('undici').Response | null = null;

  for (let hop = 0; hop < MAX_HOPS; hop++) {
    try {
      response = await undiciFetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        dispatcher: ssrfAgent,
        signal,
        headers: {
          'user-agent': 'UmamiBot/1.0 (+link-preview)',
          accept: 'text/html',
        },
      });
    } catch {
      return {};
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      await response.body?.cancel().catch(() => {});
      if (!location) return {};
      let nextUrl: URL;
      try {
        nextUrl = new URL(location, currentUrl);
      } catch {
        return {};
      }
      const validatedNext = validateUrl(nextUrl.toString());
      if (!validatedNext) return {};
      currentUrl = validatedNext;
      continue;
    }

    if (response.status < 200 || response.status >= 300) {
      await response.body?.cancel().catch(() => {});
      return {};
    }

    break;
  }

  if (!response) return {};

  const contentType = response.headers.get('content-type');
  if (!isHtmlContentType(contentType)) {
    await response.body?.cancel().catch(() => {});
    return {};
  }

  // Decode/parse on attacker-controlled bytes — any throw degrades to empty.
  try {
    const bytes = await readBodyWithCap(response);
    if (!bytes) return {};

    const html = decodeBody(bytes, extractCharset(contentType));

    const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html);
    const headSlice = headMatch ? headMatch[1] : html.slice(0, HEAD_SLICE_FALLBACK_BYTES);

    const meta = parseMeta(headSlice);
    const titleTag = parseTitle(headSlice);
    const appleIcon = parseAppleTouchIcon(headSlice);

    const title = pickFromMeta(meta, ['og:title', 'twitter:title']) ?? titleTag;
    const description = pickFromMeta(meta, [
      'og:description',
      'twitter:description',
      'description',
    ]);
    const rawImage =
      pickFromMeta(meta, ['og:image:secure_url', 'og:image', 'twitter:image']) ?? appleIcon;

    let image: string | undefined;
    if (rawImage) {
      try {
        const resolved = new URL(rawImage, currentUrl).toString();
        // Re-validate after relative resolution: a hostile destination could
        // otherwise smuggle javascript:/file: or a private-IP literal here.
        if (validateUrl(resolved)) {
          image = resolved;
        }
      } catch {
        image = undefined;
      }
    }

    return {
      title: truncate(title?.trim() || undefined, 255) ?? null,
      description: truncate(description?.trim() || undefined, 500) ?? null,
      image: truncate(image, 2047) ?? null,
    };
  } catch {
    return {};
  }
}
