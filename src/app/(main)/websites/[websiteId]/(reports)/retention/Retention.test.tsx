import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { Retention } from './Retention';

const mockData = [
  { date: '2026-10-01T00:00:00Z', day: 0, visitors: 3679 },
  { date: '2026-10-01T00:00:00Z', day: 1, percentage: 9.02 },
  { date: '2026-10-02T00:00:00Z', day: 0, visitors: 4120 },
  { date: '2026-10-02T00:00:00Z', day: 1, percentage: 8.5 },
];

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();

  return {
    ...actual,
    useRetentionQuery: () => ({
      data: mockData,
      isLoading: false,
      error: null,
    }),
    useLocale: () => ({ locale: 'en-US' }),
    useMessages: () => ({
      t: (value: string) => value,
      labels: {
        cohort: 'Cohort',
        day: 'Day',
      },
    }),
  };
});

test('renders cohort dates without shifting back to previous day for zone-shifted backend timestamps', () => {
  render(
    <Retention
      websiteId="website-1"
      startDate={new Date(2026, 9, 1)}
      endDate={new Date(2026, 9, 31)}
    />,
  );

  expect(screen.getByText('Oct 1, 2026')).toBeInTheDocument();
  expect(screen.getByText('Oct 2, 2026')).toBeInTheDocument();
  expect(screen.queryByText('Sep 30, 2026')).not.toBeInTheDocument();
  expect(screen.getByText('3.68k')).toBeInTheDocument();
  expect(screen.getByText('4.12k')).toBeInTheDocument();
  expect(screen.getByText('9.02%')).toBeInTheDocument();
  expect(screen.getByText('8.50%')).toBeInTheDocument();
});
