import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

afterEach(() => {
  delete (window as Window & { umami?: unknown }).umami;
  delete (window as Window & { umamiConfig?: unknown }).umamiConfig;
  delete (document as Document & { currentScript?: HTMLScriptElement | null }).currentScript;
  delete (document as Document & { readyState?: DocumentReadyState }).readyState;
  delete (document as Document & { visibilityState?: DocumentVisibilityState }).visibilityState;
  delete (document as Document & { prerendering?: boolean }).prerendering;
  vi.restoreAllMocks();
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

const loadTracker = async (framed: boolean) => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);
  if (framed) vi.stubGlobal('top', {});
  window.name = 'umami.disabled';

  try {
    await import('./index');
    await window.umami.track('signup-button');
  } finally {
    window.name = '';
  }

  return fetchMock;
};

test('does not track when loaded in a frame named umami.disabled', async () => {
  expect(await loadTracker(true)).not.toHaveBeenCalled();
});

test('still tracks in a top-level window named umami.disabled', async () => {
  expect(await loadTracker(false)).toHaveBeenCalled();
});

test('ignores clicks dispatched on non-element targets', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  const errors: ErrorEvent[] = [];
  window.addEventListener('error', e => errors.push(e as ErrorEvent));

  document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  await new Promise(resolve => setTimeout(resolve, 0));

  expect(errors).toHaveLength(0);
});

test('configures tracker from umamiConfig only, with no data-* attributes', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  window.umamiConfig = {
    websiteId: 'global-website-id',
    tag: 'custom-tag',
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const [url, init] = fetchMock.mock.calls[0];
  const request = JSON.parse(init.body);

  expect(url).toBe('https://analytics.example.com/api/send');
  expect(init.headers['x-umami-website-id']).toBe('global-website-id');
  expect(request.payload).toMatchObject({
    website: 'global-website-id',
    tag: 'custom-tag',
  });
});

test('data-* attribute takes precedence over umamiConfig', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'attr-website-id';
  script.dataset.tag = 'attr-tag';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  window.umamiConfig = {
    websiteId: 'global-website-id',
    tag: 'global-tag',
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const [, init] = fetchMock.mock.calls[0];
  const request = JSON.parse(init.body);

  expect(init.headers['x-umami-website-id']).toBe('attr-website-id');
  expect(request.payload.website).toBe('attr-website-id');
  expect(request.payload.tag).toBe('attr-tag');
});

test('tracks when the hostname is in domains given as an array in umamiConfig', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  window.umamiConfig = {
    domains: ['other.com', location.hostname],
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
});

test('does not track when the hostname is not in domains given as an array in umamiConfig', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  window.umamiConfig = {
    domains: ['disallowed.com', 'other.com'],
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await new Promise(resolve => setTimeout(resolve, 50));
  expect(fetchMock).not.toHaveBeenCalled();
});

test('applies beforeSend given as a function in umamiConfig', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  const beforeSendFn = vi.fn((_type, payload) => ({
    ...payload,
    customProp: 'modified',
  }));

  window.umamiConfig = {
    beforeSend: beforeSendFn,
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(beforeSendFn).toHaveBeenCalledWith('event', expect.any(Object));
  const [, init] = fetchMock.mock.calls[0];
  const request = JSON.parse(init.body);
  expect(request.payload.customProp).toBe('modified');
});

test('applies beforeSend given as a string name in umamiConfig', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  const globalHook = vi.fn((_type, payload) => ({
    ...payload,
    fromWindowHook: true,
  }));
  (window as unknown as Record<string, unknown>).myBeforeSendHook = globalHook;

  window.umamiConfig = {
    beforeSend: 'myBeforeSendHook',
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(globalHook).toHaveBeenCalled();
  const [, init] = fetchMock.mock.calls[0];
  const request = JSON.parse(init.body);
  expect(request.payload.fromWindowHook).toBe(true);

  delete (window as unknown as Record<string, unknown>).myBeforeSendHook;
});

test('does not initialize when there is no currentScript and no hostUrl', async () => {
  Object.defineProperties(document, {
    currentScript: { configurable: true, value: null },
    readyState: { configurable: true, value: 'complete' },
  });

  window.umamiConfig = {
    websiteId: 'website-id',
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await new Promise(resolve => setTimeout(resolve, 50));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(window.umami).toBeUndefined();
});

test('initializes without currentScript when websiteId and hostUrl are provided in umamiConfig', async () => {
  Object.defineProperties(document, {
    currentScript: { configurable: true, value: null },
    readyState: { configurable: true, value: 'complete' },
  });

  window.umamiConfig = {
    websiteId: 'website-id',
    hostUrl: 'https://analytics.example.com',
  };

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe('https://analytics.example.com/api/send');
  expect(init.headers['x-umami-website-id']).toBe('website-id');
  expect(window.umami).toBeDefined();
});

const loadTrackerWithSalt = async (setup: (script: HTMLScriptElement) => void) => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  setup(script);

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  return JSON.parse(fetchMock.mock.calls[0][1].body).payload;
};

