import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { FieldFilters } from './FieldFilters';

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: new Proxy({}, { get: (_, key) => String(key) }),
    messages: new Proxy({}, { get: (_, key) => String(key) }),
  }),
  useFields: () => ({ fields: [], groupLabels: [] }),
  useMobile: () => ({ isMobile: false }),
}));

vi.mock('@/components/common/Empty', () => ({
  Empty: ({ message }: { message: string }) => <div>{message}</div>,
}));

// Segments saved through the API, or by older versions, can have no `filters` array, and the
// segment edit form passes that straight through. This used to throw "reading 'map'".
test('renders the empty state when a saved segment has no filters', () => {
  render(<FieldFilters websiteId="website-1" />);

  expect(screen.getByText('nothingSelected')).toBeInTheDocument();
});
