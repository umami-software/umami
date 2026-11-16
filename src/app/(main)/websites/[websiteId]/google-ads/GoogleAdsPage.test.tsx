import { beforeEach, expect, test, vi } from 'vitest';
import { httpGet } from '@/lib/fetch';
import { render, screen, userEvent, waitFor } from '@/test/render';
import { GoogleAdsPage } from './GoogleAdsPage';

const subscription = vi.hoisted(() => ({
  current: { cloudMode: true, isLoading: false, hasFeature: (): boolean => true },
}));
const dateRange = vi.hoisted(() => ({ startDate: new Date(), endDate: new Date() }));
const comparison = vi.hoisted(() => ({
  startDate: new Date(),
  endDate: new Date(),
  hasComparison: true,
  isAllTime: false,
}));

vi.mock('@/lib/fetch', () => ({ httpGet: vi.fn() }));
vi.mock('@/components/hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('@/components/hooks')>()),
  useWebsite: () => ({ teamId: null }),
  useSubscription: () => subscription.current,
  useTimezone: () => ({ timezone: 'UTC' }),
  useDateRange: () => ({
    dateRange: { ...dateRange, unit: 'day' },
    dateCompare: { startDate: comparison.startDate, endDate: comparison.endDate },
    hasComparison: comparison.hasComparison,
    isAllTime: comparison.isAllTime,
  }),
}));
vi.mock('@/app/(main)/websites/[websiteId]/WebsiteControls', () => ({
  WebsiteControls: () => <div data-test="controls" />,
}));
vi.mock('./GoogleAdsChart', () => ({
  GoogleAdsChart: ({ rows, metric }: { rows: unknown[]; metric: string }) => (
    <div>
      {metric} chart: {rows.length} days
    </div>
  ),
}));

function row(overrides = {}) {
  return {
    key: 'key',
    name: 'name',
    parent: null,
    parentKey: null,
    matchType: null,
    status: null,
    type: null,
    cost: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    conversionsValue: 0,
    allConversions: 0,
    allConversionsValue: 0,
    ...overrides,
  };
}

/** Rows by dimension for the selected range; `previous` holds the comparison period's days. */
function respondWith(byDimension: Record<string, unknown[]>, currencyCode: string | null = 'EUR') {
  vi.mocked(httpGet).mockImplementation(async (_url, params) => {
    const { dimension, startDate } = params as { dimension: string; startDate: string };
    const key = startDate === '2025-12-25' ? 'previous' : dimension;

    return {
      ok: true,
      status: 200,
      data: { dimension, currencyCode, rows: byDimension[key] ?? [] },
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
  comparison.startDate = new Date('2025-12-25T00:00:00');
  comparison.endDate = new Date('2025-12-31T23:59:59');
  comparison.hasComparison = true;
  comparison.isAllTime = false;
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

  expect(await screen.findByText('cost chart: 2 days')).toBeInTheDocument();
  expect(screen.getByText('€30.00')).toBeInTheDocument(); // cost
  expect(screen.getByText('5.0%')).toBeInTheDocument(); // CTR: 10 / 200
  expect(screen.getByText('2.5')).toBeInTheDocument(); // fractional conversions
});

test('derives conversion ratios from the summed totals', async () => {
  respondWith({
    date: [
      row({ key: '2026-01-01', cost: 10, clicks: 4, conversions: 1.5, conversionsValue: 40 }),
      row({ key: '2026-01-02', cost: 20, clicks: 6, conversions: 1, conversionsValue: 56 }),
    ],
  });

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('conversions chart: 2 days')).toBeInTheDocument();
  expect(screen.getByText('€96.00')).toBeInTheDocument(); // conversion value
  expect(screen.getByText('€12.00')).toBeInTheDocument(); // cost per conversion: 30 / 2.5
  expect(screen.getByText('25.0%')).toBeInTheDocument(); // conversion rate: 2.5 / 10
  expect(screen.getByText('3.20x')).toBeInTheDocument(); // ROAS: 96 / 30
});

test('shows no ratio where there is nothing to divide by', async () => {
  respondWith({ date: [row({ key: '2026-01-01', impressions: 50 })] });

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('conversions chart: 1 days')).toBeInTheDocument();
  // Avg. CPC, cost per conversion, conversion rate and ROAS.
  expect(screen.getAllByText('–')).toHaveLength(4);
});

