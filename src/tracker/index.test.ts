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

const clickTrackedLink = async (href: string, router?: (e: MouseEvent) => void) => {
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

  const link = document.createElement('a');
  link.href = href;
  link.dataset.umamiEvent = 'cta';
  document.body.appendChild(link);
  if (router) document.addEventListener('click', router, { once: true });

  const notPrevented = link.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true }),
  );

  await vi.waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: expect.stringContaining('"name":"cta"') }),
    ),
  );
  await new Promise(resolve => setTimeout(resolve, 0));
  link.remove();

  return notPrevented;
};

test('lets client-side routers handle navigation of tracked links', async () => {
  let routed = false;
  // Mimics SPA routers (SvelteKit, Next.js, Vue Router, Blazor), which skip
  // clicks that were already prevented and otherwise navigate themselves
  const router = (e: MouseEvent) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    routed = true;
  };

  await clickTrackedLink('#routed', router);

  expect(routed).toBe(true);
  expect(location.hash).not.toBe('#routed');
});

test('delays navigation of tracked links until the event is sent', async () => {
  const notPrevented = await clickTrackedLink('#plain');

  expect(notPrevented).toBe(false);
  await vi.waitFor(() => expect(location.hash).toBe('#plain'));
});
