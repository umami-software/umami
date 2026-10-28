import { lookup as dnsLookup } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
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

function decoderFor(encoding?: string) {
  switch ((encoding || '').trim().toLowerCase()) {
    case 'gzip':
    case 'x-gzip':
      return zlib.createGunzip();
    case 'deflate':
      return zlib.createInflate();
    case 'br':
      return zlib.createBrotliDecompress();
    default:
      return null;
  }
}

/** Reads a response body, decoding gzip/deflate/br, with a cap on the DECODED size. */
export function readBody(res: http.IncomingMessage, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const decoder = decoderFor(res.headers['content-encoding'] as string | undefined);
    const source: NodeJS.ReadableStream = decoder ? res.pipe(decoder) : res;
    const chunks: Buffer[] = [];
    let received = 0;
    let finished = false;

    const finish = (err?: Error) => {
      if (finished) return;
      finished = true;
      if (err) reject(err);
      else resolve(Buffer.concat(chunks));
    };

    source.on('data', (chunk: Buffer) => {
      received += chunk.length;

      if (received > maxBytes) {
        // Truncate: callers only need the beginning of a page.
        res.destroy();
        finish();
        return;
      }

      chunks.push(chunk);
    });
    source.on('end', () => finish());
    source.on('error', e => finish(e));
    res.on('error', e => finish(e));
    // 'close' can fire before a decoder has flushed; only treat it as a failure if the peer never
    // finished the response.
    res.on('close', () => {
      if (!res.complete) finish(new Error('Connection closed early'));
    });
  });
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
    unsafeAllowPrivate = false, // tests only: lets a loopback server stand in for a public host
  }: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    allowHttp?: boolean;
    timeoutMs?: number;
    maxBytes?: number;
    unsafeAllowPrivate?: boolean;
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

    if (!unsafeAllowPrivate && ipaddr.isValid(literal) && !isPublicAddress(literal)) {
      return reject(new Error('Host resolves to a non-public address'));
    }

    let settled = false;
    // Absolute deadline for the whole exchange: a peer trickling bytes cannot hold it open.
    const timer = setTimeout(() => req.destroy(new Error('Timed out')), timeoutMs);
    const done = (err: Error | null, value?: SafeResponse) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(value as SafeResponse);
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(
      url,
      {
        method,
        headers: { 'accept-encoding': 'gzip, deflate, br', ...headers },
        ...(unsafeAllowPrivate ? {} : { lookup: guardedLookup as any }),
      },
      res => {
        readBody(res, maxBytes).then(
          buf =>
            done(null, {
              status: res.statusCode || 0,
              headers: res.headers,
              body: buf,
              url: url.toString(),
            }),
          e => done(e),
        );
      },
    );

    req.on('error', e => done(e));

    if (body) {
      req.write(body);
    }

    req.end();
  });
}