test('lists conversion actions with their category and all conversions', async () => {
  respondWith({
    conversion_action: [
      row({
        key: 'customers/1/conversionActions/2',
        name: 'Website visit',
        parent: 'PAGE_VIEW',
        conversions: 4100.5,
        conversionsValue: 4050,
        allConversions: 4192.24,
        allConversionsValue: 4127.33,
      }),
      row({
        key: 'customers/1/conversionActions/3',
        name: 'Purchase',
        parent: 'PURCHASE',
        allConversions: 9,
        allConversionsValue: 9,
      }),
    ],
  });

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('Website visit')).toBeInTheDocument();
  expect(screen.getByText('Page view')).toBeInTheDocument();
  expect(screen.getByText('4.19k')).toBeInTheDocument(); // all conversions
  expect(screen.getByText('€4.13k')).toBeInTheDocument(); // all conversions value
  expect(screen.getByText('Purchase', { selector: '[title="Purchase"]' })).toBeInTheDocument();
  expect(screen.getByText('€9.00')).toBeInTheDocument();
});

test('charts the metric of the card that was clicked', async () => {
  respondWith({ date: [row({ key: '2026-01-01', cost: 10, clicks: 4, impressions: 100 })] });
  const user = userEvent.setup();

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('cost chart: 1 days')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /CTR/ }));
  expect(screen.getByText('ctr chart: 1 days')).toBeInTheDocument();
  expect(screen.getByText('conversions chart: 1 days')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /ROAS/ }));
  expect(screen.getByText('roas chart: 1 days')).toBeInTheDocument();
});

test('shows the change from the comparison period', async () => {
  respondWith({
    date: [row({ key: '2026-01-01', cost: 30, clicks: 10, impressions: 100 })],
    previous: [row({ key: '2025-12-25', cost: 20, clicks: 10, impressions: 100 })],
  });

  render(<GoogleAdsPage websiteId="site-1" />);

  // Cost and Avg. CPC both rose by half; clicks, impressions and CTR did not move.
  await waitFor(() => expect(screen.getAllByText('50%')).toHaveLength(2));
  expect(httpGet).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ startDate: '2025-12-25', endDate: '2025-12-31', dimension: 'date' }),
  );
});

test('does not compare when the range is all time', async () => {
  comparison.isAllTime = true;
  respondWith({ date: [row({ key: '2026-01-01', cost: 30, clicks: 10 })] });

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('cost chart: 1 days')).toBeInTheDocument();
  expect(httpGet).not.toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ startDate: '2025-12-25' }),
  );
});

