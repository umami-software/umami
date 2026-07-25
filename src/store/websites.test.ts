import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { setWebsiteDateCompare, setWebsiteDateRange, useWebsites } from './websites';

beforeEach(() => {
  useWebsites.setState({}, true);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('setWebsiteDateRange', () => {
  test('creates a nested entry for a new website id', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const range = {
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
      value: '30day',
    };
    setWebsiteDateRange('website-1', range as any);

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateRange).toEqual({ ...range, modified: Date.now() });
  });

  test('stamps modified with the current time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-05T12:00:00.000Z'));

    setWebsiteDateRange('website-1', { value: '7day' } as any);

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateRange.modified).toBe(
      new Date('2026-05-05T12:00:00.000Z').getTime(),
    );
  });

  test('preserves an existing dateCompare when updating the range', () => {
    setWebsiteDateCompare('website-1', 'prev');
    setWebsiteDateRange('website-1', { value: '7day' } as any);

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateCompare).toBe('prev');
    expect(state['website-1'].dateRange.value).toBe('7day');
  });

  test('keeps date ranges for other websites independent', () => {
    setWebsiteDateRange('website-1', { value: '7day' } as any);
    setWebsiteDateRange('website-2', { value: '30day' } as any);

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateRange.value).toBe('7day');
    expect(state['website-2'].dateRange.value).toBe('30day');
  });

  test('overwrites a prior date range for the same website', () => {
    setWebsiteDateRange('website-1', { value: '7day' } as any);
    setWebsiteDateRange('website-1', { value: '30day' } as any);

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateRange.value).toBe('30day');
  });
});

describe('setWebsiteDateCompare', () => {
  test('creates a nested entry for a new website id', () => {
    setWebsiteDateCompare('website-1', 'prev');

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateCompare).toBe('prev');
  });

  test('preserves an existing dateRange when updating the compare', () => {
    setWebsiteDateRange('website-1', { value: '7day' } as any);
    setWebsiteDateCompare('website-1', 'yoy');

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateRange.value).toBe('7day');
    expect(state['website-1'].dateCompare).toBe('yoy');
  });

  test('overwrites a prior compare value', () => {
    setWebsiteDateCompare('website-1', 'prev');
    setWebsiteDateCompare('website-1', 'yoy');

    const state = useWebsites.getState() as any;
    expect(state['website-1'].dateCompare).toBe('yoy');
  });
});
