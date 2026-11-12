import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { useBarDrillDown } from './useBarDrillDown';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  updateParams: vi.fn((params: Record<string, unknown>) => params),
}));

vi.mock('./useNavigation', () => ({
  useNavigation: () => ({ router: { push: mocks.push }, updateParams: mocks.updateParams }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('zooms into the clicked bar and lets the new range pick its own unit', () => {
  // A kept unit=month would show the clicked month as a single bar and the next click would do nothing.
  const onBarClick = renderHook(() => useBarDrillDown('month', true)).result.current;

  onBarClick(new Date(2026, 2, 1));

  const [params] = mocks.updateParams.mock.calls[0];
  const start = new Date(2026, 2, 1).getTime();
  const end = new Date(2026, 2, 31, 23, 59, 59, 999).getTime();

  expect(params).toMatchObject({ date: `range:${start}:${end}` });
  // The keys must be present to override the current query params.
  expect(Object.keys(params)).toEqual(expect.arrayContaining(['offset', 'unit']));
  expect(params.unit).toBeUndefined();
  expect(mocks.push).toHaveBeenCalledWith(params);
});

test('is off unless the chart opts in', () => {
  // Shared charts also render on boards, links and pixels, which keep plain charts.
  expect(renderHook(() => useBarDrillDown('day', undefined)).result.current).toBeUndefined();
  expect(renderHook(() => useBarDrillDown('day', false)).result.current).toBeUndefined();
});

test.each(['hour', 'minute'])(
  'does not drill into %s bars, which are already the finest view',
  unit => {
    expect(renderHook(() => useBarDrillDown(unit, true)).result.current).toBeUndefined();
  },
);
