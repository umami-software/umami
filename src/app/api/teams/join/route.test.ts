import { beforeEach, expect, test, vi } from 'vitest';
import { ROLES } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { createTeamUser, findTeam, getTeamUser } from '@/queries/prisma';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  createTeamUser: vi.fn(),
  findTeam: vi.fn(),
  getTeamUser: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const findTeamMock = vi.mocked(findTeam);
const getTeamUserMock = vi.mocked(getTeamUser);
const createTeamUserMock = vi.mocked(createTeamUser);

beforeEach(() => {
  parseRequestMock.mockReset();
  findTeamMock.mockReset();
  getTeamUserMock.mockReset();
  createTeamUserMock.mockReset();

  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { accessCode: 'join-code' },
    error: undefined,
  } as any);

  findTeamMock.mockResolvedValue({ id: 'team-1', accessCode: 'join-code' } as any);
  getTeamUserMock.mockResolvedValue(null);
});

test('POST joins team and returns 200 on success', async () => {
  const created = { id: 'tu-1', teamId: 'team-1', userId: 'user-1', role: ROLES.teamMember };
  createTeamUserMock.mockResolvedValue(created as any);

  const response = await POST(new Request('http://localhost/api/teams/join', { method: 'POST' }));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(created);
  expect(createTeamUserMock).toHaveBeenCalledWith('user-1', 'team-1', ROLES.teamMember);
});

test('POST returns 400 when getTeamUser finds existing membership', async () => {
  getTeamUserMock.mockResolvedValue({ id: 'tu-existing' } as any);

  const response = await POST(new Request('http://localhost/api/teams/join', { method: 'POST' }));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { message: 'User is already a team member.' },
  });
  expect(createTeamUserMock).not.toHaveBeenCalled();
});

test('POST returns 400 on P2002 unique constraint race condition', async () => {
  createTeamUserMock.mockRejectedValue(
    Object.assign(new Error('Unique constraint'), { code: 'P2002' }),
  );

  const response = await POST(new Request('http://localhost/api/teams/join', { method: 'POST' }));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { message: 'User is already a team member.' },
  });
});

test('POST rethrows non-P2002 errors instead of returning 400', async () => {
  createTeamUserMock.mockRejectedValue(new Error('Database connection failed'));

  await expect(
    POST(new Request('http://localhost/api/teams/join', { method: 'POST' })),
  ).rejects.toThrow('Database connection failed');
});
