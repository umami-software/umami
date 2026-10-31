import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  delete (window as Window & { umami?: unknown }).umami;
  delete (document as Document & { currentScript?: HTMLScriptElement }).currentScript;
  delete (document as Document & { readyState?: DocumentReadyState }).readyState;
  vi.unstubAllGlobals();
  vi.resetModules();
});

test('identifies data-distinct-id before the initial page view', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.distinctId = 'visitor-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  const requests = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));

  expect(requests[0]).toMatchObject({
    type: 'identify',
    payload: { id: 'visitor-id', website: 'website-id' },
  });
  expect(requests[1]).toMatchObject({
    type: 'event',
    payload: { id: 'visitor-id', website: 'website-id' },
  });
});

const loadWithPerformance = async (entries: Record<string, unknown[]>, visibility: string) => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.performance = 'true';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: visibility });

  class FakeObserver {
    callback: (list: { getEntries: () => unknown[] }) => void;
    constructor(callback: FakeObserver['callback']) {
      this.callback = callback;
    }
    observe({ type }: { type: string }) {
      const list = entries[type] || [];
      this.callback({ getEntries: () => list });
    }
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('PerformanceObserver', FakeObserver);

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));

  await vi.waitFor(() =>
    expect(
      fetchMock.mock.calls.some(([, init]) => JSON.parse(init.body).type === 'performance'),
    ).toBe(true),
  );
  return fetchMock.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .filter(request => request.type === 'performance')
    .pop().payload;
};

test('ignores LCP and FCP from a page that loaded in a background tab', async () => {
  const payload = await loadWithPerformance(
    {
      paint: [{ name: 'first-contentful-paint', startTime: 45000 }],
      'largest-contentful-paint': [{ startTime: 45000 }],
    },
    'hidden',
  );

  expect(payload.lcp).toBeUndefined();
  expect(payload.fcp).toBeUndefined();
});

test('keeps LCP and FCP from a page that was visible when it painted', async () => {
  const payload = await loadWithPerformance(
    {
      paint: [{ name: 'first-contentful-paint', startTime: 300 }],
      'largest-contentful-paint': [{ startTime: 900 }],
    },
    'visible',
  );

  expect(payload.fcp).toBe(300);
  expect(payload.lcp).toBe(900);
});
