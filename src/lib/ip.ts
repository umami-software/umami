// The order here is important and influences how IPs are detected by lib/detect.ts
// Please do not change the order unless you know exactly what you're doing - read https://developers.cloudflare.com/fundamentals/reference/http-headers/
export const IP_ADDRESS_HEADERS = [
  'x-client-ip',
  'x-forwarded-for',
  'cf-connecting-ip', // This should be *after* x-forwarded-for, so that x-forwarded-for is respected if present
  'do-connecting-ip',
  'fastly-client-ip',
  'true-client-ip',
  'x-real-ip',
  'x-cluster-client-ip',
  'x-forwarded',
  'forwarded',
  'x-appengine-user-ip',
  'x-nf-client-connection-ip',
  'x-real-ip',
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