test('sends data-salt in the payload', async () => {
  const payload = await loadTrackerWithSalt(script => {
    script.dataset.salt = '2026-10-30';
  });

  expect(payload.salt).toBe('2026-10-30');
});

test('sends umamiConfig.salt in the payload', async () => {
  const payload = await loadTrackerWithSalt(() => {
    window.umamiConfig = { salt: '2026-10-30' };
  });

  expect(payload.salt).toBe('2026-10-30');
});

test('omits salt when it is not configured', async () => {
  const payload = await loadTrackerWithSalt(() => {});

  expect(payload).not.toHaveProperty('salt');
});

describe('data-salt-rotation', () => {
  // Wednesday
  const now = new Date('2026-11-04T15:30:00Z');

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([
    ['hourly', '2026-11-04T15'],
    ['daily', '2026-11-04'],
    ['weekly', '2026-11-01'],
    ['monthly', '2026-11'],
  ])('generates the salt for %s', async (rotation, expected) => {
    const payload = await loadTrackerWithSalt(script => {
      script.dataset.saltRotation = rotation;
    });

    expect(payload.salt).toBe(expected);
  });

  test('starts the week in the previous month when needed', async () => {
    vi.setSystemTime(new Date('2026-12-02T12:00:00Z'));

    const payload = await loadTrackerWithSalt(script => {
      script.dataset.saltRotation = 'weekly';
    });

    expect(payload.salt).toBe('2026-11-29');
  });

  test('reads umamiConfig.saltRotation', async () => {
    const payload = await loadTrackerWithSalt(() => {
      window.umamiConfig = { saltRotation: 'daily' };
    });

    expect(payload.salt).toBe('2026-11-04');
  });

  test('prefers an explicit salt', async () => {
    const payload = await loadTrackerWithSalt(script => {
      script.dataset.salt = 'explicit';
      script.dataset.saltRotation = 'daily';
    });

    expect(payload.salt).toBe('explicit');
  });

  test('omits salt for an unknown value', async () => {
    const payload = await loadTrackerWithSalt(script => {
      script.dataset.saltRotation = 'yearly';
    });

    expect(payload).not.toHaveProperty('salt');
  });

  test('rotates on a page that stays open', async () => {
    const payload = await loadTrackerWithSalt(script => {
      script.dataset.saltRotation = 'hourly';
    });
    expect(payload.salt).toBe('2026-11-04T15');

    vi.setSystemTime(new Date('2026-11-04T16:00:00Z'));
    const fetchMock = vi.mocked(fetch);
    await window.umami.track('later');

    const request = JSON.parse(fetchMock.mock.lastCall?.[1]?.body as string);
    expect(request.payload.salt).toBe('2026-11-04T16');
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

  // Trackers from earlier tests are still listening and send first, so read the last request
  const perfPayload = fetchMock.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .filter(r => r.type === 'performance')
    .pop()?.payload;

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
    .filter(r => r.type === 'performance')
    .pop()?.payload;

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
    .filter(r => r.type === 'performance')
    .pop()?.payload;

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
    .filter(r => r.type === 'performance')
    .pop()?.payload;

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

test('records LCP and FCP relative to activation for a prerendered page', async () => {
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

  // Prerendering reports the document as hidden until it is activated
  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
    prerendering: { configurable: true, value: true },
    visibilityState: { configurable: true, value: 'hidden' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');

  observers
    .find(o => o.type === 'navigation')
    ?.callback({ getEntries: () => [{ responseStart: 50, activationStart: 2000 }] });

  Object.defineProperties(document, {
    prerendering: { configurable: true, value: false },
    visibilityState: { configurable: true, value: 'visible' },
  });
  document.dispatchEvent(new Event('prerenderingchange'));
  document.dispatchEvent(new Event('visibilitychange'));

  observers
    .find(o => o.type === 'paint')
    ?.callback({
      getEntries: () => [{ name: 'first-contentful-paint', startTime: 1500 }],
    });
  observers
    .find(o => o.type === 'largest-contentful-paint')
    ?.callback({ getEntries: () => [{ startTime: 2300 }] });

  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));

  await vi.waitFor(() => {
    expect(
      fetchMock.mock.calls.some(([, init]) => JSON.parse(init.body).type === 'performance'),
    ).toBe(true);
  });

  const perfPayload = fetchMock.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .filter(r => r.type === 'performance')
    .pop()?.payload;

  expect(perfPayload).toMatchObject({ fcp: 0, lcp: 300 });
});
