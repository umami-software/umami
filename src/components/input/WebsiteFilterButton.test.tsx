import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/render';
import { WebsiteFilterButton } from './WebsiteFilterButton';

const updateParams = vi.fn((params: Record<string, unknown>) => params);
const push = vi.fn();
let query: Record<string, string | undefined> = {};

vi.mock('@/components/hooks', () => ({
  useFilters: () => ({ filters: [] }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: { filter: 'Filter', excludeBounce: 'Exclude bounce' },
  }),
  useMobile: () => ({ isMobile: false }),
  useNavigation: () => ({
    updateParams,
    pathname: '/teams/team-1/websites/website-1',
    router: { push },
    query,
  }),
}));

vi.mock('@/components/input/FilterEditForm', () => ({
  FilterEditForm: ({
    onChange,
    onClose,
  }: {
    onChange: (data: any) => void;
    onClose: () => void;
  }) => (
    <>
      <button type="button" onClick={() => onChange({ filters: [] })}>
        Apply
      </button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </>
  ),
}));

vi.mock('@/components/input/VisitDurationFilter', () => ({
  VisitDurationFilter: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange: (v?: string) => void;
  }) => (
    <button type="button" onClick={() => onChange('60')}>
      {`duration:${value ?? 'all'}`}
    </button>
  ),
}));

beforeEach(() => {
  query = {};
  updateParams.mockClear();
  push.mockClear();
});

test('applies the chosen minimum visit duration', async () => {
  const user = userEvent.setup();
  render(<WebsiteFilterButton websiteId="website-1" />);

  await user.click(screen.getByRole('button', { name: 'Filter' }));
  await user.click(await screen.findByRole('button', { name: 'duration:all' }));
  await user.click(screen.getByRole('button', { name: 'Apply' }));

  expect(updateParams).toHaveBeenCalledWith(expect.objectContaining({ minVisitDuration: '60' }));
});

test('discards a duration chosen in a canceled dialog', async () => {
  const user = userEvent.setup();
  render(<WebsiteFilterButton websiteId="website-1" />);

  await user.click(screen.getByRole('button', { name: 'Filter' }));
  await user.click(await screen.findByRole('button', { name: 'duration:all' }));
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Apply' })).toBeNull());

  await user.click(screen.getByRole('button', { name: 'Filter' }));
  expect(await screen.findByRole('button', { name: 'duration:all' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Apply' }));

  expect(updateParams).toHaveBeenCalledWith(
    expect.objectContaining({ minVisitDuration: undefined }),
  );
});

test('starts from the duration already in the URL', async () => {
  query = { minVisitDuration: '180' };
  const user = userEvent.setup();
  render(<WebsiteFilterButton websiteId="website-1" />);

  await user.click(screen.getByRole('button', { name: 'Filter' }));

  expect(await screen.findByRole('button', { name: 'duration:180' })).toBeInTheDocument();
});
