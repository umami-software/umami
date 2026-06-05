import { beforeEach, expect, test, vi } from 'vitest';
import { BOARD_TYPES } from '@/lib/boards';
import { canViewBoardEntities } from './board';
import { canViewLink } from './link';
import { canViewPixel } from './pixel';
import { canViewWebsite } from './website';

vi.mock('@/queries/prisma', () => ({
  getBoard: vi.fn(),
  getTeamUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {},
}));

vi.mock('./website', () => ({
  canViewWebsite: vi.fn(),
}));

vi.mock('./pixel', () => ({
  canViewPixel: vi.fn(),
}));

vi.mock('./link', () => ({
  canViewLink: vi.fn(),
}));

const auth = {
  user: {
    id: 'user-1',
    username: 'user',
    role: 'user',
    isAdmin: false,
  },
  shareToken: {
    websiteIds: ['victim-website-id'],
  },
};

beforeEach(() => {
  vi.mocked(canViewWebsite).mockReset();
  vi.mocked(canViewPixel).mockReset();
  vi.mocked(canViewLink).mockReset();
});

test('canViewBoardEntities validates board IDs with user auth only', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(true);

  await expect(
    canViewBoardEntities(auth, BOARD_TYPES.website, { websiteId: 'owned-website-id' }),
  ).resolves.toBe(true);

  expect(canViewWebsite).toHaveBeenCalledWith(
    {
      user: auth.user,
    },
    'owned-website-id',
  );
});

test('canViewBoardEntities rejects IDs not accessible to the user', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(false);

  await expect(
    canViewBoardEntities(auth, BOARD_TYPES.mixed, {
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'column-1',
              component: {
                type: 'WebsiteChart',
                entityType: 'website',
                entityId: 'victim-website-id',
              },
            },
          ],
        },
      ],
    }),
  ).resolves.toBe(false);
});
