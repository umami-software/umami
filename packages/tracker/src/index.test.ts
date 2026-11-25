import { afterEach, expect, test, vi } from 'vitest';
import { createTracker } from './index';

const endpoint = 'https://analytics.example.com/api/send';
const { pushState, replaceState } = history;

const stubFetch = () => {
  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  // Unhook the history methods of earlier trackers.
  Object.assign(history, { pushState, replaceState });
});

test('tracks the initial page view without a script tag', async () => {
  const fetchMock = stubFetch();

  createTracker({ websiteId: 'website-id', endpoint });

  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe(endpoint);
  expect(JSON.parse(init.body)).toMatchObject({
    type: 'event',
    payload: { website: 'website-id', url: location.href },
  });
});

test('sends nothing on its own when autoTrack is disabled', async () => {
  const fetchMock = stubFetch();

  const tracker = createTracker({ websiteId: 'website-id', endpoint, autoTrack: false, tag: 'v2' });

  await new Promise(resolve => setTimeout(resolve, 0));
  expect(fetchMock).not.toHaveBeenCalled();

  await tracker.track('signup', { plan: 'pro' });
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
    type: 'event',
    payload: { website: 'website-id', name: 'signup', data: { plan: 'pro' }, tag: 'v2' },
  });
});

test('keeps an identity set right after creation', async () => {
  const fetchMock = stubFetch();

  const tracker = createTracker({ websiteId: 'website-id', endpoint, distinctId: 'old-user' });
  await tracker.identify('new-user');
  await tracker.track('signup');

  const requests = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  expect(requests.at(-1)).toMatchObject({ type: 'event', payload: { id: 'new-user' } });
});

test('sees history changes made right after creation', async () => {
  vi.useFakeTimers();
  const fetchMock = stubFetch();
  const start = location.href;

  createTracker({ websiteId: 'website-id', endpoint });
  history.pushState(null, '', '/next');
  await vi.advanceTimersByTimeAsync(300);

  const urls = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).payload.url);
  expect(urls).toEqual([start, new URL('/next', start).href]);

  replaceState.call(history, null, '', start);
  vi.useRealTimers();
});
