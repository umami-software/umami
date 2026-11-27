import { act, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { MetricsExpandedTable } from './MetricsExpandedTable';

const mocks = vi.hoisted(() => ({ query: null as any, searches: [] as (string | undefined)[] }));

vi.mock('@/components/hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('@/components/hooks')>()),
  useWebsiteExpandedMetricsQuery: (_websiteId: string, params: any) => {
    mocks.searches.push(params.search);
    return mocks.query;
  },
}));

beforeEach(() => {
  mocks.query = { data: undefined, isLoading: false, isFetching: false, error: null };
  mocks.searches = [];
});

afterEach(() => {
  vi.useRealTimers();
});

test('keeps every typed character and searches once typing pauses', () => {
  // The box must show keystrokes immediately; only the query waits for the debounce.
  vi.useFakeTimers();
  mocks.query = { data: [], isLoading: false, isFetching: false, error: null };
  render(<MetricsExpandedTable websiteId="website-1" type="path" allowDownload={false} />);
  const input = screen.getByRole('searchbox');

  for (const value of ['p', 'pr', 'pri']) {
    fireEvent.change(input, { target: { value } });
  }

  expect(input).toHaveValue('pri');
  expect(mocks.searches).not.toContain('p');

  act(() => vi.advanceTimersByTime(300));

  expect(mocks.searches.at(-1)).toBe('pri');
  expect(mocks.searches).not.toContain('pr');
});

test('shows placeholder rows under the table headers while loading', () => {
  // The headers stay put so the page does not jump when the rows arrive.
  mocks.query = { data: undefined, isLoading: true, isFetching: true, error: null };
  const { container } = render(
    <MetricsExpandedTable websiteId="website-1" type="path" title="Path" allowDownload={false} />,
  );

  expect(screen.getByText('Path')).toBeInTheDocument();
  expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
});

test('shows the rows once loaded', () => {
  mocks.query = {
    data: [{ name: '/pricing', visitors: 5, visits: 6, pageviews: 7 }],
    isLoading: false,
    isFetching: false,
    error: null,
  };
  const { container } = render(
    <MetricsExpandedTable websiteId="website-1" type="path" title="Path" allowDownload={false} />,
  );

  expect(screen.getByText('7')).toBeInTheDocument();
  expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(0);
});
