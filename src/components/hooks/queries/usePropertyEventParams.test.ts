import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const getMock = vi.fn();
const useQueryMock = vi.fn(options => options);

vi.mock('../useApi', () => ({
  useApi: () => ({
    get: getMock,
    useQuery: useQueryMock,
  }),
}));

vi.mock('../useDateParameters', () => ({
  useDateParameters: () => ({
    startAt: 100,
    endAt: 200,
    unit: 'day',
    timezone: 'UTC',
  }),
}));

vi.mock('../useFilterParameters', () => ({
  useFilterParameters: () => ({
    event: 'eq.signup',
    country: 'US',
  }),
}));

import { DATA_TYPE } from '@/lib/constants';
import { OPERATORS } from '@/lib/constants';
import { usePropertyFieldsQuery } from './usePropertyFieldsQuery';
import { usePropertyValuesQuery } from './usePropertyValuesQuery';

describe('event property query params', () => {
  beforeEach(() => {
    getMock.mockReset();
    useQueryMock.mockClear();
  });

  test('keeps the selected event name when loading property values', async () => {
    renderHook(() =>
      usePropertyValuesQuery(
        'event',
        'website-1',
        'plan',
        DATA_TYPE.string,
        [{ propertyName: 'tier', dataType: DATA_TYPE.string, operator: OPERATORS.equals, value: 'pro' }],
        'signup',
      ),
    );

    const [{ queryFn }] = useQueryMock.mock.calls.at(-1) as [{ queryFn: () => Promise<unknown> }];

    await queryFn();

    expect(getMock).toHaveBeenCalledWith('/websites/website-1/event-data/values', {
      event: 'eq.signup',
      eventName: 'signup',
      country: 'US',
      startAt: 100,
      endAt: 200,
      unit: 'day',
      timezone: 'UTC',
      propertyName: 'plan',
      dataType: DATA_TYPE.string,
      pf_tier: `${DATA_TYPE.string}.${OPERATORS.equals}.pro`,
    });
  });

  test('keeps the selected event name when loading property fields', async () => {
    renderHook(() => usePropertyFieldsQuery('event', 'website-1', 'signup'));

    const [{ queryFn }] = useQueryMock.mock.calls.at(-1) as [{ queryFn: () => Promise<unknown> }];

    await queryFn();

    expect(getMock).toHaveBeenCalledWith('/websites/website-1/event-data/fields', {
      event: 'eq.signup',
      eventName: 'signup',
      country: 'US',
      startAt: 100,
      endAt: 200,
      unit: 'day',
      timezone: 'UTC',
    });
  });
});
