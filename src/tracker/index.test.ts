import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  delete (window as Window & { umami?: unknown }).umami;
  delete (document as Document & { currentScript?: HTMLScriptElement }).currentScript;
  delete (document as Document & { readyState?: DocumentReadyState }).readyState;
  delete (document as Document & { visibilityState?: DocumentVisibilityState }).visibilityState;
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

test('records LCP and FCP when page is loaded in foreground and paint occurs before being hidden', async () => {
  type ObserverCallback = (list: { getEntries: () => unknown[] }) => void;
  const observers: { type: string; callback: ObserverCallback }[] = [];

  class MockPerformanceObserver {
    private callback: ObserverCallback;
    constructor(callback: ObserverCallback) {
      this.callback = callback;
    }
    observe({ type }: { type: string }) {
      observers.push({ type, callback: this.callback });
    }
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal('PerformanceObserver', MockPerformanceObserver);

  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.performance = 'true';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
    visibilityState: { configurable: true, value: 'visible' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  // Trigger paint and largest-contentful-paint observers while visible
  const paintObserver = observers.find(o => o.type === 'paint');
  paintObserver?.callback({
    getEntries: () => [{ name: 'first-contentful-paint', startTime: 600 }],
  });

  const lcpObserver = observers.find(o => o.type === 'largest-contentful-paint');
  lcpObserver?.callback({
    getEntries: () => [{ startTime: 900 }],
  });

  // Switch to hidden, triggering sendPerformance
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));

  await vi.waitFor(() => {
    const perfCall = fetchMock.mock.calls.find(([, init]) => {
      const parsed = JSON.parse(init.body);
      return parsed.type === 'performance';
    });
    expect(perfCall).toBeDefined();
  });

  const perfPayload = fetchMock.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .find(r => r.type === 'performance')?.payload;

  expect(perfPayload).toMatchObject({
    fcp: 600,
    lcp: 900,
  });
});

test('discards LCP and FCP when page is loaded in a background tab', async () => {
  type ObserverCallback = (list: { getEntries: () => unknown[] }) => void;
  const observers: { type: string; callback: ObserverCallback }[] = [];

  class MockPerformanceObserver {
    private callback: ObserverCallback;
    constructor(callback: ObserverCallback) {
      this.callback = callback;
    }
    observe({ type }: { type: string }) {
      observers.push({ type, callback: this.callback });
    }
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal('PerformanceObserver', MockPerformanceObserver);

  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.performance = 'true';

  // Initially loaded in background tab
  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
    visibilityState: { configurable: true, value: 'hidden' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  // Paint deferred and fires after tab was already hidden from start
  const paintObserver = observers.find(o => o.type === 'paint');
  paintObserver?.callback({
    getEntries: () => [{ name: 'first-contentful-paint', startTime: 12000 }],
  });

  const lcpObserver = observers.find(o => o.type === 'largest-contentful-paint');
  lcpObserver?.callback({
    getEntries: () => [{ startTime: 15000 }],
  });

  // Trigger sendPerformance
  window.dispatchEvent(new Event('pagehide'));

  await vi.waitFor(() => {
    const perfCall = fetchMock.mock.calls.find(([, init]) => {
      const parsed = JSON.parse(init.body);
      return parsed.type === 'performance';
    });
    expect(perfCall).toBeDefined();
  });

  const perfPayload = fetchMock.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .find(r => r.type === 'performance')?.payload;

  expect(perfPayload.fcp).toBeUndefined();
  expect(perfPayload.lcp).toBeUndefined();
});

test('discards LCP and FCP when tab becomes hidden before paint fires', async () => {
  type ObserverCallback = (list: { getEntries: () => unknown[] }) => void;
  const observers: { type: string; callback: ObserverCallback }[] = [];

  class MockPerformanceObserver {
    private callback: ObserverCallback;
    constructor(callback: ObserverCallback) {
      this.callback = callback;
    }
    observe({ type }: { type: string }) {
      observers.push({ type, callback: this.callback });
    }
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal('PerformanceObserver', MockPerformanceObserver);

  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.performance = 'true';

  // Initially visible
  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
    visibilityState: { configurable: true, value: 'visible' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  // Tab becomes hidden at 300ms before paint
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  const event = new Event('visibilitychange');
  Object.defineProperty(event, 'timeStamp', { value: 300 });
  document.dispatchEvent(event);

  // Paint fires later at 2500ms
  const paintObserver = observers.find(o => o.type === 'paint');
  paintObserver?.callback({
    getEntries: () => [{ name: 'first-contentful-paint', startTime: 2500 }],
  });

  const lcpObserver = observers.find(o => o.type === 'largest-contentful-paint');
  lcpObserver?.callback({
    getEntries: () => [{ startTime: 3000 }],
  });

  await vi.waitFor(() => {
    const perfCall = fetchMock.mock.calls.find(([, init]) => {
      const parsed = JSON.parse(init.body);
      return parsed.type === 'performance';
    });
    expect(perfCall).toBeDefined();
  });

  const perfPayload = fetchMock.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .find(r => r.type === 'performance')?.payload;

  expect(perfPayload.fcp).toBeUndefined();
  expect(perfPayload.lcp).toBeUndefined();
});
