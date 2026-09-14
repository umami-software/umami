import { afterEach, expect, test, vi } from 'vitest';

type MockResponse = { json: () => Promise<{ cache?: string }> };

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  return { promise: new Promise<T>(next => (resolve = next)), resolve };
};

afterEach(() => {
  delete (window as Window & { umami?: unknown }).umami;
  delete (window as Window & { beforeSend?: unknown }).beforeSend;
  delete (document as Document & { currentScript?: HTMLScriptElement }).currentScript;
  delete (document as Document & { readyState?: DocumentReadyState }).readyState;
  vi.unstubAllGlobals();
  vi.resetModules();
});

test('waits for beforeSend before same-document navigation but not for its fetch response', async () => {
  const script = document.createElement('script');
  script.src = 'https://analytics.example.com/script.js';
  script.dataset.websiteId = 'website-id';
  script.dataset.beforeSend = 'beforeSend';
  script.dataset.autoPageview = 'false';

  Object.defineProperties(document, {
    currentScript: { configurable: true, value: script },
    readyState: { configurable: true, value: 'complete' },
  });

  let releaseBeforeSend!: () => void;
  let beforeSendCalls = 0;
  const beforeSend = vi.fn((_type: string, payload: Record<string, unknown>) => {
    if (beforeSendCalls++ === 0) {
      return new Promise<Record<string, unknown>>(resolve => {
        releaseBeforeSend = () => resolve(payload);
      });
    }
    return payload;
  });

  const eventResponse = deferred<MockResponse>();
  const trackResponse = deferred<MockResponse>();
  const fetchMock = vi
    .fn()
    .mockReturnValueOnce(eventResponse.promise)
    .mockReturnValueOnce(trackResponse.promise);

  (window as Window & { beforeSend?: unknown }).beforeSend = beforeSend;
  vi.stubGlobal('fetch', fetchMock);
  await import('./index');

  const link = document.createElement('a');
  link.href = '#details';
  link.dataset.umamiEvent = 'navigate';
  document.body.append(link);

  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  expect(link.dispatchEvent(click)).toBe(false);
  expect(click.defaultPrevented).toBe(true);
  expect(window.location.hash).toBe('');
  expect(fetchMock).not.toHaveBeenCalled();

  releaseBeforeSend();
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(fetchMock.mock.calls[0][1]).toMatchObject({ keepalive: true });
  await vi.waitFor(() => expect(window.location.hash).toBe('#details'));

  eventResponse.resolve({ json: vi.fn().mockResolvedValue({ cache: 'cache-token' }) });
  await vi.waitFor(() => expect(window.umami.getSession().cache).toBe('cache-token'));

  let settled = false;
  const tracking = window.umami.track('after-navigation').then(() => {
    settled = true;
  });
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(settled).toBe(false);
  expect(fetchMock.mock.calls[1][1]).toMatchObject({
    keepalive: true,
    headers: expect.objectContaining({ 'x-umami-cache': 'cache-token' }),
  });

  trackResponse.resolve({ json: vi.fn().mockResolvedValue({}) });
  await tracking;
  expect(settled).toBe(true);
});
