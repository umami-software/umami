import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from '@/test/render';
import { TeamsButton } from './TeamsButton';

const refetch = vi.fn();
const modifiedState = vi.hoisted(() => ({ value: undefined as number | undefined }));

vi.mock('@/components/hooks', () => ({
  useLoginQuery: () => ({
    user: { username: 'admin', teams: [{ id: 'team-1', name: 'Team One' }] },
    refetch,
  }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: { myAccount: 'My account', teams: 'Teams' },
  }),
  useMobile: () => ({ isPhone: false }),
  useModified: () => ({ modified: modifiedState.value }),
  useNavigation: () => ({ teamId: undefined, router: { push: vi.fn() } }),
}));

beforeEach(() => {
  refetch.mockClear();
  modifiedState.value = undefined;
});

test('does not reload the user teams on first render', () => {
  render(<TeamsButton />);

  expect(refetch).not.toHaveBeenCalled();
});

test('reloads the user teams when teams are modified', () => {
  const { rerender } = render(<TeamsButton />);

  modifiedState.value = Date.now();
  act(() => rerender(<TeamsButton />));

  expect(refetch).toHaveBeenCalledTimes(1);
});
