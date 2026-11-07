import { beforeEach, expect, test, vi } from 'vitest';
import { httpGet } from '@/lib/fetch';
import { render, screen, userEvent, waitFor } from '@/test/render';
import { GoogleAdsPage } from './GoogleAdsPage';

const subscription = vi.hoisted(() => ({
  current: { cloudMode: true, isLoading: false, hasFeature: (): boolean => true },
}));
const dateRange = vi.hoisted(() => ({ startDate: new Date(), endDate: new Date() }));

vi.mock('@/lib/fetch', () => ({ httpGet: vi.fn() }));
vi.mock('@/components/hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('@/components/hooks')>()),
  useWebsite: () => ({ teamId: null }),
  useSubscription: () => subscription.current,
  useTimezone: () => ({ timezone: 'UTC' }),
  useDateRange: () => ({ dateRange: { ...dateRange, unit: 'day' } }),
}));
vi.mock('@/app/(main)/websites/[websiteId]/WebsiteControls', () => ({
  WebsiteControls: () => <div data-test="controls" />,
}));
vi.mock('@/app/(main)/websites/[websiteId]/search-console/SearchConsoleChart', () => ({
  SearchConsoleChart: ({ rows }: { rows: unknown[] }) => <div>chart: {rows.length} days</div>,
}));

function row(overrides = {}) {
  return {
    key: 'key',
    name: 'name',
    parent: null,
    matchType: null,
    cost: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    conversionsValue: 0,
    ...overrides,
  };
}

function respondWith(byDimension: Record<string, unknown[]>, currencyCode: string | null = 'EUR') {
  vi.mocked(httpGet).mockImplementation(async (_url, params) => {
    const { dimension } = params as { dimension: string };

    return {
      ok: true,
      status: 200,
      data: { dimension, currencyCode, rows: byDimension[dimension] ?? [] },
    };
  });
}

function failWith(code: string, status: number) {
  vi.mocked(httpGet).mockResolvedValue({
    ok: false,
    status,
    data: { error: { code, status, message: 'Upstream message' } },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  subscription.current = { cloudMode: true, isLoading: false, hasFeature: () => true };
  dateRange.startDate = new Date('2026-01-01T00:00:00');
  dateRange.endDate = new Date('2026-01-07T23:59:59');
  // MetricCard animates up to its value unless motion is reduced.
  vi.spyOn(window, 'matchMedia').mockImplementation(
    query =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
});

test('shows the upgrade prompt and never asks Google without a subscription', () => {
  subscription.current = { cloudMode: true, isLoading: false, hasFeature: () => false };

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
  expect(httpGet).not.toHaveBeenCalled();
});

test('shows the upgrade prompt when Cloud rejects a stale plan', async () => {
  failWith('subscription_required', 403);

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
});

test('sends calendar dates to the Cloud endpoint', async () => {
  respondWith({ date: [] });

  render(<GoogleAdsPage websiteId="site-1" />);

  await waitFor(() =>
    expect(httpGet).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/integrations\/google-ads\/query$/),
      {
        websiteId: 'site-1',
        startDate: '2026-01-01',
        endDate: '2026-01-07',
        dimension: 'date',
        limit: 1000,
      },
    ),
  );
});

test('totals the daily rows in the account currency', async () => {
  respondWith({
    date: [
      row({
        key: '2026-01-01',
        cost: 10,
        clicks: 4,
        impressions: 100,
        conversions: 1.5,
      }),
      row({
        key: '2026-01-02',
        cost: 20,
        clicks: 6,
        impressions: 100,
        conversions: 1,
      }),
    ],
  });

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('chart: 2 days')).toBeInTheDocument();
  expect(screen.getByText('€30.00')).toBeInTheDocument(); // cost
  expect(screen.getByText('5.0%')).toBeInTheDocument(); // CTR: 10 / 200
  expect(screen.getByText('2.5')).toBeInTheDocument(); // fractional conversions
});

test('does not name a currency the account did not report', async () => {
  respondWith({ date: [row({ key: '2026-01-01', cost: 30, clicks: 1 })] }, null);

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('30.00')).toBeInTheDocument();
  expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
});

test('lists campaigns, then loads ad groups with their campaign and keywords with match type', async () => {
  respondWith({
    campaign: [row({ key: '1', name: 'Spring sale', cost: 12.5, clicks: 1, impressions: 4 })],
    ad_group: [row({ key: '2', name: 'Shoes', parent: 'Spring sale' })],
    keyword: [row({ key: '2~3', name: 'red shoes', parent: 'Shoes', matchType: 'EXACT' })],
  });
  const user = userEvent.setup();

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('Spring sale')).toBeInTheDocument();
  expect(screen.getByText('€12.50')).toBeInTheDocument();
  expect(screen.getByText('25.0%')).toBeInTheDocument();

  await user.click(screen.getByRole('tab', { name: 'Ad groups' }));
  expect(await screen.findByText('Shoes')).toBeInTheDocument();
  expect(screen.getByText('Spring sale')).toBeInTheDocument();

  await user.click(screen.getByRole('tab', { name: 'Keywords' }));
  expect(await screen.findByText('red shoes')).toBeInTheDocument();
  expect(screen.getByText('Shoes · Exact match')).toBeInTheDocument();
});

test.each([
  ['not_connected', 404, 'Connect Google Ads'],
  ['account_not_set', 409, 'Choose a Google Ads account'],
  ['manager_account', 400, 'Choose a Google Ads account'],
  ['authentication', 401, 'Reconnect Google Ads'],
  ['permission', 403, 'Google Ads account unavailable'],
])('sends %s to integration settings', async (code, status, title) => {
  failWith(code, status);

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText(title)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Manage integrations' })).toBeInTheDocument();
});

test('shows a generic error for failures the customer cannot fix, without the upstream text', async () => {
  failWith('unavailable', 502);

  render(<GoogleAdsPage websiteId="site-1" />);

  await waitFor(() =>
    expect(screen.getAllByText('Something went wrong.').length).toBeGreaterThan(0),
  );
  expect(screen.queryByText('Upstream message')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Manage integrations' })).not.toBeInTheDocument();
});

test('allows the longest range Cloud accepts', async () => {
  respondWith({ date: [] });
  dateRange.startDate = new Date('2024-01-01T00:00:00');
  dateRange.endDate = new Date('2026-01-01T23:59:59'); // 731 days

  render(<GoogleAdsPage websiteId="site-1" />);

  await waitFor(() => expect(httpGet).toHaveBeenCalled());
  expect(screen.queryByText('Choose a shorter date range')).not.toBeInTheDocument();
});

test('asks for a shorter range instead of sending one Cloud would reject', () => {
  dateRange.startDate = new Date('2024-01-01T00:00:00');
  dateRange.endDate = new Date('2026-01-02T23:59:59'); // 732 days

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(screen.getByText('Choose a shorter date range')).toBeInTheDocument();
  expect(screen.getByTestId('controls')).toBeInTheDocument();
  expect(httpGet).not.toHaveBeenCalled();
});
