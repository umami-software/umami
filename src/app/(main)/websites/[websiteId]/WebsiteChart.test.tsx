import { beforeEach, expect, test, vi } from 'vitest';
import { render } from '@/test/render';
import { WebsiteChart } from './WebsiteChart';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  updateParams: vi.fn((params: Record<string, unknown>) => params),
  unit: 'day',
  chartProps: null as any,
}));

vi.mock('@/components/hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('@/components/hooks')>()),
  useTimezone: () => ({ timezone: 'UTC', fromUtc: (d: Date) => d, toUtc: (d: Date) => d }),
  useDateRange: () => ({
    dateRange: {
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 5, 30),
      unit: mocks.unit,
      value: '6month',
    },
  }),
  useDateParameters: () => ({ startAt: 0, endAt: 0 }),
  useNavigation: () => ({ router: { push: mocks.push }, updateParams: mocks.updateParams }),
  useWebsiteAnnotationsQuery: () => ({ data: null }),
}));

vi.mock('@/components/hooks/queries/useWebsitePageviewsQuery', () => ({
  useWebsitePageviewsQuery: () => ({
    data: { pageviews: [], sessions: [] },
    isLoading: false,
    isFetching: false,
    error: null,
  }),
}));

vi.mock('@/components/metrics/PageviewsChart', () => ({
  PageviewsChart: (props: any) => {
    mocks.chartProps = props;
    return null;
  },
}));

beforeEach(() => {
  mocks.push.mockClear();
  mocks.unit = 'day';
  mocks.chartProps = null;
});

test('makes bars clickable when the page opts in', () => {
  render(<WebsiteChart websiteId="website-1" allowBarDrill={true} />);

  expect(mocks.chartProps.onBarClick).toEqual(expect.any(Function));
});

test('keeps bar clicks off unless the page opts in', () => {
  // The same chart renders on links, pixels, compare and boards, which keep plain charts.
  render(<WebsiteChart websiteId="website-1" />);

  expect(mocks.chartProps.onBarClick).toBeUndefined();
});
