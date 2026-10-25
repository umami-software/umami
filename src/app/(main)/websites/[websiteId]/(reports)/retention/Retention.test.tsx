import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { Retention } from './Retention';

const mockData = [
  { date: '2026-10-01T00:00:00Z', day: 0, visitors: 3679 },
  { date: '2026-10-01T00:00:00Z', day: 1, percentage: 9.02 },
  { date: '2026-10-02T00:00:00Z', day: 0, visitors: 4120 },
  { date: '2026-10-02T00:00:00Z', day: 1, percentage: 8.5 },
  // Cohort near endDate (Oct 31): maxDay should be 31 - 30 = 1 day
  { date: '2026-10-30T00:00:00Z', day: 0, visitors: 500 },
  { date: '2026-10-30T00:00:00Z', day: 1, percentage: 15.0 },
  { date: '2026-10-30T00:00:00Z', day: 2, percentage: 5.0 },
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

let savedTz: string | undefined;

beforeEach(() => {
  savedTz = process.env.TZ;
  process.env.TZ = 'America/New_York';
});

afterEach(() => {
  process.env.TZ = savedTz;
});

test('renders cohort dates and respects maxDay in timezones west of UTC', () => {
  render(
    <Retention
      websiteId="website-1"
      startDate={new Date(2026, 9, 1)}
      endDate={new Date(2026, 9, 31)}
    />,
  );

  // Cohort date headers should not be shifted back to Sep 30 or Oct 29 under America/New_York
  expect(screen.getByText('Oct 1, 2026')).toBeInTheDocument();
  expect(screen.getByText('Oct 2, 2026')).toBeInTheDocument();
  expect(screen.getByText('Oct 30, 2026')).toBeInTheDocument();
  expect(screen.queryByText('Sep 30, 2026')).not.toBeInTheDocument();
  expect(screen.queryByText('Oct 29, 2026')).not.toBeInTheDocument();

  // Visitors formatting
  expect(screen.getByText('3.68k')).toBeInTheDocument();
  expect(screen.getByText('4.12k')).toBeInTheDocument();
  expect(screen.getByText('500')).toBeInTheDocument();

  // Retention percentages
  expect(screen.getByText('9.02%')).toBeInTheDocument();
  expect(screen.getByText('8.50%')).toBeInTheDocument();

  // maxDay check: Oct 30 cohort has maxDay = 1 (Oct 31 - Oct 30), so Day 1 (15.00%) renders, but Day 2 is > maxDay and must not render
  expect(screen.getByText('15.00%')).toBeInTheDocument();
  expect(screen.queryByText('5.00%')).not.toBeInTheDocument();
});
