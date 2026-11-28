import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DATA_TYPE } from '@/lib/constants';
import { getTestRouter, resetTestNavigation } from '@/test/navigation';
import { render, screen } from '@/test/render';
import { SessionProperties } from './SessionProperties';

const mockUseSessionDataPropertiesQuery = vi.fn();
const mockUseSessionDataActivityStatsQuery = vi.fn();

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();

  return {
    ...actual,
    useSessionDataPropertiesQuery: (...args: any[]) => mockUseSessionDataPropertiesQuery(...args),
    useSessionDataActivityStatsQuery: (...args: any[]) =>
      mockUseSessionDataActivityStatsQuery(...args),
  };
});

vi.mock('@/components/charts/PieChart', () => ({
  PieChart: ({ chartData }: { chartData: { labels: string[] } }) => (
    <div data-test="pie-chart">{chartData.labels.join(',')}</div>
  ),
}));

vi.mock('@/components/charts/DistributionBarChart', () => ({
  DistributionBarChart: ({
    datasets,
    stacked,
  }: {
    datasets: Array<{ label: string; values: number[] }>;
    stacked?: boolean;
  }) => (
    <div data-test="distribution-bar-chart" data-stacked={String(Boolean(stacked))}>
      {datasets.map(dataset => `${dataset.label}:${dataset.values.join(',')}`).join('|')}
    </div>
  ),
}));

vi.mock('@/components/property-data/PropertyNumericChart', () => ({
  PropertyNumericChart: () => <div data-test="numeric-chart" />,
}));

vi.mock('@/components/property-data/PropertyDateChart', () => ({
  PropertyDateChart: () => <div data-test="date-chart" />,
}));

describe('SessionProperties', () => {
  beforeEach(() => {
    resetTestNavigation();
    mockUseSessionDataPropertiesQuery.mockReset();
    mockUseSessionDataActivityStatsQuery.mockReset();

    mockUseSessionDataPropertiesQuery.mockReturnValue({
      data: [
        { propertyName: 'plan', dataType: DATA_TYPE.string, total: 10 },
        { propertyName: 'email', dataType: DATA_TYPE.string, total: 12 },
      ],
      isLoading: false,
      isFetching: false,
      error: undefined,
    });
  });

  test('lists tracked session properties on initial load and drills into Values and Breakdown tabs', async () => {
    mockUseSessionDataActivityStatsQuery.mockReturnValue({
      data: [
        { label: 'pro', sessions: 7, visits: 15, views: 60, events: 25, activity: 85 },
        { label: 'free', sessions: 3, visits: 4, views: 10, events: 2, activity: 12 },
      ],
      isLoading: false,
      isFetching: false,
      error: undefined,
    });

    const { user } = render(<SessionProperties websiteId="website-1" />, {
      route: '/websites/website-1/sessions/properties',
    });

    expect(screen.queryByRole('button', { name: /property filter/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'plan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'email' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'plan' }));

    expect(screen.getByRole('tab', { name: 'Values' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Breakdown' })).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toHaveTextContent('pro,free');
    expect(screen.getByRole('button', { name: 'pro' })).toBeInTheDocument();

    // Clicking a value updates the URL session property filter (spf0) in place.
    await user.click(screen.getByRole('button', { name: 'pro' }));
    expect(getTestRouter().push).toHaveBeenLastCalledWith(
      '/websites/website-1/sessions/properties?spf0=1.eq.plan.pro',
    );

    // Switching to Breakdown renders a single-metric (non-stacked) chart with a metric switcher.
    await user.click(screen.getByRole('tab', { name: 'Breakdown' }));
    const chart = screen.getByTestId('distribution-bar-chart');
    expect(chart).toHaveAttribute('data-stacked', 'false');
    expect(chart).toHaveTextContent('Visitors:7,3');

    await user.click(screen.getByRole('tab', { name: 'Views' }));
    expect(screen.getByTestId('distribution-bar-chart')).toHaveTextContent('Views:60,10');
  });

  test('omits the doughnut chart on Values for high-cardinality properties like email', async () => {
    mockUseSessionDataActivityStatsQuery.mockReturnValue({
      data: Array.from({ length: 12 }, (_, index) => ({
        label: `user${index}@example.com`,
        sessions: 1,
        visits: 1,
        views: index + 1,
        events: 0,
        activity: index + 1,
      })),
      isLoading: false,
      isFetching: false,
      error: undefined,
    });

    const { user } = render(<SessionProperties websiteId="website-1" />, {
      route: '/websites/website-1/sessions/properties',
    });

    await user.click(screen.getByRole('button', { name: 'email' }));

    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'user0@example.com' })).toBeInTheDocument();
  });
});
