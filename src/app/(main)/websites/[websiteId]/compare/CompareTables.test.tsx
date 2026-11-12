import { fromZonedTime } from 'date-fns-tz';
import type { ReactNode } from 'react';
import { expect, test, vi } from 'vitest';
import { render } from '@/test/render';
import { CompareTables } from './CompareTables';

const TIMEZONE = 'Asia/Tokyo';
const compareStart = new Date('2026-07-23T00:00:00');
const compareEnd = new Date('2026-07-23T19:07:00');
const metricsTableProps: Record<string, any>[] = [];

const useDateRangeMock = vi.fn((_options?: { timezone?: string }) => ({
  dateRange: {
    startDate: new Date('2026-07-24T00:00:00'),
    endDate: new Date('2026-07-24T23:59:59.999'),
  },
  dateCompare: { compare: 'prev', startDate: compareStart, endDate: compareEnd },
}));

vi.mock('@umami/react-zen', async importOriginal => ({
  ...(await importOriginal<typeof import('@umami/react-zen')>()),
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ListItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/hooks', () => ({
  useDateRange: (options?: { timezone?: string }) => useDateRangeMock(options),
  useTimezone: () => ({ timezone: TIMEZONE, toUtc: (date: Date) => fromZonedTime(date, TIMEZONE) }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: new Proxy({}, { get: (_, key) => String(key) }),
  }),
  useNavigation: () => ({ router: { push: vi.fn() }, updateParams: () => '', query: {} }),
  useLocale: () => ({ locale: 'en-US' }),
}));

vi.mock('@/components/metrics/MetricsTable', () => ({
  MetricsTable: (props: Record<string, any>) => {
    metricsTableProps.push(props);
    return null;
  },
}));

// Regression test: the previous period used to be built from the browser's clock while the
// current period used the profile timezone, so the two windows were offset from each other.
test('queries the previous period in the profile timezone, like the current period', () => {
  render(<CompareTables websiteId="website-1" />);

  expect(useDateRangeMock).toHaveBeenCalledWith({ timezone: TIMEZONE });
  expect(metricsTableProps.find(props => props.params)?.params).toEqual({
    startAt: +fromZonedTime(compareStart, TIMEZONE),
    endAt: +fromZonedTime(compareEnd, TIMEZONE),
  });
});
