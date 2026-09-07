import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SessionInfo } from './SessionInfo';

vi.mock('@/components/hooks', () => ({
  useFormat: () => ({ formatValue: (value: string) => value }),
  useLocale: () => ({ locale: 'en-US' }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      distinctId: 'Distinct ID',
      lastSeen: 'Last seen',
      firstSeen: 'First seen',
      country: 'Country',
      region: 'Region',
      city: 'City',
      browser: 'Browser',
      os: 'OS',
      device: 'Device',
    },
  }),
  useRegionNames: () => ({ getRegionName: (region: string) => region }),
}));

vi.mock('@/components/common/DateDistance', () => ({
  DateDistance: ({ date }: { date: Date }) => <span>{String(date)}</span>,
}));

vi.mock('@/components/common/TypeIcon', () => ({
  TypeIcon: () => null,
}));

function createSessionData(overrides = {}) {
  return {
    id: 'session-1',
    firstAt: new Date('2026-09-03T10:00:00.000Z'),
    lastAt: new Date('2026-09-04T10:00:00.000Z'),
    ...overrides,
  };
}

test('renders every identity linked to a colliding session, newest first', () => {
  render(
    <SessionInfo
      data={createSessionData({ distinctId: 'user-b', distinctIds: ['user-b', 'user-a'] })}
    />,
  );

  expect(screen.getByText('user-a')).toBeInTheDocument();
  expect(screen.getByText('user-b')).toBeInTheDocument();
});

test('renders the single distinctId unchanged when no list is provided', () => {
  render(<SessionInfo data={createSessionData({ distinctId: 'user-a' })} />);

  expect(screen.getByText('user-a')).toBeInTheDocument();
});
