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

  // Fallback paint entries recorded after tab was hidden
  vi.spyOn(performance, 'getEntriesByType').mockImplementation(((type: string) => {
    if (type === 'paint') return [{ name: 'first-contentful-paint', startTime: 2500 }];
    if (type === 'largest-contentful-paint') return [{ startTime: 3000 }];
    return [];
  }) as unknown as typeof performance.getEntriesByType);

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

test('discards LCP and FCP when tab was loaded in background even if visible when tracker initializes', async () => {
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

  // Chromium visibility-state entry records page was hidden at start
  vi.spyOn(performance, 'getEntriesByType').mockImplementation(((type: string) => {
    if (type === 'visibility-state') {
      return [{ name: 'hidden', startTime: 0 }];
    }
    return [];
  }) as unknown as typeof performance.getEntriesByType);

  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.performance = 'true';

  // Visible at the moment tracker initializes (user switched to tab before tracker script ran)
  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
    visibilityState: { configurable: true, value: 'visible' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  // Deferred paints fire after tab became visible
  const paintObserver = observers.find(o => o.type === 'paint');
  paintObserver?.callback({
    getEntries: () => [{ name: 'first-contentful-paint', startTime: 4100 }],
  });

  const lcpObserver = observers.find(o => o.type === 'largest-contentful-paint');
  lcpObserver?.callback({
    getEntries: () => [{ startTime: 4300 }],
  });

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

test('does not accept deferred FCP/LCP after SPA history navigation on background-loaded page', async () => {
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

  // Loaded in background tab
  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
    visibilityState: { configurable: true, value: 'hidden' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  // SPA navigation occurs after becoming visible
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  window.history.pushState({}, '', '/new-page');

  // Deferred paints fire after navigation
  const paintObserver = observers.find(o => o.type === 'paint');
  paintObserver?.callback({
    getEntries: () => [{ name: 'first-contentful-paint', startTime: 3500 }],
  });

  const lcpObserver = observers.find(o => o.type === 'largest-contentful-paint');
  lcpObserver?.callback({
    getEntries: () => [{ startTime: 4000 }],
  });

  window.dispatchEvent(new Event('pagehide'));

  await vi.waitFor(() => {
    const perfCalls = fetchMock.mock.calls.filter(([, init]) => {
      const parsed = JSON.parse(init.body);
      return parsed.type === 'performance';
    });
    expect(perfCalls.length).toBeGreaterThan(0);
  });

  const perfPayloads = fetchMock.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .filter(r => r.type === 'performance')
    .map(r => r.payload);

  for (const payload of perfPayloads) {
    expect(payload.fcp).toBeUndefined();
    expect(payload.lcp).toBeUndefined();
  }
});
