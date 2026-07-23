/**
 * @vitest-environment-options { "url": "http://localhost:4317/" }
 */
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { HttpResponse, http, server } from '@/test/msw/server';
import { render, screen, waitFor, within } from '@/test/render';
import { TeamInvitationsPanel } from './TeamInvitationsPanel';

const TEAM_ID = 'team-1';
const LIST_URL = `/api/teams/${TEAM_ID}/invites`;
const BASE_PATH_LIST_URL = `/analytics${LIST_URL}`;
const CREATED_INVITE = {
  id: 'created-invite',
  teamId: TEAM_ID,
  issuerId: 'owner-1',
  role: 'team-view-only',
  expiresAt: '2099-02-01T00:00:00.000Z',
  revokedAt: null,
  usedAt: null,
  usedBy: null,
  createdAt: '2030-01-01T00:00:00.000Z',
  token: 'issuer-only-token',
};

function invite(overrides: Record<string, unknown>) {
  return {
    id: 'invite',
    teamId: TEAM_ID,
    issuerId: 'owner-1',
    role: 'team-member',
    expiresAt: '2099-01-01T00:00:00.000Z',
    revokedAt: null,
    usedAt: null,
    usedBy: null,
    createdAt: '2030-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

describe('TeamInvitationsPanel', () => {
  test('creates the selected role and expiry and copies a port- and base-path-safe link on request', async () => {
    let createBody: unknown;
    vi.stubEnv('basePath', '/analytics');

    server.use(
      http.get(BASE_PATH_LIST_URL, () => HttpResponse.json({ data: [] })),
      http.post(BASE_PATH_LIST_URL, async ({ request }) => {
        createBody = await request.json();
        return HttpResponse.json(CREATED_INVITE);
      }),
    );

    const { user } = render(<TeamInvitationsPanel teamId={TEAM_ID} />, {
      route: `/settings/teams/${TEAM_ID}`,
    });
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');

    await user.click(await screen.findByRole('button', { name: 'Create invitation' }));
    const dialog = screen.getByRole('dialog', { name: 'Create invitation' });

    await user.click(within(dialog).getByLabelText('Role'));
    await user.click(screen.getByRole('option', { name: 'View only' }));
    await user.click(within(dialog).getByLabelText('Expires in'));
    await user.click(screen.getByRole('option', { name: '30 days' }));
    await user.click(within(dialog).getByRole('button', { name: 'Create invitation' }));

    const expectedUrl = `${window.location.origin}/analytics/invite#invite=issuer-only-token`;
    const link = await screen.findByRole('textbox', { name: 'Invitation link' });

    expect(createBody).toEqual({ role: 'team-view-only', expiresInDays: 30 });
    expect(link).toHaveValue(expectedUrl);
    expect(writeText).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Copy invitation link' }));

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith(expectedUrl);
  });

  test('submits the visible default role and expiry without requiring a selection change', async () => {
    let createBody: unknown;

    server.use(
      http.get(LIST_URL, () => HttpResponse.json({ data: [] })),
      http.post(LIST_URL, async ({ request }) => {
        createBody = await request.json();
        return HttpResponse.json({ ...CREATED_INVITE, role: 'team-member' });
      }),
    );

    const { user } = render(<TeamInvitationsPanel teamId={TEAM_ID} />, {
      route: `/settings/teams/${TEAM_ID}`,
    });

    await user.click(await screen.findByRole('button', { name: 'Create invitation' }));
    const dialog = screen.getByRole('dialog', { name: 'Create invitation' });

    expect(within(dialog).getByLabelText('Role')).toHaveTextContent('Member');
    expect(within(dialog).getByLabelText('Expires in')).toHaveTextContent('7 days');

    await user.click(within(dialog).getByRole('button', { name: 'Create invitation' }));

    await screen.findByRole('textbox', { name: 'Invitation link' });
    expect(createBody).toEqual({ role: 'team-member', expiresInDays: 7 });
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  test('derives each invitation status and only allows an active invitation to be revoked', async () => {
    let activeWasRevoked = false;
    const getInvites = () => [
      invite({
        id: 'active-invite',
        role: 'team-member',
        revokedAt: activeWasRevoked ? '2030-01-02T00:00:00.000Z' : null,
      }),
      invite({
        id: 'used-invite',
        role: 'team-member',
        usedAt: '2030-01-02T00:00:00.000Z',
        usedBy: 'user-2',
      }),
      invite({
        id: 'expired-invite',
        role: 'team-view-only',
        expiresAt: '2000-01-01T00:00:00.000Z',
      }),
      invite({
        id: 'revoked-invite',
        role: 'team-view-only',
        revokedAt: '2030-01-02T00:00:00.000Z',
      }),
    ];

    server.use(
      http.get(LIST_URL, () => HttpResponse.json({ data: getInvites() })),
      http.delete(`${LIST_URL}/active-invite`, () => {
        activeWasRevoked = true;
        return HttpResponse.json({ ok: true });
      }),
    );

    const { user } = render(<TeamInvitationsPanel teamId={TEAM_ID} />, {
      route: `/settings/teams/${TEAM_ID}`,
    });

    expect(await screen.findByRole('row', { name: /Member Active/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Member Used/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /View only Expired/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /View only Revoked/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Revoke invitation' })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Revoke invitation' }));
    const confirmation = await screen.findByRole('dialog', { name: 'Revoke invitation' });
    await user.click(within(confirmation).getByRole('button', { name: 'Revoke' }));

    await waitFor(() => {
      expect(screen.queryByRole('row', { name: /Member Active/ })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('row', { name: /Member Revoked/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revoke invitation' })).not.toBeInTheDocument();
  });
});
