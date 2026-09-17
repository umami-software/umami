import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { AnnotationsModal } from './AnnotationsModal';

const mockUseWebsiteAnnotationsQuery = vi.fn();

vi.mock('@/components/charts/ChartAnnotationMarkers', () => ({
  formatAnnotationDate: () => '',
}));

vi.mock('@/components/hooks', () => ({
  useLocale: () => ({ locale: 'en-US' }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      addNote: 'Add note',
      all: 'All',
      current: 'Current',
      date: 'Date',
      dateRange: 'date range',
      note: 'Note',
      notes: 'Notes',
    },
    messages: {
      noDataAvailable: 'No data available',
    },
  }),
  useMobile: () => ({ isMobile: false }),
  useNavigation: () => ({ router: { push: vi.fn() }, updateParams: vi.fn() }),
  useShare: () => null,
  useTimezone: () => ({ localFromUtc: (date: Date) => date }),
  useWebsiteAnnotationsQuery: (...args: unknown[]) => mockUseWebsiteAnnotationsQuery(...args),
}));

vi.mock('@/components/input/FilterButtons', () => ({
  FilterButtons: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange('all')}>
      All notes
    </button>
  ),
}));

beforeEach(() => {
  mockUseWebsiteAnnotationsQuery.mockClear();
  mockUseWebsiteAnnotationsQuery.mockReturnValue({ data: { data: [], count: 0 }, isLoading: false });
});

test('defaults to the supplied date range and can show all notes', async () => {
  const { user } = render(
    <AnnotationsModal websiteId="website-1" range={{ startAt: 1000, endAt: 2000 }} />,
  );

  expect(mockUseWebsiteAnnotationsQuery).toHaveBeenLastCalledWith('website-1', {
    page: 1,
    pageSize: 20,
    startAt: 1000,
    endAt: 2000,
  });

  await user.click(screen.getByRole('button', { name: 'All notes' }));

  expect(mockUseWebsiteAnnotationsQuery).toHaveBeenLastCalledWith('website-1', {
    page: 1,
    pageSize: 20,
  });
});
