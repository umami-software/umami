import { expect, test, vi } from 'vitest';

// Tracker instances keep their history hooks and popstate listener for the life of the window,
// so this test lives in its own file (Vitest gives each file a fresh jsdom) to observe one tracker.
test('does not track page views for hash-only navigation', async () => {
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

  const page = window.location.href;

  await vi.waitFor(() => expect(pageviewUrls()).toEqual([page]));

  // Clicking an in-page anchor changes only the hash and fires popstate.
  window.location.hash = 'section';
  window.dispatchEvent(new Event('popstate'));

  // Wait past the tracker's 300ms pageview delay so an unwanted view would show up.
  await new Promise(resolve => setTimeout(resolve, 500));
  expect(pageviewUrls()).toEqual([page]);
});
