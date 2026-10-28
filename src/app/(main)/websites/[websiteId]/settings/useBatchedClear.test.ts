import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { useBatchedClear } from './useBatchedClear';

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock('@/components/hooks', () => ({
  useApi: () => ({ post: postMock }),
}));

const months = [
  { startAt: 1, endAt: 2 },
  { startAt: 2, endAt: 3 },
  { startAt: 3, endAt: 4 },
];
const counts = (events: number, sessions = 0) => ({
  events,
  eventData: 0,
  sessions,
  revenue: 0,
  replays: 0,
  heatmaps: 0,
});

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

beforeEach(() => {
  postMock.mockReset();
});

test('deletes months in order and sums the returned counts', async () => {
  postMock
    .mockResolvedValueOnce(counts(10, 1))
    .mockResolvedValueOnce(counts(20, 2))
    .mockResolvedValueOnce(counts(30, 3));
  const { result } = renderHook(() => useBatchedClear('website-1'));

  await act(() => result.current.start(months));

  expect(postMock.mock.calls).toEqual(months.map(month => ['/websites/website-1/clear', month]));
  expect(result.current.status).toBe('done');
  expect(result.current.completed).toBe(3);
  expect(result.current.totals).toEqual(counts(60, 6));
});

test('stop finishes the current month, then stops', async () => {
  const first = deferred<ReturnType<typeof counts>>();
  postMock.mockReturnValueOnce(first.promise);
  const { result } = renderHook(() => useBatchedClear('website-1'));

  let running: Promise<void> = Promise.resolve();
  act(() => {
    running = result.current.start(months);
  });
  act(() => result.current.stop());
  expect(result.current.status).toBe('stopping');

  await act(async () => {
    first.resolve(counts(10));
    await running;
  });

  expect(postMock).toHaveBeenCalledTimes(1);
  expect(result.current.status).toBe('stopped');
  expect(result.current.completed).toBe(1);
});

test('retry resumes from the failed month', async () => {
  postMock
    .mockResolvedValueOnce(counts(10))
    .mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValueOnce(counts(20))
    .mockResolvedValueOnce(counts(30));
  const { result } = renderHook(() => useBatchedClear('website-1'));

  await act(() => result.current.start(months));

  expect(result.current.status).toBe('error');
  expect(result.current.error?.message).toBe('timeout');
  expect(result.current.current).toEqual(months[1]);

  await act(() => result.current.retry());

  expect(postMock.mock.calls.map(([, month]) => month)).toEqual([
    months[0],
    months[1],
    months[1],
    months[2],
  ]);
  expect(result.current.status).toBe('done');
  expect(result.current.totals.events).toBe(60);
});

test('ignores a second start while running', async () => {
  postMock.mockResolvedValue(counts(1));
  const { result } = renderHook(() => useBatchedClear('website-1'));

  await act(async () => {
    const first = result.current.start(months);
    const second = result.current.start(months);
    await Promise.all([first, second]);
  });

  expect(postMock).toHaveBeenCalledTimes(3);
});

test('warns before unload only while running', async () => {
  const first = deferred<ReturnType<typeof counts>>();
  postMock.mockReturnValueOnce(first.promise);
  const { result } = renderHook(() => useBatchedClear('website-1'));
  const unload = () => {
    const event = new Event('beforeunload', { cancelable: true });
    // Older browsers only show the prompt when returnValue is set.
    let returnValue: unknown;
    Object.defineProperty(event, 'returnValue', {
      get: () => returnValue,
      set: value => {
        returnValue = value;
      },
    });
    window.dispatchEvent(event);
    return event.defaultPrevented && returnValue === '';
  };

  let running: Promise<void> = Promise.resolve();
  act(() => {
    running = result.current.start([months[0]]);
  });
  expect(unload()).toBe(true);

  await act(async () => {
    first.resolve(counts(1));
    await running;
  });
  expect(unload()).toBe(false);
});
