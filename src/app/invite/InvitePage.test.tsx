import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { getClientAuthToken, setClientAuthToken } from '@/lib/client';
import { useApp } from '@/store/app';
import { HttpResponse, http, server } from '@/test/msw/server';
import { getTestRouter } from '@/test/navigation';
import { render, screen, waitFor } from '@/test/render';
import { InvitePage } from './InvitePage';

const INVITE_TOKEN = 'sensitive/+invite?token';
const INVITE_ROUTE = `/invite#invite=${encodeURIComponent(INVITE_TOKEN)}`;
const BASE_PATH_INVITE_ROUTE = `/analytics/invite?locale=de#invite=${encodeURIComponent(INVITE_TOKEN)}`;
const INVITE = {
  id: 'invite-1',
  teamId: 'team-1',
  teamName: 'Analytics Team',
  role: 'team-member',
  expiresAt: '2099-01-01T00:00:00.000Z',
};
const USER = {
  id: 'user-1',
  username: 'new-user',
  role: 'user',
  createdAt: '2030-01-01T00:00:00.000Z',
  isAdmin: false,
  teams: [{ id: 'team-1', name: 'Analytics Team', logoUrl: null }],
};

function getStoredValues(storage: Storage) {
  return Array.from({ length: storage.length }, (_, index) => {
    const key = storage.key(index);
    return key ? storage.getItem(key) : null;
  }).join('\n');
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useApp.setState({ user: null });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
  useApp.setState({ user: null });
  vi.unstubAllEnvs();
});

afterAll(() => server.close());

