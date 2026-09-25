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

test('sends engaged time only while the page is visible and focused', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.engagement = 'true';

  let visibilityState = 'visible';
  let focused = true;
  let now = 1000;

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
    visibilityState: { configurable: true, get: () => visibilityState },
  });
  vi.spyOn(document, 'hasFocus').mockImplementation(() => focused);
  vi.spyOn(performance, 'now').mockImplementation(() => now);

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  await import('./index');
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

  now = 3000;
  focused = false;
  window.dispatchEvent(new Event('blur'));

  now = 11000;
  focused = true;
  window.dispatchEvent(new Event('focus'));

  now = 14000;
  visibilityState = 'hidden';
  document.dispatchEvent(new Event('visibilitychange'));

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
    type: 'engagement',
    payload: { website: 'website-id', engagement: 5000 },
  });

  // Already reported, so leaving the page does not send it again
  window.dispatchEvent(new Event('pagehide'));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(fetchMock).toHaveBeenCalledTimes(2);

  // Sub-second intervals are held back and carried into the next report
  for (const end of [14600, 20600]) {
    now = end - 600;
    visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    now = end;
    visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
  }

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({
    type: 'engagement',
    payload: { engagement: 1200 },
  });

  delete (document as Document & { visibilityState?: string }).visibilityState;
  vi.restoreAllMocks();
});
