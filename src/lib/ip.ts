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
    // Try stripping the port (IPv4:port, [IPv6]:port) and IPv6 brackets
    const stripped = unbracket(stripPort(ip));

    return stripped !== ip ? normalizeIp(stripped) : normalized;
  }
}

function unbracket(ip?: string | null) {
  return ip?.startsWith('[') && ip.endsWith(']') ? ip.slice(1, -1) : ip;
}

type IpRange = [ipaddr.IPv4 | ipaddr.IPv6, number];

// Shorthands accepted in TRUSTED_PROXIES
const TRUSTED_PROXY_PRESETS: Record<string, string[]> = {
  loopback: ['127.0.0.0/8', '::1/128'],
  linklocal: ['169.254.0.0/16', 'fe80::/10'],
  private: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', 'fc00::/7'],
};

let trustedProxyCache: { value: string; ranges: IpRange[] } | undefined;

/**
 * Parse TRUSTED_PROXIES: a comma-separated list of IPs, CIDR ranges and/or
 * presets (loopback, linklocal, private) belonging to proxies/load balancers
 * in front of Umami. Invalid entries are ignored.
 */
function getTrustedProxies() {
  const value = process.env.TRUSTED_PROXIES ?? '';

  if (trustedProxyCache?.value !== value) {
    const ranges = value
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .flatMap(entry => TRUSTED_PROXY_PRESETS[entry.toLowerCase()] ?? [entry])
      .flatMap((entry): IpRange[] => {
        try {
          if (entry.includes('/')) {
            return [ipaddr.parseCIDR(entry)];
          }

          const addr = ipaddr.process(entry);

          return [[addr, addr.kind() === 'ipv4' ? 32 : 128]];
        } catch {
          return [];
        }
      });

    trustedProxyCache = { value, ranges };
  }

  return trustedProxyCache.ranges;
}

function isTrustedProxy(ip?: string | null) {
  const ranges = getTrustedProxies();

  if (!ip || !ranges.length || !ipaddr.isValid(ip)) {
    return false;
  }

  const addr = ipaddr.process(ip);

  return ranges.some(range => addr.kind() === range[0].kind() && addr.match(range));
}

/**
 * Extract the `for=` node of each element of an RFC 7239 Forwarded header, e.g.
 * `for=192.0.2.43, for="[2001:db8:cafe::17]:4711";proto=https`.
 * Elements without `for=` are dropped. `unknown` and obfuscated (`_xyz`) nodes
 * become null: they are real hops, but carry no address.
 */
function parseForwarded(value: string) {
  return value.split(',').flatMap(element => {
    const pair = element
      .split(';')
      .map(param => param.trim())
      .find(param => param.toLowerCase().startsWith('for='));

    if (!pair) {
      return [];
    }

    const node = pair
      .slice(4)
      .trim()
      .replace(/^"(.*)"$/, '$1');

    return [!node || node.toLowerCase() === 'unknown' || node.startsWith('_') ? null : node];
  });
}

/**
 * Pick the client address from a proxy chain (ordered client -> nearest proxy).
 *
 * Without TRUSTED_PROXIES the leftmost entry is used. With TRUSTED_PROXIES the
 * chain is walked right to left, skipping trusted proxies, and the first
 * untrusted hop is returned. Entries left of that hop are client-supplied and
 * can't be trusted.
 */
function pickFromChain(chain: (string | null)[]) {
  const ips = chain.map(resolveIp);

  if (getTrustedProxies().length) {
    for (let i = ips.length - 1; i >= 0; i--) {
      if (!isTrustedProxy(ips[i])) {
        return ips[i];
      }
    }
  }

  // No trusted proxies configured, or every hop is a trusted proxy
  return ips.find(Boolean);
}

function parseHeaderValue(header: string, value: string) {
  if (header === 'x-forwarded-for') {
    return pickFromChain(
      value
        .split(',')
        .map(ip => ip.trim())
        .filter(Boolean),
    );
  }

  if (header === 'forwarded') {
    return pickFromChain(parseForwarded(value));
  }

  return resolveIp(value);
}

export function getIpAddress(headers: Headers) {
  const customHeader = process.env.CLIENT_IP_HEADER;

  if (customHeader && headers.get(customHeader)) {
    return parseHeaderValue(customHeader.toLowerCase(), headers.get(customHeader));
  }

  let fallback: string | null | undefined;

  for (const name of IP_ADDRESS_HEADERS) {
    const value = headers.get(name);

    if (!value) {
      continue;
    }

    const ip = parseHeaderValue(name, value);

    // A header holding a trusted proxy's address (e.g. x-real-ip set by an internal
    // hop) doesn't identify the client, so try the next one. Without TRUSTED_PROXIES
    // this never matches and the first present header wins.
    if (isTrustedProxy(ip)) {
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
