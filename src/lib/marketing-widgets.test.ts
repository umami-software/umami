import { afterAll, describe, expect, test } from 'vitest';
import { assertSafeWebhookUrl } from './lead-delivery';
import {
  defaultConfig,
  originMatchesDomain,
  parseLead,
  widgetConfigSchema,
  widgetInputSchema,
} from './marketing-widgets';
import { rateLimit } from './rate-limit';

describe('parseLead', () => {
  test('callback needs a plausible phone and drops unknown fields', () => {
    expect(parseLead('callback', { name: ' Ann ', phone: '+1 (555) 123-4567', evil: 'x' })).toEqual(
      {
        name: 'Ann',
        phone: '+1 (555) 123-4567',
      },
    );
    expect(parseLead('callback', { phone: 'abc' })).toBeNull();
  });

  test('email/popup need a valid email', () => {
    expect(parseLead('email', { email: 'a@b.co' })).toEqual({ email: 'a@b.co' });
    expect(parseLead('email', { email: 'nope' })).toBeNull();
  });

  test('banners accept no leads', () => {
    expect(parseLead('banner', { email: 'a@b.co' })).toBeNull();
  });
});

describe('originMatchesDomain', () => {
  test('exact host or subdomain only', () => {
    expect(originMatchesDomain('https://shop.example.com/x', 'example.com')).toBe(true);
    expect(originMatchesDomain('https://example.com', 'example.com')).toBe(true);
    expect(originMatchesDomain('https://evilexample.com', 'example.com')).toBe(false);
    expect(originMatchesDomain('https://example.com.evil.io', 'example.com')).toBe(false);
    expect(originMatchesDomain(null, 'example.com')).toBe(false);
  });
});

