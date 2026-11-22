import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Regression tests for issue #4787: the tracker only hooked `history.pushState` /
// `history.replaceState`, so browser Back/Forward navigation (which fires `popstate`
// without touching those methods) and bfcache restores (`pageshow` with
// `persisted === true`) never recorded a page view.
//
// These tests live in their own file so the tracker module is imported exactly once
// per test. Two pieces of global state must be reset between tests:
//
//   1. `history.pushState`/`replaceState` are monkey-patched by the tracker at import
//      time. `vi.restoreAllMocks()` does NOT undo direct assignments, so we snapshot
//      and restore the originals manually to prevent wrapper accumulation.
//   2. The tracker registers `window` event listeners (`popstate`, `pageshow`,
//      `pagehide`) at import time. Because jsdom shares one `window` across the whole
//      file and `vi.resetModules()` re-imports a fresh module per test, those listeners
//      would accumulate; an old listener's `track` closure still calls the *global*
//      `fetch` (now the current test's mock), inflating the count. We spy on
//      `window.addEventListener` to capture every handler the tracker registers and
//      remove them all in `afterEach`.
//
// IMPORTANT: to prove the `popstate` listener works, the URL must change WITHOUT
// going through the hooked `pushState`/`replaceState` (otherwise the existing hook
// would produce the page view and the test would pass even without the fix). We use
// the captured `originalReplaceState` (the un-hooked native) to move the URL, then
// dispatch `popstate` — exactly what a real browser does on Back/Forward.

const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

let addedWindowListeners: Array<[string, EventListener]> = [];

const loadTracker = async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);

  // Capture every window listener the tracker registers so we can remove them later.
  const realAdd = window.addEventListener.bind(window);
  vi.spyOn(window, 'addEventListener').mockImplementation((
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    addedWindowListeners.push([type, handler as EventListener]);
    return realAdd(type, handler, options);
  });

  await import('./index');

  // Wait for the initial page view to flush.
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

  return fetchMock;
};

beforeEach(() => {
  addedWindowListeners = [];
  // Start every test from a known URL (using the un-hooked native so we don't
  // accidentally trigger a tracker page view before the test body runs).
  originalReplaceState.call(history, {}, '', '/a');
});

afterEach(() => {
  // Remove every window listener the tracker added so the next test starts clean.
  for (const [type, handler] of addedWindowListeners) {
    window.removeEventListener(type, handler);
  }
  addedWindowListeners = [];

  // Restore the original history methods so the next test's import wraps a clean slate.
  history.pushState = originalPushState;
  history.replaceState = originalReplaceState;

  delete (window as Window & { umami?: unknown }).umami;
  delete (window as Window & { umamiConfig?: unknown }).umamiConfig;
  delete (document as Document & { currentScript?: HTMLScriptElement | null }).currentScript;
  delete (document as Document & { readyState?: DocumentReadyState }).readyState;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('SPA history navigation (issue #4787)', () => {
  test('records a page view on browser Back/Forward (popstate)', async () => {
    const fetchMock = await loadTracker();

    // Move the URL the way a real browser does on Back/Forward: the URL changes
    // WITHOUT calling the hooked pushState/replaceState, then `popstate` fires.
    // Before the fix this produced NO page view (only the initial one).
    originalReplaceState.call(history, {}, '', '/b');
    window.dispatchEvent(new PopStateEvent('popstate'));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const lastRequest = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(lastRequest.payload.url).toContain('/b');
  });

  test('does not double count when a router calls replaceState during popstate', async () => {
    const fetchMock = await loadTracker();

    // Router navigates to /b via pushState (hooked -> page view #2).
    window.history.pushState({}, '', '/b');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // Back to /a: the browser changes the URL natively and fires popstate; the
    // router then calls replaceState with the same URL. The `currentUrl !== currentRef`
    // guard must ensure only ONE additional page view is recorded (not two).
    originalReplaceState.call(history, {}, '', '/a');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.history.replaceState({}, '', '/a');

    // Give any (incorrect) duplicate a chance to fire.
    await new Promise(resolve => setTimeout(resolve, 400));

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test('records a page view when a page is restored from the bfcache (pageshow persisted)', async () => {
    const fetchMock = await loadTracker();

    // A non-persisted pageshow (initial load) must not send an extra page view.
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }));
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // A persisted pageshow (restored from bfcache) must record a new page view.
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  test('bfcache restore reports the restored URL, not the stale one (review P1)', async () => {
    const fetchMock = await loadTracker();

    // Visit /a (initial), push /b -> tracker records /b.
    window.history.pushState({}, '', '/b');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // Simulate a bfcache restore that lands back on /a: the document's location is /a
    // but the tracker still thinks currentUrl is /b. The pageshow handler must report
    // /a (the authoritative restored URL), not the stale /b.
    originalReplaceState.call(history, {}, '', '/a');
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const restored = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(restored.payload.url).toContain('/a');

    // The popstate that follows the same traversal must NOT double count: the pageshow
    // handler already synchronized currentUrl to /a, so handlePush sees no change.
    window.dispatchEvent(new PopStateEvent('popstate'));
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test('does not auto-track bfcache restore when autoPageview is disabled (review P1)', async () => {
    // Load the tracker with auto-pageview disabled BEFORE import.
    const script = document.createElement('script');
    script.src = 'https://analytics.example.com/script.js';
    script.dataset.websiteId = 'website-id';
    script.dataset.autoPageview = 'false';
    Object.defineProperties(document, {
      currentScript: { configurable: true, value: script },
      readyState: { configurable: true, value: 'complete' },
    });

    const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
    vi.stubGlobal('fetch', fetchMock);

    const realAdd = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      addedWindowListeners.push([type, handler as EventListener]);
      return realAdd(type, handler, options);
    });

    await import('./index');
    // With auto-pageview off, the initial view is not sent automatically.
    await new Promise(resolve => setTimeout(resolve, 50));
    const baseline = fetchMock.mock.calls.length;

    // A persisted pageshow must NOT auto-fire a view when autoPageview is false.
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(fetchMock).toHaveBeenCalledTimes(baseline);
  });
});