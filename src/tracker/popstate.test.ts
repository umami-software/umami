import { expect, test, vi } from 'vitest';

// Tracker instances keep their history hooks and popstate listener for the life of the window,
// so this test lives in its own file (Vitest gives each file a fresh jsdom) to observe one tracker.
test('tracks one page view per browser back/forward navigation (popstate)', async () => {
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

  const pageviewUrls = () =>
    fetchMock.mock.calls
      .map(([, init]) => JSON.parse(init.body))
      .filter(request => request.type === 'event' && request.payload?.url && !request.payload?.name)
      .map(request => request.payload.url as string);

  const pageA = window.location.href;
  const pageB = new URL('/page-b', pageA).href;

  await vi.waitFor(() => expect(pageviewUrls()).toEqual([pageA]));

  window.history.pushState({}, '', '/page-b');
  await vi.waitFor(() => expect(pageviewUrls()).toEqual([pageA, pageB]));

  window.history.back();
  await vi.waitFor(() => expect(pageviewUrls()).toEqual([pageA, pageB, pageA]));

  window.history.forward();
  await vi.waitFor(() => expect(pageviewUrls()).toEqual([pageA, pageB, pageA, pageB]));

  // Wait past the tracker's 300ms pageview delay so a duplicate view would show up.
  await new Promise(resolve => setTimeout(resolve, 500));
  expect(pageviewUrls()).toEqual([pageA, pageB, pageA, pageB]);
});
