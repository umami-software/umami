import { expect, test, vi } from 'vitest';
import { getUserTeams } from './team';

const { pagedQueryMock } = vi.hoisted(() => ({ pagedQueryMock: vi.fn() }));

vi.mock('@/lib/prisma', () => ({
  default: { getSearchParameters: () => ({}), pagedQuery: pagedQueryMock },
}));
vi.mock('@/lib/redis', () => ({ default: { enabled: false } }));
vi.mock('./website', () => ({ deleteWebsite: vi.fn() }));

const team = (id: string, role: string) => ({
  id,
  name: id,
  accessCode: `code-${id}`,
  members: [
    { userId: 'user-1', role },
    { userId: 'someone-else', role: 'team-owner' },
  ],
});

// The access code lets anyone join a team as a full member. A view-only member who reads it
// could leave and rejoin with more access, so only roles that can edit the team receive it.
test('getUserTeams only returns the access code to team owners and managers', async () => {
  pagedQueryMock.mockResolvedValue({
    data: [
      team('owned', 'team-owner'),
      team('managed', 'team-manager'),
      team('member', 'team-member'),
      team('viewer', 'team-view-only'),
    ],
    count: 4,
  });

  const { data } = await getUserTeams('user-1');
  const codes = Object.fromEntries(data.map((t: any) => [t.id, t.accessCode]));

  expect(codes).toEqual({
    owned: 'code-owned',
    managed: 'code-managed',
    member: undefined,
    viewer: undefined,
  });
  expect(data.find((t: any) => t.id === 'viewer')).not.toHaveProperty('accessCode');
});
