import { beforeEach, expect, test, vi } from 'vitest';
import { getBoardEntityIds } from '@/lib/boards';
import { ENTITY_TYPE } from '@/lib/constants';
import { createToken } from '@/lib/jwt';
import { canViewWebsite } from '@/permissions';
import { getBoard, getLink, getPixel, getShareByCode, getUser, getWebsite } from '@/queries/prisma';
import { GET } from './route';

vi.mock('@/lib/boards', () => ({ getBoardEntityIds: vi.fn() }));
vi.mock('@/lib/crypto', () => ({ secret: () => 'app-secret' }));
vi.mock('@/lib/jwt', () => ({ createToken: vi.fn(() => 'share-token') }));
vi.mock('@/lib/redis', () => ({ default: { enabled: false } }));
vi.mock('@/lib/prisma', () => ({
  default: { client: { teamUser: { findFirst: vi.fn().mockResolvedValue(null) } } },
}));
vi.mock('@/permissions', () => ({
  canViewWebsite: vi.fn(),
  canViewPixel: vi.fn(),
  canViewLink: vi.fn(),
}));
vi.mock('@/queries/prisma', () => ({
  getBoard: vi.fn(),
  getLink: vi.fn(),
  getPixel: vi.fn(),
  getShareByCode: vi.fn(),
  getUser: vi.fn(),
  getWebsite: vi.fn(),
}));

const entities: Record<string, { userId?: string | null; teamId?: string | null }> = {
  'team-site': { teamId: 'team-1', userId: null },
  'member-site': { teamId: null, userId: 'member-1' },
  'other-team-site': { teamId: 'team-2', userId: null },
  'team-pixel': { teamId: 'team-1' },
  'member-pixel': { userId: 'member-1' },
  'team-link': { teamId: 'team-1' },
  'member-link': { userId: 'member-1' },
};

async function mintBoardShare(board: Record<string, any>) {
  vi.mocked(getShareByCode).mockResolvedValue({
    id: 'share-1',
    shareType: ENTITY_TYPE.board,
    entityId: 'board-1',
    parameters: {},
  } as any);
  vi.mocked(getBoard).mockResolvedValue({
    id: 'board-1',
    type: 'dashboard',
    parameters: {},
    ...board,
  } as any);

  await GET(new Request('http://localhost/api/share/slug'), {
    params: Promise.resolve({ slug: 'slug' }),
  });

  return vi.mocked(createToken).mock.calls[0][0] as Record<string, any>;
}

beforeEach(() => {
  vi.clearAllMocks();
  const lookup = async (id: string) => entities[id] ?? null;
  vi.mocked(getWebsite).mockImplementation(lookup as any);
  vi.mocked(getPixel).mockImplementation(lookup as any);
  vi.mocked(getLink).mockImplementation(lookup as any);
  vi.mocked(getBoardEntityIds).mockReturnValue({
    websiteIds: ['team-site', 'member-site', 'other-team-site'],
    pixelIds: ['team-pixel', 'member-pixel'],
    linkIds: ['team-link', 'member-link'],
  } as any);
});

test("a team board share excludes members' personal entities", async () => {
  // Any member who can edit the board can create a share, including members who cannot view a
  // teammate's personal website, so only entities the team owns may be exposed publicly.
  const token = await mintBoardShare({ teamId: 'team-1', userId: null });

  expect(token.websiteIds).toEqual(['team-site']);
  expect(token.pixelIds).toEqual(['team-pixel']);
  expect(token.linkIds).toEqual(['team-link']);
});

test('a personal board share still includes what its owner can view', async () => {
  vi.mocked(getUser).mockResolvedValue({ id: 'member-1', username: 'm', role: 'user' } as any);
  vi.mocked(canViewWebsite).mockImplementation(async (_auth, id) => id === 'member-site');

  const token = await mintBoardShare({ teamId: null, userId: 'member-1' });

  expect(token.websiteIds).toEqual(['member-site']);
});