test('does not name a currency the account did not report', async () => {
  respondWith({ date: [row({ key: '2026-01-01', cost: 30, clicks: 2 })] }, null);

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

test("shows a campaign's type and any status other than enabled", async () => {
  respondWith({
    campaign: [
      row({ key: '1', name: 'Spring sale', type: 'SEARCH', status: 'ENABLED', impressions: 1 }),
      row({ key: '2', name: 'Old promo', type: 'PERFORMANCE_MAX', status: 'PAUSED' }),
    ],
  });

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('Spring sale')).toBeInTheDocument();
  expect(screen.getByText('Search')).toBeInTheDocument();
  expect(screen.getByText('Performance max · Paused')).toBeInTheDocument();
});

test('sorts by the clicked column and searches by name', async () => {
  respondWith({
    campaign: [
      row({ key: '1', name: 'Alpha', cost: 30, clicks: 1 }),
      row({ key: '2', name: 'Bravo', cost: 20, clicks: 9 }),
      row({ key: '3', name: 'Charlie', cost: 10, clicks: 5 }),
    ],
  });
  const user = userEvent.setup();
  const names = () =>
    screen.getAllByText(/^(Alpha|Bravo|Charlie)$/).map(element => element.textContent);

  render(<GoogleAdsPage websiteId="site-1" />);

  await screen.findByText('Alpha');
  expect(names()).toEqual(['Alpha', 'Bravo', 'Charlie']); // highest cost first

  // The Clicks card has the same name, so pick the column header by its pressed state.
  const clicksHeader = screen
    .getAllByRole('button', { name: 'Clicks' })
    .find(button => button.getAttribute('aria-pressed') === 'false');
  await user.click(clicksHeader);
  expect(names()).toEqual(['Bravo', 'Charlie', 'Alpha']);

  await user.type(screen.getByPlaceholderText('Search'), 'char');
  await waitFor(() => expect(names()).toEqual(['Charlie']));
});

test('pages through more rows than fit one page', async () => {
  respondWith({
    campaign: Array.from({ length: 25 }, (_, index) =>
      row({ key: String(index), name: `Campaign ${index + 1}`, cost: 100 - index }),
    ),
  });
  const user = userEvent.setup();

  render(<GoogleAdsPage websiteId="site-1" />);

  expect(await screen.findByText('Campaign 20')).toBeInTheDocument();
  expect(screen.queryByText('Campaign 21')).not.toBeInTheDocument();

  const pagerButtons = screen
    .getAllByRole('button')
    .filter(button => !button.textContent && !button.getAttribute('aria-pressed'));
  await user.click(pagerButtons[pagerButtons.length - 1]);

  expect(await screen.findByText('Campaign 21')).toBeInTheDocument();
  expect(screen.queryByText('Campaign 20')).not.toBeInTheDocument();
});

test("opens a campaign's ad groups, then an ad group's keywords, and clears the filter", async () => {
  respondWith({
    campaign: [row({ key: '11', name: 'Spring sale' })],
    ad_group: [row({ key: '22', name: 'Shoes', parent: 'Spring sale', parentKey: '11' })],
    keyword: [row({ key: '22~3', name: 'red shoes', parent: 'Shoes', parentKey: '22' })],
  });
  const user = userEvent.setup();
  const lastQuery = (dimension: string) =>
    vi
      .mocked(httpGet)
      .mock.calls.map(([, params]) => params as Record<string, unknown>)
      .filter(params => params.dimension === dimension)
      .at(-1);

  render(<GoogleAdsPage websiteId="site-1" />);

  await user.click(await screen.findByRole('button', { name: 'Spring sale' }));
  expect(await screen.findByRole('button', { name: 'Shoes' })).toBeInTheDocument();
  expect(lastQuery('ad_group')).toMatchObject({ campaignId: '11' });

  await user.click(screen.getByRole('button', { name: 'Shoes' }));
  expect(await screen.findByText('red shoes')).toBeInTheDocument();
  expect(lastQuery('keyword')).toMatchObject({ adGroupId: '22' });
  expect(lastQuery('keyword')).not.toHaveProperty('campaignId');

  await user.click(screen.getByTitle('Clear filter'));
  await waitFor(() => expect(lastQuery('keyword')).not.toHaveProperty('adGroupId'));
});

test('lists search terms with their ad group and landing pages by URL', async () => {
  respondWith({
    search_term: [row({ key: '22~buy red shoes', name: 'buy red shoes', parent: 'Shoes' })],
    landing_page: [row({ key: 'https://example.com/shoes', name: 'https://example.com/shoes' })],
  });
  const user = userEvent.setup();

  render(<GoogleAdsPage websiteId="site-1" />);

  await user.click(await screen.findByRole('tab', { name: 'Search terms' }));
  expect(await screen.findByText('buy red shoes')).toBeInTheDocument();
  expect(screen.getByText('Shoes')).toBeInTheDocument();

  await user.click(screen.getByRole('tab', { name: 'Landing pages' }));
  expect(await screen.findByText('https://example.com/shoes')).toBeInTheDocument();
});

test('names devices and networks the way Google Ads does', async () => {
  respondWith({
    device: [row({ key: 'MOBILE', name: 'MOBILE' }), row({ key: 'OTHER', name: 'OTHER' })],
    network: [
      row({ key: 'CONTENT', name: 'CONTENT' }),
      row({ key: 'GOOGLE_TV', name: 'GOOGLE_TV' }),
    ],
  });
  const user = userEvent.setup();

  render(<GoogleAdsPage websiteId="site-1" />);

  await user.click(await screen.findByRole('tab', { name: 'Devices' }));
  expect(await screen.findByText('Mobile phones')).toBeInTheDocument();
  expect(screen.getByText('Other')).toBeInTheDocument();

  await user.click(screen.getByRole('tab', { name: 'Networks' }));
  expect(await screen.findByText('Display Network')).toBeInTheDocument();
  // A value without a name of its own is still made readable.
  expect(screen.getByText('Google tv')).toBeInTheDocument();
});

test('narrows search terms to the campaign that was opened', async () => {
  respondWith({
    campaign: [row({ key: '11', name: 'Spring sale' })],
    search_term: [row({ key: '22~buy red shoes', name: 'buy red shoes', parent: 'Shoes' })],
  });
  const user = userEvent.setup();

  render(<GoogleAdsPage websiteId="site-1" />);

  await user.click(await screen.findByRole('button', { name: 'Spring sale' }));
  await user.click(screen.getByRole('tab', { name: 'Search terms' }));

  expect(await screen.findByText('buy red shoes')).toBeInTheDocument();
  expect(httpGet).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ dimension: 'search_term', campaignId: '11' }),
  );
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
