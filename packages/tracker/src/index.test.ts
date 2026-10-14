import { afterEach, expect, test, vi } from 'vitest';
import { createTracker } from './index';

const endpoint = 'https://analytics.example.com/api/send';

const stubFetch = () => {
  const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
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
