import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canUpdateTeam } from '@/permissions';
import { getTeam } from '@/queries/prisma';
import { GET } from './route';

vi.mock('@/lib/request', () => ({ parseRequest: vi.fn() }));
vi.mock('@/permissions', () => ({
  canDeleteTeam: vi.fn(),
  canUpdateTeam: vi.fn(),
  canViewTeam: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/queries/prisma', () => ({
  deleteTeam: vi.fn(),
  getTeam: vi.fn(),
  updateTeam: vi.fn(),
}));

const getAsMember = () =>
  GET(new Request('http://localhost/api/teams/team-1'), {
    params: Promise.resolve({ teamId: 'team-1' }),
  }).then(r => r.json());

beforeEach(() => {
  vi.mocked(parseRequest).mockResolvedValue({ auth: { user: { id: 'user-1' } } } as any);
  vi.mocked(getTeam).mockResolvedValue({ id: 'team-1', name: 'Team', accessCode: 'secret' } as any);
});

// The access code lets anyone join as a full member, so a view-only member reading it could
// leave and rejoin with write access to every team website.
test('members who cannot edit the team do not receive the access code', async () => {
  vi.mocked(canUpdateTeam).mockResolvedValue(false);

  const team = await getAsMember();

  expect(team).toEqual({ id: 'team-1', name: 'Team' });
});

test('owners and managers still receive the access code for the team settings form', async () => {
  vi.mocked(canUpdateTeam).mockResolvedValue(true);

  const team = await getAsMember();

  expect(team.accessCode).toBe('secret');
});
