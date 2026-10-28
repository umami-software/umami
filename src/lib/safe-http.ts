import { lookup as dnsLookup } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import ipaddr from 'ipaddr.js';

export function isPublicAddress(address: string) {
  try {
    return ipaddr.process(address).range() === 'unicast';
  } catch {
    return false;
  }
}

/**
 * DNS lookup used at connect time. The address that passes the check is the address the socket
 * connects to, so a hostname cannot answer "public" for a pre-check and "private" for the request
 * (DNS rebinding).
 */
export function guardedLookup(hostname: string, options: any, callback: (...args: any[]) => void) {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) {
      return callback(err);
    }

    const list = addresses as unknown as { address: string; family: number }[];

    if (!list.length || !list.every(a => isPublicAddress(a.address))) {
      return callback(new Error('Host resolves to a non-public address'));
    }

    if (options?.all) {
      return callback(null, list);
    }

    callback(null, list[0].address, list[0].family);
  });
}

export interface SafeResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
  url: string;
}

/** One outbound HTTP(S) request to a public host. Does not follow redirects. */
export function safeRequest(
  rawUrl: string,
  {
    method = 'GET',
    headers = {},
    body,
    allowHttp = false,
    timeoutMs = 7000,
    maxBytes = 2_000_000,
  }: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    allowHttp?: boolean;
    timeoutMs?: number;
    maxBytes?: number;
  } = {},
): Promise<SafeResponse> {
  return new Promise((resolve, reject) => {
    let url: URL;

    try {
      url = new URL(rawUrl);
    } catch {
      return reject(new Error('Invalid URL'));
    }

    const okProtocol = url.protocol === 'https:' || (allowHttp && url.protocol === 'http:');

    if (!okProtocol || url.username || url.password) {
      return reject(new Error('URL must be http(s) without credentials'));
    }

    // IP literals skip DNS, so check them here.
    const literal = url.hostname.replace(/^\[|\]$/g, '');

    if (ipaddr.isValid(literal) && !isPublicAddress(literal)) {
      return reject(new Error('Host resolves to a non-public address'));
    }

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(
      url,
      { method, headers, lookup: guardedLookup as any, timeout: timeoutMs },
      res => {
        const chunks: Buffer[] = [];
        let received = 0;

        res.on('data', (chunk: Buffer) => {
          received += chunk.length;

          if (received > maxBytes) {
            res.destroy();
            return;
          }

          chunks.push(chunk);
        });
        res.on('close', () =>
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
            url: url.toString(),
          }),
        );
        res.on('error', reject);
      },
    );

    req.on('timeout', () => req.destroy(new Error('Timed out')));
    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}
