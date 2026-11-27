import { describe, expect, test, vi } from 'vitest';
import { render, screen, within } from '@/test/render';
import { ReplaysTable } from './ReplaysTable';

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      session: 'Session',
      entry: 'Entry page',
      duration: 'Duration',
      actions: 'Actions',
      location: 'Location',
      browser: 'Browser',
      os: 'OS',
      device: 'Device',
      recorded: 'Recorded',
    },
  }),
  useFormat: () => ({ formatValue: (value: string) => value }),
  useNavigation: () => ({ router: { push: vi.fn() }, updateParams: () => '/replays' }),
  useTimezone: () => ({ formatTimezoneDate: (date: string) => date }),
  useLocale: () => ({ dateLocale: undefined }),
}));

vi.mock('@/store/replays', () => ({ setReplays: vi.fn(), clearReplays: vi.fn() }));

const replay = {
  id: 'visit-1',
  sessionId: 'session-1',
  websiteId: 'website-1',
  browser: 'chrome',
  os: 'Mac OS',
  device: 'desktop',
  country: 'IT',
  city: 'Rome',
  eventCount: 42,
  chunkCount: 2,
  duration: 65000,
  createdAt: '2026-11-26T10:00:00Z',
};

describe('ReplaysTable', () => {
  test('shows the entry page path of each replay', () => {
    render(<ReplaysTable websiteId="website-1" data={[{ ...replay, entryPath: '/pricing' }]} />);

    expect(screen.getByText('Entry page')).toBeInTheDocument();
    expect(screen.getByText('/pricing')).toBeInTheDocument();
    expect(screen.getByTitle('/pricing')).toBeInTheDocument();
  });

  test('renders an empty cell when the visit has no pageview', () => {
    render(<ReplaysTable websiteId="website-1" data={[{ ...replay, entryPath: null }]} />);

    const headers = screen.getAllByRole('columnheader');
    const entryIndex = headers.findIndex(header => header.textContent === 'Entry page');
    const [row] = screen.getAllByRole('row').slice(1);
    const entryCell = within(row).getAllByRole('cell')[entryIndex];

    expect(entryIndex).toBeGreaterThan(-1);
    expect(entryCell).toBeEmptyDOMElement();
    expect(within(row).getByText('1:05')).toBeInTheDocument();
  });
});
