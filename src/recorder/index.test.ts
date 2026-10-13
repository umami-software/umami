import { afterEach, expect, test, vi } from 'vitest';

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

afterEach(() => {
  delete (window as TestWindow).umami;
  delete (window as TestWindow).umamiConfig;
  delete (window as TestWindow).normalizeUrl;
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

const flushHeatmap = async (fetchMock: ReturnType<typeof vi.fn>) => {
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  // the initial scroll event is queued once capture starts; beforeunload flushes it
  await vi.waitFor(() => {
    window.dispatchEvent(new Event('beforeunload'));
    expect(getSentPayloads(fetchMock, 'heatmap')).not.toHaveLength(0);
  });

  return getSentPayloads(fetchMock, 'heatmap').flatMap(payload => payload.events);
};

test('records the raw url when no transform is configured', async () => {
  const fetchMock = await loadRecorder();
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({ type: 'scroll', url: window.location.href });
});

test('applies a data-transform-url function to heatmap urls', async () => {
  (window as TestWindow).normalizeUrl = () => 'https://example.com/foo/:id';

  const fetchMock = await loadRecorder({ transformUrl: 'normalizeUrl' });
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({ type: 'scroll', url: 'https://example.com/foo/:id' });
});

test('applies umamiConfig.transformUrl to heatmap urls', async () => {
  (window as TestWindow).umamiConfig = { transformUrl: () => '/foo/:id' };

  const fetchMock = await loadRecorder();
  const events = await flushHeatmap(fetchMock);

  expect(events[0]).toMatchObject({ url: '/foo/:id' });
});

test('falls back to the raw url when the transform throws or returns a non-string', async () => {
  (window as TestWindow).umamiConfig = {
    transformUrl: () => {
      throw new Error('boom');
    },
  };

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
