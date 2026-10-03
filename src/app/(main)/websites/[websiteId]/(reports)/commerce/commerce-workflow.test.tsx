import { useMutation, useQuery } from '@tanstack/react-query';
import { beforeEach, expect, test, vi } from 'vitest';
import { commerceReportParametersSchema } from '@/lib/commerce-saved-reports';
import { getTestRouter } from '@/test/navigation';
import { render, screen, waitFor, within } from '@/test/render';
import { CommerceProducts } from './CommerceProducts';
import { CommerceReportsToolbar } from './CommerceReportsToolbar';
import { SavedCommerceReport } from './SavedCommerceReport';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), del: vi.fn() }));
vi.mock('@/components/hooks/useApi', () => ({ useApi: () => ({ ...api, useQuery, useMutation }) }));
vi.mock('./CommerceBaskets', () => ({ CommerceBaskets: () => null }));
vi.mock('@/components/hooks/useDateParameters', () => ({
  useDateParameters: () => ({ startAt: 1000, endAt: 2000, timezone: 'UTC', unit: 'day' }),
}));
const parameters = commerceReportParametersSchema.parse({
  version: 1,
  type: 'products',
  currency: 'EUR',
  market: 'DE',
  minViews: 100,
  maxCartRate: 0.05,
  columns: ['views', 'addToCartRate'],
  date: { mode: 'rolling', days: 30 },
});
const report = {
  id: 'saved-report',
  name: 'Germany opportunities',
  websiteId: 'website',
  description: '',
  parameters,
};
beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.del.mockReset();
  api.get.mockImplementation(async (url: string) => {
    if (url.endsWith('/stats'))
      return {
        report,
        data: {
          data: [
            {
              productId: 'shirt',
              name: 'Shirt',
              category: 'Clothing',
              variant: '',
              views: 250,
              addToCartRate: 0.02,
            },
          ],
          count: 1,
          page: 1,
          pageSize: 20,
        },
      };
    if (url.endsWith('/reports')) return { data: [report] };
    return { data: [], count: 0, page: 1, pageSize: 20 };
  });
  api.post.mockResolvedValue(report);
});
test('the low-conversion preset sets reusable volume and rate filters', async () => {
  const { user } = render(
    <CommerceProducts
      websiteId="website"
      scope={{ currency: 'EUR' }}
      startDate={new Date(1000)}
      endDate={new Date(2000)}
      unit="day"
    />,
    { route: '/websites/website/commerce?tab=products' },
  );
  await user.click(screen.getByRole('button', { name: 'High views, low cart additions' }));
  const url = getTestRouter().replace.mock.calls[0][0];
  expect(url).toContain('minViews=100');
  expect(url).toContain('maxCartRate=0.05');
  expect(url).toContain('sort=views');
});
test('saves market, filters, columns and a relative date range through the form', async () => {
  const { user } = render(<CommerceReportsToolbar websiteId="website" currency="EUR" />, {
    route:
      '/websites/website/commerce?tab=products&market=DE&minViews=100&maxCartRate=0.05&columns=views,addToCartRate&date=30day&country=DE',
  });
  await user.click(screen.getByRole('button', { name: /^Save$/ }));
  const dialog = await screen.findByRole('dialog');
  await user.type(within(dialog).getByLabelText('Name'), 'Weekly opportunity report');
  await user.click(within(dialog).getByRole('button', { name: /^Save$/ }));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      '/websites/website/commerce/reports',
      expect.objectContaining({
        name: 'Weekly opportunity report',
        parameters: expect.objectContaining({
          market: 'DE',
          currency: 'EUR',
          minViews: 100,
          maxCartRate: 0.05,
          columns: ['views', 'addToCartRate'],
          filters: { country: 'DE' },
          date: { mode: 'rolling', days: 30 },
        }),
      }),
    ),
  );
  expect(getTestRouter().replace).toHaveBeenCalledWith(
    expect.stringContaining('savedReport=saved-report'),
  );
});
test('the saved view and board renderer display only saved columns and honor the date override', async () => {
  const { rerender } = render(<SavedCommerceReport websiteId="website" reportId="saved-report" />);
  expect(await screen.findByText('Germany opportunities')).toBeInTheDocument();
  expect(await screen.findByText('Shirt')).toBeInTheDocument();
  expect(screen.getByText('250')).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'Revenue' })).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/websites/website/commerce/reports/saved-report/stats', {
    page: 1,
  });
  rerender(<SavedCommerceReport websiteId="website" reportId="saved-report" dateMode="board" />);
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith('/websites/website/commerce/reports/saved-report/stats', {
      page: 1,
      startAt: 1000,
      endAt: 2000,
    }),
  );
});
