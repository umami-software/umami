import { act } from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { setUser, useApp } from '@/store/app';
import { render, waitFor } from '@/test/render';
import { TeamsButton } from './TeamsButton';

const post = vi.fn();
const modifiedState = vi.hoisted(() => ({ value: undefined as number | undefined }));

const initialUser = {
  id: 'user-1',
  username: 'admin',
  teams: [{ id: 'team-1', name: 'Team One' }],
};

vi.mock('@/components/hooks', async () => {
  const { useApp } = await import('@/store/app');

  return {
    useApi: () => ({ post }),
    useLoginQuery: () => ({ user: useApp(state => state.user) }),
    useMessages: () => ({
      t: (value: string) => value,
      labels: { myAccount: 'My account', teams: 'Teams' },
    }),
    useMobile: () => ({ isPhone: false }),
    useModified: () => ({ modified: modifiedState.value }),
    useNavigation: () => ({ teamId: undefined, router: { push: vi.fn() } }),
  };
});

beforeEach(() => {
  post.mockReset();
  modifiedState.value = undefined;
  setUser(initialUser);
});

test('does not reload the user teams on first render', () => {
  render(<TeamsButton />);

  expect(post).not.toHaveBeenCalled();
});

test('reloads the user teams when teams are modified', async () => {
  const teams = [...initialUser.teams, { id: 'team-2', name: 'Team Two' }];
  post.mockResolvedValue({ ...initialUser, teams });

  const { rerender } = render(<TeamsButton />);

  modifiedState.value = Date.now();
  act(() => rerender(<TeamsButton />));

  expect(post).toHaveBeenCalledWith('/auth/verify');
  await waitFor(() => expect((useApp.getState().user as any).teams).toEqual(teams));
});

test('keeps the current user and teams when the reload fails', async () => {
  post.mockRejectedValue(new Error('Network error'));

  const { rerender } = render(<TeamsButton />);

  modifiedState.value = Date.now();
  act(() => rerender(<TeamsButton />));

  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  expect(useApp.getState().user).toEqual(initialUser);
});
