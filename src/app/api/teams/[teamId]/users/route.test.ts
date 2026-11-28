import { beforeEach, expect, test, vi } from 'vitest';
import { ROLES } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { canUpdateTeam } from '@/permissions';
import { createTeamUser, getTeamUser } from '@/queries/prisma';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canUpdateTeam: vi.fn(),
  canViewTeam: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  createTeamUser: vi.fn(),
  getTeamUser: vi.fn(),
  getTeamUsers: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canUpdateTeamMock = vi.mocked(canUpdateTeam);
const getTeamUserMock = vi.mocked(getTeamUser);
const createTeamUserMock = vi.mocked(createTeamUser);

const params = Promise.resolve({ teamId: 'team-1' });

beforeEach(() => {
  parseRequestMock.mockReset();
  canUpdateTeamMock.mockReset();
  getTeamUserMock.mockReset();
  createTeamUserMock.mockReset();

  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'admin-1' } },
    body: { userId: 'user-1', role: ROLES.teamMember },
    error: undefined,
  } as any);

  canUpdateTeamMock.mockResolvedValue(true);
  getTeamUserMock.mockResolvedValue(null);
});

test('POST adds user to team and returns 200 on success', async () => {
  const created = { id: 'tu-1', teamId: 'team-1', userId: 'user-1', role: ROLES.teamMember };
  createTeamUserMock.mockResolvedValue(created as any);

  const response = await POST(
    new Request('http://localhost/api/teams/team-1/users', { method: 'POST' }),
    { params },
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(created);
  expect(createTeamUserMock).toHaveBeenCalledWith('user-1', 'team-1', ROLES.teamMember);
});

test('POST returns 400 when getTeamUser finds existing membership', async () => {
  getTeamUserMock.mockResolvedValue({ id: 'tu-existing' } as any);

  const response = await POST(
    new Request('http://localhost/api/teams/team-1/users', { method: 'POST' }),
    { params },
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { message: 'User is already a member of the Team.' },
  });
  expect(createTeamUserMock).not.toHaveBeenCalled();
});

test('POST returns 400 on P2002 unique constraint race condition', async () => {
  createTeamUserMock.mockRejectedValue(
    Object.assign(new Error('Unique constraint'), { code: 'P2002' }),
  );

  const response = await POST(
    new Request('http://localhost/api/teams/team-1/users', { method: 'POST' }),
    { params },
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { message: 'User is already a member of the Team.' },
  });
});

test('POST rethrows non-P2002 errors instead of returning 400', async () => {
  createTeamUserMock.mockRejectedValue(new Error('Database connection failed'));

  await expect(
    POST(new Request('http://localhost/api/teams/team-1/users', { method: 'POST' }), { params }),
  ).rejects.toThrow('Database connection failed');
});