describe('InvitePage invitation handling', () => {
  test('scrubs the fragment without dropping the base path before inspecting its token as JSON', async () => {
    let inspectBody: unknown;
    let hashAtInspection: string | undefined;
    const replaceState = vi.spyOn(window.history, 'replaceState');
    vi.stubEnv('basePath', '/analytics');

    server.use(
      http.post('/analytics/api/teams/invites/inspect', async ({ request }) => {
        inspectBody = await request.json();
        hashAtInspection = window.location.hash;
        return HttpResponse.json(INVITE);
      }),
    );

    render(<InvitePage />, { route: BASE_PATH_INVITE_ROUTE });

    expect(await screen.findByText('Analytics Team')).toBeInTheDocument();
    expect(inspectBody).toEqual({ token: INVITE_TOKEN });
    expect(hashAtInspection).toBe('');
    expect(replaceState).toHaveBeenCalled();
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
      '/analytics/invite?locale=de',
    );
    expect(document.body).not.toHaveTextContent(INVITE_TOKEN);
    expect(getStoredValues(localStorage)).not.toContain(INVITE_TOKEN);
    expect(getStoredValues(sessionStorage)).not.toContain(INVITE_TOKEN);
  });

  test.each([
    {
      name: 'missing fragment',
      route: '/invite',
      expectedInspections: 0,
    },
    {
      name: 'rejected bearer token',
      route: INVITE_ROUTE,
      expectedInspections: 1,
    },
  ])('shows the same unavailable state for a $name', async ({ route, expectedInspections }) => {
    let inspections = 0;

    server.use(
      http.post('/api/teams/invites/inspect', () => {
        inspections += 1;
        return HttpResponse.json(
          {
            error: {
              message: 'Invalid invitation.',
              code: 'INVALID_TEAM_INVITE',
              status: 400,
            },
          },
          { status: 400 },
        );
      }),
    );

    render(<InvitePage />, { route });

    expect(
      await screen.findByRole('heading', { name: 'Invitation unavailable' }),
    ).toBeInTheDocument();
    expect(screen.getByText('This invitation can no longer be used.')).toBeInTheDocument();
    expect(inspections).toBe(expectedInspections);
    expect(document.body).not.toHaveTextContent(INVITE_TOKEN);
  });

  test('registers a new account, persists returned authentication, and opens the joined team', async () => {
    let registrationBody: unknown;

    server.use(
      http.post('/api/teams/invites/inspect', () => HttpResponse.json(INVITE)),
      http.post('/api/teams/invites/register', async ({ request }) => {
        registrationBody = await request.json();
        return HttpResponse.json({
          token: 'registration-session',
          user: USER,
          team: { id: 'team-1', name: 'Analytics Team' },
          membership: {
            id: 'membership-1',
            teamId: 'team-1',
            userId: 'user-1',
            role: 'team-member',
          },
        });
      }),
    );

    const { user } = render(<InvitePage />, { route: INVITE_ROUTE });
    const router = getTestRouter();

    await screen.findByText('Analytics Team');
    await user.click(screen.getByRole('tab', { name: 'Create account' }));
    await user.type(screen.getByLabelText('Username'), 'new-user');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple{Enter}');

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/teams/team-1'));
    expect(registrationBody).toEqual({
      token: INVITE_TOKEN,
      username: 'new-user',
      password: 'correct horse battery staple',
    });
    expect(getClientAuthToken()).toBe('registration-session');
    expect(useApp.getState().user).toEqual(USER);
    expect(getStoredValues(localStorage)).not.toContain(INVITE_TOKEN);
    expect(getStoredValues(sessionStorage)).not.toContain(INVITE_TOKEN);
  });

  test('logs in an existing user before accepting with that session and opening the joined team', async () => {
    let loginBody: unknown;
    let acceptBody: unknown;
    let acceptAuthorization: string | null = null;
    const existingUser = { ...USER, username: 'existing-user', teams: [] };
    const acceptedUser = { ...existingUser, teams: USER.teams };

    server.use(
      http.post('/api/teams/invites/inspect', () => HttpResponse.json(INVITE)),
      http.post('/api/auth/login', async ({ request }) => {
        loginBody = await request.json();
        return HttpResponse.json({ token: 'login-session', user: existingUser });
      }),
      http.post('/api/teams/invites/accept', async ({ request }) => {
        acceptBody = await request.json();
        acceptAuthorization = request.headers.get('authorization');
        return HttpResponse.json({
          team: { id: 'team-1', name: 'Analytics Team' },
          user: acceptedUser,
          membership: {
            id: 'membership-2',
            teamId: 'team-1',
            userId: 'user-1',
            role: 'team-member',
          },
        });
      }),
    );

    const { user } = render(<InvitePage />, { route: INVITE_ROUTE });
    const router = getTestRouter();

    await screen.findByText('Analytics Team');
    await user.click(screen.getByRole('tab', { name: 'Sign in' }));
    await user.type(screen.getByLabelText('Username'), 'existing-user');
    await user.type(screen.getByLabelText('Password'), 'existing password');
    await user.click(screen.getByRole('button', { name: 'Sign in and join team' }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/teams/team-1'));
    expect(loginBody).toEqual({ username: 'existing-user', password: 'existing password' });
    expect(acceptBody).toEqual({ token: INVITE_TOKEN });
    expect(acceptAuthorization).toBe('Bearer login-session');
    expect(getClientAuthToken()).toBe('login-session');
    expect(useApp.getState().user).toEqual(acceptedUser);
    expect(getStoredValues(localStorage)).not.toContain(INVITE_TOKEN);
    expect(getStoredValues(sessionStorage)).not.toContain(INVITE_TOKEN);
  });

  test('restores a persisted session and accepts the invitation without asking for credentials', async () => {
    let verifyAuthorization: string | null = null;
    let acceptAuthorization: string | null = null;
    let acceptBody: unknown;
    const userBeforeAccepting = { ...USER, teams: [] };
    setClientAuthToken('persisted-session');

    server.use(
      http.post('/api/teams/invites/inspect', () => HttpResponse.json(INVITE)),
      http.post('/api/auth/verify', ({ request }) => {
        verifyAuthorization = request.headers.get('authorization');
        return HttpResponse.json(userBeforeAccepting);
      }),
      http.post('/api/teams/invites/accept', async ({ request }) => {
        acceptAuthorization = request.headers.get('authorization');
        acceptBody = await request.json();
        return HttpResponse.json({
          team: { id: 'team-1', name: 'Analytics Team' },
          user: USER,
          membership: {
            id: 'membership-3',
            teamId: 'team-1',
            userId: 'user-1',
            role: 'team-member',
          },
        });
      }),
    );

    const { user } = render(<InvitePage />, { route: INVITE_ROUTE });
    const router = getTestRouter();
    const joinButton = await screen.findByRole('button', { name: 'Join team' });

    expect(verifyAuthorization).toBe('Bearer persisted-session');
    expect(screen.queryByRole('tab', { name: 'Sign in' })).not.toBeInTheDocument();

    await user.click(joinButton);

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/teams/team-1'));
    expect(acceptBody).toEqual({ token: INVITE_TOKEN });
    expect(acceptAuthorization).toBe('Bearer persisted-session');
    expect(useApp.getState().user).toEqual(USER);
  });

  test('does not offer password forms when password authentication is disabled', async () => {
    server.use(http.post('/api/teams/invites/inspect', () => HttpResponse.json(INVITE)));

    render(<InvitePage passwordAuthDisabled />, { route: INVITE_ROUTE });

    expect(await screen.findByText('Analytics Team')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sign in through your configured authentication provider, then reopen this invitation link.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Create account' })).not.toBeInTheDocument();
  });

  test('offers credential flows when a persisted session cannot be verified', async () => {
    setClientAuthToken('expired-session');

    server.use(
      http.post('/api/teams/invites/inspect', () => HttpResponse.json(INVITE)),
      http.post('/api/auth/verify', () =>
        HttpResponse.json(
          {
            error: {
              message: 'Unauthorized.',
              code: 'unauthorized',
              status: 401,
            },
          },
          { status: 401 },
        ),
      ),
    );

    render(<InvitePage />, { route: INVITE_ROUTE });

    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Join team' })).not.toBeInTheDocument();
  });

  test('shows an actionable username error when invitation registration reports a conflict', async () => {
    server.use(
      http.post('/api/teams/invites/inspect', () => HttpResponse.json(INVITE)),
      http.post('/api/teams/invites/register', () =>
        HttpResponse.json(
          {
            error: {
              message: 'Username is unavailable.',
              code: 'USERNAME_UNAVAILABLE',
              status: 409,
            },
          },
          { status: 409 },
        ),
      ),
    );

    const { user } = render(<InvitePage />, { route: INVITE_ROUTE });

    await screen.findByText('Analytics Team');
    await user.click(screen.getByRole('tab', { name: 'Create account' }));
    await user.type(screen.getByLabelText('Username'), 'taken-user');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple{Enter}');

    expect(await screen.findByText('Username is unavailable.')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('USERNAME_UNAVAILABLE');
  });

  test('collapses an invalid invitation discovered during registration to the unavailable state', async () => {
    server.use(
      http.post('/api/teams/invites/inspect', () => HttpResponse.json(INVITE)),
      http.post('/api/teams/invites/register', () =>
        HttpResponse.json(
          {
            error: {
              message: 'Invalid invitation.',
              code: 'INVALID_TEAM_INVITE',
              status: 400,
            },
          },
          { status: 400 },
        ),
      ),
    );

    const { user } = render(<InvitePage />, { route: INVITE_ROUTE });

    await screen.findByText('Analytics Team');
    await user.click(screen.getByRole('tab', { name: 'Create account' }));
    await user.type(screen.getByLabelText('Username'), 'new-user');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple{Enter}');

    expect(
      await screen.findByRole('heading', { name: 'Invitation unavailable' }),
    ).toBeInTheDocument();
    expect(screen.getByText('This invitation can no longer be used.')).toBeInTheDocument();
  });
});
