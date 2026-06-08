import ipaddr from 'ipaddr.js';

export const IP_ADDRESS_HEADERS = [
  ...(process.env.CLOUD_MODE ? ['x-umami-client-ip'] : []), // Umami custom header (cloud mode only)
  'true-client-ip', // CDN
  'cf-connecting-ip', // Cloudflare
  'fastly-client-ip', // Fastly
  'x-nf-client-connection-ip', // Netlify
  'do-connecting-ip', // Digital Ocean
  'x-real-ip', // Reverse proxy
  'x-appengine-user-ip', // Google App Engine
  'x-forwarded-for',
  'forwarded',
  'x-client-ip',
  'x-cluster-client-ip',
  'x-forwarded',
];

function normalizeIp(ip?: string | null) {
  if (!ip) return ip;

  try {
    const parsed = ipaddr.parse(ip);

    if (parsed.kind() === 'ipv6' && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
      return (parsed as ipaddr.IPv6).toIPv4Address().toString();
    }

    return parsed.toString();
  } catch {
    // Fallback: return original if parsing fails
    return ip;
  }
}

function resolveIp(ip?: string | null) {
  if (!ip) return ip;

  // First, try as-is
  const normalized = normalizeIp(ip);
  try {
    ipaddr.parse(normalized);
    return normalized;
  } catch {
    // try stripping port (handles IPv4:port; leaves IPv6 intact)
    const stripped = stripPort(ip);
    if (stripped !== ip) {
      const normalizedStripped = normalizeIp(stripped);
      try {
        ipaddr.parse(normalizedStripped);
        return normalizedStripped;
      } catch {
        return normalizedStripped;
      }
    }

    return normalized;
  }
}

/**
 * Detect private/internal addresses (RFC1918, loopback, link-local, CGNAT,
 * IPv6 unique-local) which can be injected by internal proxies or load
 * balancers and should not be treated as the real client IP.
 */
function isPrivateIp(ip: string) {
  try {
    const range = ipaddr.parse(ip).range();

    return (
      range === 'private' ||
      range === 'loopback' ||
      range === 'linkLocal' ||
      range === 'carrierGradeNat' ||
      range === 'uniqueLocal'
    );
  } catch {
    return false;
  }
}

/**
 * Extract a single candidate IP from a header value, handling the
 * comma-separated `x-forwarded-for` list and the `forwarded` syntax.
 */
function extractIp(header: string, value: string) {
  if (header === 'x-forwarded-for') {
    return value.split(',')?.[0]?.trim();
  }

  if (header === 'forwarded') {
    const match = value.match(/for=(\[?[0-9a-fA-F:.]+]?)/);

    return match ? match[1] : undefined;
  }

  return value;
}

export function getIpAddress(headers: Headers) {
  const customHeader = process.env.CLIENT_IP_HEADER;

  if (customHeader) {
    const value = headers.get(customHeader);

    if (value) {
      return resolveIp(extractIp(customHeader, value));
    }
  }

  // Check candidate headers in priority order. Skip private/internal addresses,
  // which can appear (e.g. in x-real-ip or forwarded) when a request passes
  // through internal proxies or load balancers, and fall through to the next
  // header that carries a public client IP.
  let fallback: string | null | undefined;

  for (const name of IP_ADDRESS_HEADERS) {
    const value = headers.get(name);

    if (!value) {
      continue;
    }

    const ip = resolveIp(extractIp(name, value));

    if (!ip) {
      continue;
    }

    if (isPrivateIp(ip)) {
      // Keep the first private match as a last resort, in case every candidate
      // header only carries a private address.
      fallback ??= ip;
      continue;
    }

    return ip;
  }

  return fallback;
}

export function stripPort(ip?: string | null) {
  if (!ip) {
    return ip;
  }

  if (ip.startsWith('[')) {
    const endBracket = ip.indexOf(']');
    if (endBracket !== -1) {
      return ip.slice(0, endBracket + 1);
    }
  }

  const idx = ip.lastIndexOf(':');
  if (idx !== -1) {
    if (ip.includes('.') || /^[a-zA-Z0-9.-]+$/.test(ip.slice(0, idx))) {
      return ip.slice(0, idx);
    }
  }

  return ip;
}
