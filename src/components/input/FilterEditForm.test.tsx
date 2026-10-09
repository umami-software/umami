import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { FilterEditForm } from './FilterEditForm';

const mockUseNavigation = vi.fn();

vi.mock('@/components/hooks', () => ({
  useFilters: () => ({
    filters: [],
    eventPropertyFilters: [],
    sessionPropertyFilters: [],
  }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      fields: 'Fields',
      segments: 'Segments',
      cohorts: 'Cohorts',
      eventProperties: 'Event Properties',
      sessionData: 'Session Properties',
      reset: 'Reset',
      cancel: 'Cancel',
      apply: 'Apply',
    },
  }),
  useMobile: () => ({ isMobile: false }),
  useNavigation: () => mockUseNavigation(),
}));

vi.mock('@/components/input/FieldFilters', () => ({
  FieldFilters: () => <div>FieldFilters</div>,
}));

vi.mock('@/components/input/SegmentFilters', () => ({
  SegmentFilters: () => <div>SegmentFilters</div>,
}));

vi.mock('@/components/property-data/PropertyFilters', () => ({
  PropertyFilters: ({ source }: { source: string }) => <div>{`${source} PropertyFilters`}</div>,
}));

test('shows event and session property tabs on the events page', () => {
  mockUseNavigation.mockReturnValue({
    pathname: '/websites/test/events',
    query: {},
  });

  render(<FilterEditForm websiteId="test-website" />);

  expect(screen.getByRole('tab', { name: 'Event Properties' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Session Properties' })).toBeInTheDocument();
});

test('hides the event property tab outside the events page', () => {
  mockUseNavigation.mockReturnValue({
    pathname: '/websites/test/sessions',
    query: {},
  });

  render(<FilterEditForm websiteId="test-website" />);

  expect(screen.queryByRole('tab', { name: 'Event Properties' })).not.toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Session Properties' })).toBeInTheDocument();
});
