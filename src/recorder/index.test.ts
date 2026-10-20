import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const rrweb = vi.hoisted(() => ({
  emit: null as ((event: unknown) => void) | null,
}));

vi.mock('rrweb', () => ({
  addCustomEvent: vi.fn(),
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

  delete (window as TestWindow).umami;
  delete (window as TestWindow).umamiConfig;
  delete (window as TestWindow).beforeSendHandler;
  delete (document as Document & { currentScript?: HTMLScriptElement | null }).currentScript;
  delete (document as Document & { readyState?: DocumentReadyState }).readyState;
  rrweb.emit = null;
  vi.unstubAllGlobals();
  vi.resetModules();
});

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

const click = async () => {
  await vi.waitFor(() => expect(getListener(document, 'click')).toBeTypeOf('function'));

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
};

const flushHeatmap = async (fetchMock: ReturnType<typeof vi.fn>) => {
  // let a before-send result settle, then beforeunload flushes the queue
  await Promise.resolve();
  await Promise.resolve();
  window.dispatchEvent(new Event('beforeunload'));

  return getHeatmapEvents(fetchMock);
};

test('sends heatmap events unchanged when no before-send is configured', async () => {
  const fetchMock = await loadRecorder();
  await click();
  const events = await flushHeatmap(fetchMock);

  expect(events.find(event => event.type === 'click')).toMatchObject({
    url: window.location.href,
    x: 10,
    y: 20,
  });
});

test('passes heatmap events through a data-before-send function', async () => {
  const beforeSendHandler = vi.fn((_type, event) => ({ ...event, url: 'https://example.com/a' }));
  (window as TestWindow).beforeSendHandler = beforeSendHandler;

  const fetchMock = await loadRecorder({ beforeSend: 'beforeSendHandler' });
  await click();
  const events = await flushHeatmap(fetchMock);

  expect(beforeSendHandler).toHaveBeenCalledWith(
    'heatmap',
    expect.objectContaining({ type: 'click', url: window.location.href, pageY: 20 }),
  );
  expect(events.find(event => event.type === 'click')).toMatchObject({
    url: 'https://example.com/a',
    x: 10,
    y: 20,
  });
});

test('drops a heatmap event when before-send returns a falsy value', async () => {
  (window as TestWindow).umamiConfig = {
    beforeSend: (_type: string, event: Record<string, unknown>) =>
      event.type === 'click' ? null : event,
  };

  const fetchMock = await loadRecorder();
  await click();
  const events = await flushHeatmap(fetchMock);

  expect(events.length).toBeGreaterThan(0);
  expect(events.some(event => event.type === 'click')).toBe(false);
});

test('applies umamiConfig.beforeSend and waits for a returned promise', async () => {
  (window as TestWindow).umamiConfig = {
    beforeSend: async (_type: string, event: Record<string, unknown>) => ({
      ...event,
      pageY: 520,
      pageH: 2000,
    }),
  };

  const fetchMock = await loadRecorder();
  await click();
  const events = await flushHeatmap(fetchMock);

  expect(events.find(event => event.type === 'click')).toMatchObject({ pageY: 520, pageH: 2000 });
});

test('data-before-send takes precedence over umamiConfig.beforeSend', async () => {
  const fromGlobal = vi.fn((_type, event) => event);
  (window as TestWindow).umamiConfig = { beforeSend: fromGlobal };
  (window as TestWindow).beforeSendHandler = (_type: string, event: Record<string, unknown>) => ({
    ...event,
    url: 'https://example.com/attr',
  });

  const fetchMock = await loadRecorder({ beforeSend: 'beforeSendHandler' });
  await click();
  const events = await flushHeatmap(fetchMock);

  expect(fromGlobal).not.toHaveBeenCalled();
  expect(events.find(event => event.type === 'click')).toMatchObject({
    url: 'https://example.com/attr',
  });
});

test('does not pass session replay events to before-send', async () => {
  const beforeSend = vi.fn((_type, event) => event);
  (window as TestWindow).umamiConfig = { beforeSend };

  const fetchMock = await loadRecorder({}, { replayEnabled: true });
  await vi.waitFor(() => expect(rrweb.emit).toBeTypeOf('function'));

  rrweb.emit?.({ type: 3, timestamp: Date.now(), data: { source: 1 } });
  window.dispatchEvent(new Event('pagehide'));

  expect(getSentPayloads(fetchMock, 'record').length).toBeGreaterThan(0);
  expect(beforeSend).not.toHaveBeenCalled();
});
