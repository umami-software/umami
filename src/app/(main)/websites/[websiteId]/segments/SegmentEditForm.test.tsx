import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SegmentEditForm } from './SegmentEditForm';

const messages = new Proxy({}, { get: (_, key) => String(key) });
let mockSegment: Record<string, any>;

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: messages,
    messages,
    getErrorMessage: () => undefined,
  }),
  useUpdateQuery: () => ({
    mutateAsync: vi.fn(),
    error: undefined,
    isPending: false,
    touch: vi.fn(),
    toast: vi.fn(),
  }),
  useWebsiteSegmentQuery: () => ({ data: mockSegment }),
  useFields: () => ({ fields: [{ name: 'path', label: 'Path', group: 'page' }], groupLabels: [] }),
  useMobile: () => ({ isMobile: false }),
  useFormat: () => ({ formatValue: (value: string) => value }),
  useFilters: () => ({
    filters: [],
    fields: [{ name: 'path', label: 'Path' }],
    operators: [
      { name: 'eq', label: 'is', type: 'string' },
      { name: 'c', label: 'contains', type: 'string' },
    ],
  }),
  usePropertyFieldsQuery: () => ({ data: [], isLoading: false, error: undefined }),
  useWebsiteValuesQuery: () => ({ data: [], isLoading: false }),
}));

// Segments saved before session property filters existed have no `sessionPropertyFilters` key.
// Opening one used to throw "Cannot read properties of undefined (reading 'map')".
test.each([
  ['saved before session property filters existed', {}],
  ['saved with session property filters', { sessionPropertyFilters: [] }],
])('opens a segment %s', (_label, extra) => {
  mockSegment = {
    id: 'segment-1',
    name: 'Blog performance',
    type: 'segment',
    parameters: { filters: [{ name: 'path', value: '/blog', operator: 'c' }], ...extra },
  };

  render(<SegmentEditForm websiteId="website-1" segmentId="segment-1" />);

  expect(screen.getByDisplayValue('Blog performance')).toBeInTheDocument();
});
