import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const rrweb = vi.hoisted(() => ({
  emit: null as ((event: unknown) => void) | null,
  customEvents: [] as { tag: string; payload: unknown }[],
}));

vi.mock('rrweb', () => ({
  addCustomEvent: vi.fn((tag: string, payload: unknown) => {
    rrweb.customEvents.push({ tag, payload });
  }),
  record: vi.fn(({ emit }) => {
    rrweb.emit = emit;
    return vi.fn();
  }),
}));

type TestWindow = Window & Record<string, unknown>;
type Listener = [EventTarget, string, EventListenerOrEventListenerObject, unknown];

const { pushState, replaceState } = history;
let listeners: Listener[] = [];

const trackListeners = (target: EventTarget) => {
  const original = target.addEventListener;

  vi.spyOn(target, 'addEventListener').mockImplementation(function (
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    listeners.push([target, type, listener, options]);
    return original.call(this, type, listener, options);
  });
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  trackListeners(window);
  trackListeners(document);
});

afterEach(() => {
  // each test imports a fresh recorder, so tear down everything the previous one attached
  vi.clearAllTimers();
  vi.useRealTimers();
  for (const [target, type, listener, options] of listeners) {
    target.removeEventListener(type, listener, options as boolean | EventListenerOptions);
  }
  listeners = [];
  vi.restoreAllMocks();
  history.pushState = pushState;
  history.replaceState = replaceState;
  history.replaceState(null, '', '/');

  delete (window as TestWindow).umami;
  delete (window as TestWindow).umamiConfig;
  delete (window as TestWindow).normalizeUrl;
  delete (document as Document & { currentScript?: HTMLScriptElement | null }).currentScript;
  delete (document as Document & { readyState?: DocumentReadyState }).readyState;
  rrweb.emit = null;
  rrweb.customEvents = [];
  vi.unstubAllGlobals();
  vi.resetModules();
});

const normalizeUrl = (url: string) => url.replace(/\/foo\/[^/?#]+/, '/foo/:id');

const loadRecorder = async (
  dataset: Record<string, string> = {},
  recorderConfig: Record<string, unknown> = { heatmapEnabled: true },
) => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/recorder.js';
  script.dataset.websiteId = 'website-id';
  Object.assign(script.dataset, dataset);

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  (window as TestWindow).umami = { getSession: () => ({ cache: 'cache-token' }) };

  const fetchMock = vi.fn((url: string) =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(
          url.endsWith('/recorder')
            ? { enabled: true, sampleRate: 1, heatmapSampleRate: 1, ...recorderConfig }
            : {},
        ),
    }),
  );
  vi.stubGlobal('fetch', fetchMock);

  await import('./index.js');

  return fetchMock;
};

const getSentPayloads = (fetchMock: ReturnType<typeof vi.fn>, type: string) =>
  fetchMock.mock.calls
    .filter(([url]) => String(url).endsWith('/api/record'))
    .map(([, init]) => JSON.parse(init.body))
    .filter(body => body.type === type)
    .map(body => body.payload);

const getHeatmapEvents = (fetchMock: ReturnType<typeof vi.fn>) =>
  getSentPayloads(fetchMock, 'heatmap').flatMap(payload => payload.events);

const getListener = (target: EventTarget, type: string) =>
  listeners.find(([t, ty]) => t === target && ty === type)?.[2] as
    | ((event: unknown) => void)
    | undefined;

const waitForHeatmapCapture = () =>
  vi.waitFor(() => expect(getListener(document, 'click')).toBeTypeOf('function'));

const flushHeatmap = async (fetchMock: ReturnType<typeof vi.fn>) => {
  await waitForHeatmapCapture();
  // the initial scroll event is queued once capture starts; beforeunload flushes it
  window.dispatchEvent(new Event('beforeunload'));

  return getHeatmapEvents(fetchMock);
};

test('records the raw url when no transform is configured', async () => {
  const fetchMock = await loadRecorder();
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({ type: 'scroll', url: window.location.href });
});

test('applies a data-transform-url function to heatmap urls', async () => {
  history.replaceState(null, '', '/foo/HM547WwgG');
  (window as TestWindow).normalizeUrl = normalizeUrl;

  const fetchMock = await loadRecorder({ transformUrl: 'normalizeUrl' });
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({
    type: 'scroll',
    url: `${window.location.origin}/foo/:id`,
  });
});

test('applies umamiConfig.transformUrl to heatmap urls', async () => {
  (window as TestWindow).umamiConfig = { transformUrl: () => '/foo/:id' };

  const fetchMock = await loadRecorder();
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({ url: '/foo/:id' });
});

test('applies the transform to heatmap click urls', async () => {
  history.replaceState(null, '', '/foo/HM547WwgG');
  (window as TestWindow).umamiConfig = { transformUrl: normalizeUrl };

  const fetchMock = await loadRecorder();
  await waitForHeatmapCapture();

  getListener(
    document,
    'click',
  )?.({
    isTrusted: true,
    button: 0,
    clientX: 10,
    clientY: 20,
    pageX: 10,
    pageY: 20,
    target: document.body,
  });
  window.dispatchEvent(new Event('beforeunload'));

  const click = getHeatmapEvents(fetchMock).find(event => event.type === 'click');

  expect(click).toMatchObject({ url: `${window.location.origin}/foo/:id`, x: 10, y: 20 });
});

test('falls back to the raw url when the transform throws', async () => {
  (window as TestWindow).umamiConfig = {
    transformUrl: () => {
      throw new Error('boom');
    },
  };

  const fetchMock = await loadRecorder();
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({ url: window.location.href });
});

test('falls back to the raw url when the transform returns a non-string', async () => {
  (window as TestWindow).umamiConfig = { transformUrl: () => undefined };

  const fetchMock = await loadRecorder();
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({ url: window.location.href });
});

test('applies the transform to the href of replay meta events', async () => {
  (window as TestWindow).umamiConfig = { transformUrl: () => 'https://example.com/foo/:id' };

  const fetchMock = await loadRecorder({}, { replayEnabled: true });

  await vi.waitFor(() => expect(rrweb.emit).toBeTypeOf('function'));

  rrweb.emit?.({
    type: 4,
    timestamp: Date.now(),
    data: { href: 'https://example.com/foo/HM547WwgG', width: 1280, height: 720 },
  });
  rrweb.emit?.({ type: 3, timestamp: Date.now(), data: { source: 1 } });
  window.dispatchEvent(new Event('pagehide'));

  const events = getSentPayloads(fetchMock, 'record').flatMap(payload => payload.events);

  expect(events[0]).toMatchObject({
    type: 4,
    data: { href: 'https://example.com/foo/:id', width: 1280, height: 720 },
  });
  expect(events[1]).toMatchObject({ type: 3, data: { source: 1 } });
});

test('emits url-change only when the transformed url changes', async () => {
  (window as TestWindow).umamiConfig = { transformUrl: normalizeUrl };

  await loadRecorder({}, { heatmapEnabled: true, replayEnabled: true });
  await waitForHeatmapCapture();
  await vi.waitFor(() => expect(rrweb.emit).toBeTypeOf('function'));

  const { origin } = window.location;

  history.pushState(null, '', '/foo/A');
  history.pushState(null, '', '/foo/B');
  history.pushState(null, '', '/bar');

  expect(rrweb.customEvents).toEqual([
    { tag: 'url-change', payload: { url: `${origin}/foo/:id` } },
    { tag: 'url-change', payload: { url: `${origin}/bar` } },
  ]);
});
