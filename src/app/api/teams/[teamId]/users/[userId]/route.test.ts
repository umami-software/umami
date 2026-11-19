import { beforeEach, expect, test, vi } from 'vitest';
import { ROLES } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { canDeleteTeamUser, canUpdateTeam } from '@/permissions';
import { deleteTeamUser, getTeamUser, updateTeamUser } from '@/queries/prisma';
import { DELETE, POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canDeleteTeamUser: vi.fn(),
  canUpdateTeam: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  deleteTeamUser: vi.fn(),
  getTeamUser: vi.fn(),
  updateTeamUser: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canUpdateTeamMock = vi.mocked(canUpdateTeam);
const canDeleteTeamUserMock = vi.mocked(canDeleteTeamUser);
const getTeamUserMock = vi.mocked(getTeamUser);
const updateTeamUserMock = vi.mocked(updateTeamUser);
const deleteTeamUserMock = vi.mocked(deleteTeamUser);

beforeEach(() => {
  parseRequestMock.mockReset();
  canUpdateTeamMock.mockReset();
  canDeleteTeamUserMock.mockReset();
  getTeamUserMock.mockReset();
  updateTeamUserMock.mockReset();
  deleteTeamUserMock.mockReset();
});

test('POST rejects a manager modifying the team owner role', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'manager-id',
        isAdmin: false,
      },
    },
    body: {
      role: ROLES.teamViewOnly,
    },
    error: undefined,
  });
  canUpdateTeamMock.mockResolvedValue(true);
  getTeamUserMock
    .mockResolvedValueOnce({
      id: 'target-team-user',
      role: ROLES.teamOwner,
    } as any)
    .mockResolvedValueOnce({
      id: 'actor-team-user',
      role: ROLES.teamManager,
    } as any);

  const response = await POST(new Request('http://localhost/api/teams/team-1/users/owner-id', { method: 'POST' }), {
    params: Promise.resolve({ teamId: 'team-1', userId: 'owner-id' }),
  });

  expect(response.status).toBe(401);
  expect(updateTeamUserMock).not.toHaveBeenCalled();
});

test('DELETE rejects a manager removing the team owner', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'manager-id',
        isAdmin: false,
      },
    },
    error: undefined,
  });
  canDeleteTeamUserMock.mockResolvedValue(true);
  getTeamUserMock.mockResolvedValue({
    id: 'owner-team-user',
    role: ROLES.teamOwner,
  } as any);

  const response = await DELETE(
    new Request('http://localhost/api/teams/team-1/users/owner-id', { method: 'DELETE' }),
    {
      params: Promise.resolve({ teamId: 'team-1', userId: 'owner-id' }),
    },
  );

  expect(response.status).toBe(401);
  expect(deleteTeamUserMock).not.toHaveBeenCalled();
});

test('DELETE rejects owner self-removal to prevent orphaning the team', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'owner-id',
        isAdmin: false,
      },
    },
    error: undefined,
  });
  canDeleteTeamUserMock.mockResolvedValue(true);
  getTeamUserMock.mockResolvedValue({
    id: 'owner-team-user',
    role: ROLES.teamOwner,
  } as any);

  const response = await DELETE(
    new Request('http://localhost/api/teams/team-1/users/owner-id', { method: 'DELETE' }),
    {
      params: Promise.resolve({ teamId: 'team-1', userId: 'owner-id' }),
    },
  );

  expect(response.status).toBe(401);
  expect(deleteTeamUserMock).not.toHaveBeenCalled();
});
