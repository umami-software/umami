import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  delete (window as Window & { umami?: unknown }).umami;
  delete (window as Window & { umamiConfig?: unknown }).umamiConfig;
  delete (document as Document & { currentScript?: HTMLScriptElement | null }).currentScript;
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