describe('config schemas', () => {
  test('rejects non-http button links and bad colors', () => {
    expect(widgetConfigSchema.safeParse({ buttonUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(widgetConfigSchema.safeParse({ accent: 'red' }).success).toBe(false);
  });

  test('defaults parse for every type', () => {
    for (const t of ['callback', 'banner', 'popup', 'email'] as const) {
      expect(widgetConfigSchema.safeParse(defaultConfig(t)).success).toBe(true);
    }
  });

  test('widget input requires name and delivery defaults', () => {
    const r = widgetInputSchema.parse({ type: 'callback', name: 'x', config: {}, delivery: {} });
    expect(r.delivery.store).toBe(true);
    expect(r.delivery.telegram.enabled).toBe(false);
  });
});

describe('webhook SSRF guard', () => {
  test('blocks http, loopback and private addresses', async () => {
    await expect(assertSafeWebhookUrl('http://example.com/x')).rejects.toThrow();
    await expect(assertSafeWebhookUrl('https://127.0.0.1/x')).rejects.toThrow();
    await expect(assertSafeWebhookUrl('https://10.0.0.5/x')).rejects.toThrow();
    await expect(assertSafeWebhookUrl('https://169.254.169.254/latest')).rejects.toThrow();
    await expect(assertSafeWebhookUrl('https://user:pw@1.1.1.1/x')).rejects.toThrow();
  });
});

describe('rateLimit', () => {
  test('allows up to max then blocks', () => {
    const k = `t-${Math.random()}`;
    const r = [1, 2, 3, 4].map(() => rateLimit(k, 3, 60_000));
    expect(r).toEqual([true, true, true, false]);
  });
});

import { htmlHasLoader } from './site-check';

describe('htmlHasLoader', () => {
  const id = '713610e5-bbbc-4c51-8162-d9389e876ea6';

  test('finds the snippet for this website', () => {
    expect(
      htmlHasLoader(`<script async src="https://a.b/w.js" data-website="${id}"></script>`, id),
    ).toBe('ok');
    expect(
      htmlHasLoader(`<script data-website='${id}' src='https://a.b/w.js?x=1'></script>`, id),
    ).toBe('ok');
  });

  test('detects a snippet for another website, and no snippet', () => {
    expect(
      htmlHasLoader(
        '<script src="https://a.b/w.js" data-website="00000000-0000-0000-0000-000000000000"></script>',
        id,
      ),
    ).toBe('wrong-site');
    expect(htmlHasLoader('<script src="/app.js"></script>', id)).toBe('none');
  });
});

describe('assertPublicUrl', () => {
  test('rejects private hosts even over http when allowed', async () => {
    const { assertPublicUrl } = await import('./lead-delivery');
    await expect(assertPublicUrl('http://127.0.0.1/', true)).rejects.toThrow();
    await expect(assertPublicUrl('http://localhost/', true)).rejects.toThrow();
    await expect(assertPublicUrl('ftp://example.com/', true)).rejects.toThrow();
  });
});

import { guardedLookup, isPublicAddress, safeRequest } from './safe-http';

describe('safe-http', () => {
  test('classifies addresses', () => {
    expect(isPublicAddress('93.184.216.34')).toBe(true);
    for (const ip of [
      '127.0.0.1',
      '10.1.2.3',
      '192.168.0.1',
      '169.254.169.254',
      '::1',
      '100.64.0.1',
    ]) {
      expect(isPublicAddress(ip)).toBe(false);
    }
  });

  test('lookup refuses names that resolve to private addresses (checked at connect time)', async () => {
    await expect(
      new Promise((resolve, reject) =>
        guardedLookup('localhost', {}, (err: Error | null, ...rest: unknown[]) =>
          err ? reject(err) : resolve(rest),
        ),
      ),
    ).rejects.toThrow(/non-public/);
  });

  test('rejects private literals, bad protocols and credentials before any request', async () => {
    await expect(safeRequest('http://127.0.0.1:1/', { allowHttp: true })).rejects.toThrow();
    await expect(safeRequest('http://[::1]/', { allowHttp: true })).rejects.toThrow();
    await expect(safeRequest('http://example.com/')).rejects.toThrow();
    await expect(safeRequest('https://u:p@example.com/')).rejects.toThrow();
  });
});

import http from 'node:http';
import zlib from 'node:zlib';

describe('safeRequest transport', () => {
  const servers: http.Server[] = [];
  const serve = (handler: http.RequestListener) =>
    new Promise<string>(resolve => {
      const srv = http.createServer(handler).listen(0, '127.0.0.1', () => {
        servers.push(srv);
        resolve(`http://127.0.0.1:${(srv.address() as any).port}/`);
      });
    });

  afterAll(() => {
    for (const s of servers) s.close();
  });

  test('decodes gzip, deflate and brotli bodies', async () => {
    const html = '<script src="/w.js" data-website="abc"></script>';
    const cases: [string, Buffer][] = [
      ['gzip', zlib.gzipSync(html)],
      ['deflate', zlib.deflateSync(html)],
      ['br', zlib.brotliCompressSync(html)],
    ];

    for (const [enc, payload] of cases) {
      const url = await serve((_req, res) => {
        res.writeHead(200, { 'content-encoding': enc, 'content-type': 'text/html' });
        res.end(payload);
      });
      const r = await safeRequest(url, { allowHttp: true, unsafeAllowPrivate: true });
      expect(r.body.toString()).toBe(html);
    }
  });

  test('caps the decoded size', async () => {
    const url = await serve((_req, res) => {
      res.writeHead(200, { 'content-encoding': 'gzip' });
      res.end(zlib.gzipSync(Buffer.alloc(200_000, 97)));
    });
    const r = await safeRequest(url, { allowHttp: true, unsafeAllowPrivate: true, maxBytes: 1000 });
    expect(r.body.length).toBeLessThanOrEqual(1000 + 65536);
    expect(r.body.length).toBeLessThan(200_000);
  });

  test('absolute deadline: a peer that trickles bytes cannot hold the request open', async () => {
    const url = await serve((_req, res) => {
      res.writeHead(200, { 'content-type': 'text/html' });
      const t = setInterval(() => res.write('x'), 50);
      res.on('close', () => clearInterval(t));
    });
    const started = Date.now();
    await expect(
      safeRequest(url, { allowHttp: true, unsafeAllowPrivate: true, timeoutMs: 400 }),
    ).rejects.toThrow(/Timed out/);
    expect(Date.now() - started).toBeLessThan(2000);
  });
});
