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
