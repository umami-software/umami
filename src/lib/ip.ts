export const IP_ADDRESS_HEADERS = [
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

export function getIpAddress(headers: Headers) {
  const customHeader = process.env.CLIENT_IP_HEADER;

  if (customHeader && headers.get(customHeader)) {
    return headers.get(customHeader);
  }

  const header = IP_ADDRESS_HEADERS.find(name => {
    return headers.get(name);
  });

  const ip = headers.get(header);

  if (header === 'x-forwarded-for') {
    return ip?.split(',')?.[0]?.trim();
  }

  if (header === 'forwarded') {
    const match = ip.match(/for=(\[?[0-9a-fA-F:.]+\]?)/);

    if (match) {
      return match[1];
    }
  }

  return ip;
}

export function stripPort(ip: string) {
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
